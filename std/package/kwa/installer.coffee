import semver from '../semver.js'
import fs from '../../fs/mod.js'
import axios from 'npm://axios@0.18.0'
import Url from 'url'
import Path from 'path'
import Os from 'os'
import qs from 'querystring'
import Exception from '../../util/exception'
import Crypto from '../../util/crypto/mod.js'
import './register'
class Installer 
	constructor: ({module, version, url, key, password, machineid, projectName})->
		if url?.startsWith("gh/")
			parts = url.split("")
			url = "https://cdn.jsdelivr.net/#{url}"
			
		@url = url ? './'
		
		@module = module ? ''
		@key = key
		@machineid= machineid
		@version = version 
		@_locks = {}
		@projectName= projectName ? "default"


		@options= arguments[0]
	
	_sleep: (timeout = 100)->
		return new Promise (resolve)-> setTimeout resolve, timeout

	installInfo: (dir)->
		return @_install(dir, yes)
	
	install: (dir)->
		return @_install(dir, no)
	

	
	_install: (dir, _getinfo, _nolock)->
		if not _nolock
			await @_lock()
		try 
			info0= await @get()
			data= info0.data
			deps= []
			# create a imodules if not found 
			if not dir 
				dir= Path.join(Os.homedir(),"Kawix")
				if not fs.existsSync(dir)
					await fs.mkdirAsync(dir)
		
			imodules= Path.join(dir, "modules")
			modules = Path.join(dir, @projectName)
			if not fs.existsSync(imodules)
				fs.mkdirAsync(imodules)
			
			if not fs.existsSync(modules)
				fs.mkdirAsync(modules)

			if not data 
				throw Exception.create("Version #{@version} not found").putCode("VERSION_NOT_FOUND")
			
			if data.dependencies 
				for dep in data.dependencies
					arg1 = Object.assign {}, dep, 
						key: @key 
						machineid: @machineid 
					depInstaller= new Installer(arg1)
					deps.push(await depInstaller._install(dir, _getinfo, yes))

			modname= info0.name || data.name
			fileinfo= {}
			try
				fileinfo= await import(Path.join(imodules, modname + ".info.json"))

			if (fileinfo.versions?[info0.version]?.uploadid isnt data.uploadid) or (not data.ref and (data.type is "git"))
				if data.url or data.filename
					if data.type is "git"

						Git = await import("npm://isomorphic-git@0.54.2")
						Git.plugins.set('fs', fs)
						fname = Path.join imodules, modname + "." + info0.version 
						
						branches= null 
						clone= no
						try 
							branches= await Git.listBranches({ dir: fname, remote: 'origin' })
							if branches.length is 0 
								clone = yes
						catch 
							clone = yes 

						if clone 
							if _getinfo
								return 
									version: info0.version 
									id: data.uploadid
									url: data.url 
									type: data.type 
									needupdate: yes
									name: info0.name || data.name
							

							# Clone		
							await Git.clone 
								dir: fname
								url: data.url 
								username: data.credentials?.username 
								password: data.credentials?.password

							
						else 
							try 

								if data.ref 
									await Git.checkout
										ref: data.ref 
										dir: fname 
								else 
									throw 1
							catch 
								if _getinfo
									return 
										version: info0.version 
										id: data.uploadid
										url: data.url 
										type: data.type 
										needupdate: yes
										name: info0.name || data.name

							# git pull 
							await Git.pull 
								dir: fname 
								username: data.credentials?.username 
								password: data.credentials?.password
							
						if data.ref 
							await Git.checkout
								dir: fname 
								ref: data.ref

					else 
						if not @url.startsWith("http")
							if @module 
								a= Path.join @url, @module 
							else 
								a= @url
						else
							a= Url.resolve(@url, @module)


						a= Url.resolve a + "/", data.filename 
						u= data.url ? a 
						args= {}

						if @key 
							args.key= @key 
						if @machineid 
							args.machineid= @machineid 
							
						if a isnt u 
							args.original= a 
						u+= "?" + qs.stringify(args)
						
						if _getinfo 
							return 
								version: info0.version 
								id: data.uploadid
								url: u
								type: data.type 
								needupdate: yes
								name: info0.name || data.name

						
						try 
							response= await axios 
								method: 'GET'
								url: u
								responseType: 'stream'
						catch e 
							throw e
							#throw Exception.create(e.message + ": " + JSON.stringify(e.response?.data)).putCode("FAILED")
						def= {}
						def.promise= new Promise (a,b)->
							def.resolve= a 
							def.reject = b 
						
						try 
							fname1= Path.join imodules, modname + "." + info0.version  + ".kwa.0"
							fnamex= Path.join imodules, modname + "." + info0.version  + ".kwa.1"
							fname = Path.join imodules, modname + "." + info0.version  + ".kwa"
							st= fs.createWriteStream(fname1)
							st.on "error", def.reject 
							response.data.on "error", def.reject 
							st.on "finish", def.resolve 
							response.data.pipe st 
							await def.promise 

							
							if fs.existsSync(fname)
								await fs.unlinkAsync(fname)
							
							if data.crypt
								password= data.crypt?.password ? @options?.password
								if not password
									throw Exception.create("Content is encrypted. You need provide a password").putCode("CONTENT_ENCRYPTED")
								
								res = Crypto.decrypt	
									file: fname1
									outfile: fnamex
									password: password 

								def= {}
								def.promise= new Promise (a,b)->
									def.resolve=a
									def.reject= b 

								res.readStream.on "error", def.reject 
								res.unzip.on "error", def.reject
								res.writeStream.on "error", def.reject 
								res.writeStream.on "finish", def.resolve 
								await def.promise 

								await fs.unlinkAsync(fname1)
								await fs.renameAsync(fnamex, fname)

							else 
								await fs.renameAsync(fname1, fname)

						catch e 
							if fs.existsSync(fname1)
								await fs.unlinkAsync(fname1)
							throw e 
					
					

					try
						fileinfo= await KModule.import(Path.join(imodules, modname + ".info.json"), {
							force: true 
						})
					
					if data.type is "git"
						fname2= Path.join(modules, modname)
						if fs.existsSync(fname2)
							await fs.unlinkAsync(fname2)
						
						if Os.platform() == "win32"
							await fs.symlinkAsync(fname, fname2, "junction")
						else 
							await fs.symlinkAsync(fname, fname2)
						fileinfo.version= info0.version 

					else 
						fname2= Path.join(modules, modname + ".kwa")
						
							
						if Os.platform() == "win32"
							# windows es problemático con los enlaces simbólicos
							if fs.existsSync(fname2)
								await fs.unlinkAsync(fname2)
							await fs.copyFileAsync(fname, fname2)
							fileinfo.version= info0.version 
							
						else 
							# make a symlink 
							if fs.existsSync(fname2)
								await fs.unlinkAsync(fname2)
							await fs.symlinkAsync(fname, fname2)
							fileinfo.version= info0.version 
						
						try await import(fname2)

					fileinfo.versions= fileinfo.versions ? {}
					fileinfo.versions[info0.version] = data 

					# write the file 
					await fs.writeFileAsync(Path.join(imodules, modname + ".info.json"), JSON.stringify(fileinfo, null, '\t'))

				return 
					deps: deps 
					type: data.type 
					installed: fname 
					name: info0.name || data.name
					version: info0.version 
			else
				needupdate= no  
				if deps?.length
					needupdate= deps.filter (a)-> a.needupdate  
					needupdate= needupdate.length > 0 

				return 
					needupdate: needupdate
					type: data.type 
					installed: null 
					version: info0.version 
					name: info0.name || data.name
					localversion: fileinfo.version  
		catch e
			throw e 
		finally 
			if not _nolock
				await @_unlock()

	get: ()->
		# get the best version available 
		try 
			u= @url
			m= "#{u}#{@module}/info.json"
			info= await KModule.import m, 
				force: yes
			versions= Object.keys(info.versions)
		catch e 
			throw new Error("Module #{u}#{@module} not found: #{e.message}")

		versions.sort (a,b)-> 
			if a > b then -1 else (if a < b then 1 else 0)

		resolved= ''
		for version in versions 
			if @version is "latest" or (@version is "*")
				resolved= version
				break 
			
			if semver.satisfies(version, @version || "*")
				resolved= version
				break 

		return 
			version: resolved
			data: info.versions[resolved]
			name: info.name
	

	_lock: (timeout = 30000)->
		dir= Path.join(Os.homedir(),"Kawix")
		if not fs.existsSync(dir)
			await fs.mkdirAsync(dir)
		file= Path.join(dir, "install.lock")

		time= Date.now()

		if @_locks[file]
			throw new Error("Failed getting exclusive access for requiring")


		try
			while true
				if Date.now() - time > timeout
					throw new Error("Timedout getting exclusive access for requiring")


				try
					await fs.mkdirAsync(file)
					good= yes
				catch e
					try
						stat= await fs.statAsync(file)
						if stat
							if Date.now() - stat.mtimeMs > 10000
								try await fs.rmdirAsync(file)
							else
								await @_sleep 1000
						else
							await @_sleep 1000


				break if good




			if @_locks[file]
				throw new Error("Failed getting exclusive access for requiring")
			@_locks[file]= setInterval ()->
				try
					await fs.utimesAsync(file, Date.now(), Date.now())
			, 1500

		catch e
			throw e






	_unlock: (file)->
		file= Path.join(Os.homedir(),"Kawix","install.lock")
		# unlock
		if file
			timer= @_locks[file]
			if timer
				clearInterval timer
				delete @_locks[file]
				try
					await fs.rmdirAsync(file)


export default Installer
