import semver from '../semver.js'
import fs from '../../fs/mod.js'
import axios from 'npm://axios@0.18.0'
import Url from 'url'
import Path from 'path'
import Os from 'os'
import qs from 'querystring'

class Installer 
	constructor: ({module, version, url, key, machineid})->
		@url = url ? './'
		@module = module ? ''
		@key = key
		@machineid= machineid
		@version = version 
		@_locks = {}
	
	_sleep: (timeout = 100)->
		return new Promise (resolve)-> setTimeout resolve, timeout

	installInfo: (dir)->
		return @_install(dir, yes)
	
	install: (dir)->
		return @_install(dir, no)
	

	
	_install: (dir, _getinfo)->
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
		
			imodules= Path.join(dir,"imodules")
			modules = Path.join(dir,"modules")
			if not fs.existsSync(imodules)
				fs.mkdirAsync(imodules)
			
			if not fs.existsSync(modules)
				fs.mkdirAsync(modules)


			
			if data.dependencies 
				for dep in data.dependencies
					arg1 = Object.assign {}, dep, 
						key: @key 
						machineid: @machineid 
					depInstaller= new Installer(arg1)
					deps.push await depInstaller._install(dir, _getinfo)


			fileinfo= {}
			try
				fileinfo= await import(Path.join(imodules, @module + ".info.json"))

			if fileinfo.versions?[info0.version]?.uploadid isnt data.uploadid
				# download 
				if @url is "./"
					a= module.realPathResolve(@module) 
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
						needupdate: yes
						name: info0.name || data.name

				
				response= await axios 
					method: 'GET'
					url: u
					responseType: 'stream'

				def= {}
				def.promise= new Promise (a,b)->
					def.resolve= a 
					def.reject = b 
				
				try 
					fname1= Path.join imodules, @module + "." + info0.version  + ".kwa.0"
					fname = Path.join imodules, @module + "." + info0.version  + ".kwa"
					st= fs.createWriteStream(fname1)
					st.on "error", def.reject 
					response.data.on "error", def.reject 
					st.on "finish", def.resolve 
					response.data.pipe st 
					await def.promise 

					
					if fs.existsSync(fname)
						await fs.unlinkAsync(fname)
					await fs.renameAsync(fname1, fname)

					


				catch e 
					if fs.existsSync(fname1)
						await fs.unlinkAsync(fname1)
					throw e 
				
				


				try
					fileinfo= await KModule.import(Path.join(imodules, @module + ".info.json"), {
						force: true 
					})
				
				fname2= Path.join(modules, @module+".kwa")
				if fs.existsSync(fname2)
					await fs.unlinkAsync(fname2)
					
				if Os.platform() == "win32"
					# windows es problemático con los enlaces simbólicos
					await fs.copyFileAsync(fname, fname2)
					fileinfo.version= info0.version 
					
				else if not fileinfo.version or (semver.gt(info0.version, fileinfo.version))
					# make a symlink 
					await fs.symlinkAsync(fname, fname2)
					fileinfo.version= info0.version 

				fileinfo.versions= fileinfo.versions ? {}
				fileinfo.versions[info0.version] = data 

				# write the file 
				await fs.writeFileAsync(Path.join(imodules, @module + ".info.json"), JSON.stringify(fileinfo, null, '\t'))

				return 
					deps: deps 
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
					installed: null 
					version: info0.version 
					name: info0.name || data.name
					localversion: fileinfo.version  
		catch e
			throw e 
		finally 
			await @_unlock()

	get: ()->
		# get the best version available 
		try 
			u= @url
			info= await KModule.import "#{u}#{@module}/info.json", 
				force: yes
			versions= Object.keys(info.versions)
		catch e 
			throw new Error("Module #{u}#{@module} not found")

		versions.sort (a,b)-> 
			if a > b then -1 else (if a < b then 1 else 0)

		resolved= ''
		for version in versions 
			if @version is "latest"
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
