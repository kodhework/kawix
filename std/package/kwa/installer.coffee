import semver from 'https://kwx.kodhe.com/x/v/0.3.20/std/package/semver.js'
import fs from 'https://kwx.kodhe.com/x/v/0.3.20/std/fs/mod.js'
import axios from 'npm://axios@0.18.0'
import Url from 'url'
import Path from 'path'
import Os from 'os'

class Installer 
	constructor: ({module, version, url})->
		@url= url ? './'
		@module= module 
		@version= version 

	install: (dir)->

		info0= await @get()
		data= info0.data

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

		fileinfo= {}
		try
			fileinfo= await import(Path.join(imodules, @module + ".info.json"))
		
		if fileinfo.versions?[info0.version]?.uploadid isnt data.uploadid
			# download 
			if @url is "./"
				a= module.realPathResolve(@module) 
			else 
				a= Url.resolve(@url, @module) 
			u= Url.resolve a + "/", data.filename ? data.url
			console.info("URL: #{u}")
			response= await axios 
				method: 'GET'
				url: u
				responseType: 'stream'

			def= {}
			def.promise= new Promise (a,b)->
				def.resolve= a 
				def.reject = b 
			
			fname= Path.join imodules, @module + "." + info0.version  + ".kwa"
			st= fs.createWriteStream(fname)
			st.on "error", def.reject 
			response.data.on "error", def.reject 
			st.on "finish", def.resolve 
			response.data.pipe st 
			await def.promise 

			try
				fileinfo= await KModule.import(Path.join(imodules, @module + ".info.json"), {
					force: true 
				})

			if not fileinfo.version or (semver.gt(info0.version, fileinfo.version))
				# make a symlink 
				
				fname2= Path.join(modules, @module+".kwa")
				if fs.existsSync(fname2)
					await fs.unlinkAsync(fname2)
				await fs.symlinkAsync(fname, fname2)
				fileinfo.version= info0.version 

			fileinfo.versions= fileinfo.versions ? {}
			fileinfo.versions[info0.version] = data 

			# write the file 
			await fs.writeFileAsync(Path.join(imodules, @module + ".info.json"), JSON.stringify(fileinfo, null, '\t'))

			return 
				installed: fname 
				version: info0.version 
		else 
			return 
				installed: null 
				version: info0.version 
				localversion: fileinfo.version  
		

	get: ()->
		# get the best version available 
		try 
			u= @url
			info= await KModule.import("#{u}#{@module}/info.json")
			versions= Object.keys(info.versions)
		catch e 
			throw new Error("Module #{@module} not found")

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

export default Installer