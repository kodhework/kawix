
# same as config.coffee but reading from IPC Master

import {EventEmitter} from 'events'
import Path from 'path'
import Os from 'os'
import Url from 'url'



class Config extends EventEmitter

	# can be JSON, CSON, etc
	constructor:(ipc)->
		super()
		@ipc= ipc 	

	
	_changeConfig: (config)->
		if config.preload 
			await @_preload(config) 
			
		###
		if config.include 
			await @_loadIncludes(config)
		### 


		@_config= config 
		return this.emit("change", config)




	_checkConfig: (config)->
		return config 


	parseEnvironment: (obj)->
		if typeof obj == "object"
			# detect os 
			str= obj[Os.platform()]
			if not str 
				str= obj.default
		else 
			str= obj 
		return str 
		
	resolvePath: (path, parent)->
		path= @parseEnvironment path
		if path.startsWith("./") || path.startsWith("../")
			path= Path.resolve Path.dirname(parent.__defined), path 
		return path 

	pathJoin: (path1, path2)->
		uri= Url.parse path1
		if uri.protocol is "file:"
			path1= Url.fileURLToPath(path1)
			pathr= Path.join(path1, path2)
			return pathr
		if not uri.protocol
			pathr= Path.join(path1, path2)
			if path1.startsWith("./")
				return "./" + pathr        
		else 
			return Url.resolve(path1, path2)



		
	@_getSites: ()->
		return @readCached().sites 
	Object.defineProperty Config::, 'sites', 
		get: @_getSites
	
	Object.defineProperty Config::, 'hosts', 
		get: @_getSites

		
	_preload: (config)->        
		config.modules= {}  
		for id, mod of config.preload                        
			mod= @resolvePath mod, config 
			config.modules[id]= await `import(mod)`


	

	_loadIncludes: (config)->
		# watcher disabled		
		return null 


	sleep: (time=100)->
		def= @deferred()
		setTimeout def.resolve, time 
		def.promise


	_load: ()->
		config= await @ipc.send
			action: 'call'
			name: "service"
			method: 'getConfig'
			args: []
		
		if not config.sites 
			return 

		if @_config 
			sitesbydef ={}
			sitesbydef2={}

			nsites=[]


			for site in @_config.sites 
				sitesbydef[site.__defined]= sitesbydef[site.__defined] or
					items: []
					time: site.__time 
				
				sitesbydef[site.__defined].items.push site

			for site in config.sites 
				sitesbydef2[site.__defined]= sitesbydef2[site.__defined] or
					items: []
					time: site.__time 
				
				sitesbydef2[site.__defined].items.push site 
			

			for _file, val of sitesbydef2
				old= sitesbydef[_file]
				if old?.time is val.time
					for item in old.items 
						nsites.push item 
				else 
					for item in val.items 
						nsites.push item 

			config.sites= nsites 
			@_config= config 


		else 
			@_config= config 
		@emit "change", @_config 
		


	_include: (config, path)->
		try 
			await @sleep 200

			
			@_removeinclude config, path 
			newconfig= await `import(path)`
			newconfig.__time= newconfig.__time or Date.now()
			if not newconfig.kawixDynamic
				Object.defineProperty newconfig, "kawixDynamic", 
					enumerable: no
					value: 
						time: 5000
			@_process config, newconfig, path 

		catch e 
			console.error "Failed including: ", path, e

	_removeinclude: (config, path)->		
		todel=[]
		config.sites = config.sites  ? []
		for site, i in config.sites     
			if site.__defined is path 
				todel.push i 

		offset= 0
		for del in todel 
			config.sites.splice del - offset, 1
			offset++ 

		
	_process: (config, other, filename)->
		config.sites= config.sites ? []
		edited= no
		sites= other.host or other.site or other.app
		if sites 
			if sites instanceof Array
				for site in sites
					edited= yes
					config.sites.push site 
					site.__defined= filename
					@_loadSite site
			else 
				site= sites
				edited= yes
				config.sites.push site 
				site.__defined= filename
				@_loadSite site
				
		
		
		if edited 
			@_config= config 
			@emit "change", config 
		return config 


	_loadSite: (site)->
		if site.preload
			await @_preload site 
		site.loaded= yes 


	deferred:()->
		def= {}
		def.promise= new Promise (a,b)->
			def.resolve= a 
			def.reject = b
		return def 

	
	read: ()->
		while not @_config 
			await @sleep 10
		return  @_config 
	
	readCached: ()->
		return @_config

	
export default Config
