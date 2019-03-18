#import Chokidar from './chokidar/mod.js'
import {EventEmitter} from 'events'
import Path from 'path'
import Os from 'os'
import Watcher from './watcher.coffee'
import Url from 'url'
import Cluster from 'cluster'



class Config extends EventEmitter

	# can be JSON, CSON, etc
	constructor:(file)->
		super()
		@file=file
		@start() if file

	start: ()->
		if not @file
			# read from parent
			@_readFromParent= yes
			return

		@_read= setInterval @_read1.bind(@), 10000
		@_read.unref()
		@_read1()




	stop: ()->
		clearInterval @_read if @_read




	@_getSites: ()->
		return @readCached().sites
	Object.defineProperty Config::, 'sites',
		get: @_getSites

	Object.defineProperty Config::, 'hosts',
		get: @_getSites



	_checkConfig: (config)->
		if (not @_config and config)  or (@_config.kawixDynamic isnt config.kawixDynamic)
			if config.preload
				await @_preload(config)
			if config.include
				await @_loadIncludes(config)

			@_config= config
			return this.emit("change", config)

		@_config= config
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



	_preload: (config)->
		config.modules= {}
		for id, mod of config.preload
			mod= @resolvePath mod, config
			config.modules[id]= await `import(mod)`




	_loadIncludes: (config)->
		# include is a file, glob definition
		self= this
		toWatch= {}

		if typeof config.include == "string"
			config.include= [config.include]

		for inc in config.include
			# start making good with chokidar
			inc= @parseEnvironment inc
			if inc.startsWith("./")  or inc.startsWith("../")
				inc= Path.resolve Path.dirname(config.__defined), inc


			toWatch[inc]= yes

		@watcher?.close()
		toWatch = Object.keys(toWatch)


		if toWatch.length
			watcher = @watcher= new Watcher
				recursive: no

			watcher.watch toWatch
			watcher.on "add", (path)-> self._include(config, path)
			watcher.on "change", (path)-> self._include(config, path)
			watcher.on "remove", (path)-> self._removeinclude(config, path)

			###
			watcher = @watcher= Chokidar.watch toWatch,
				ignored: /(^|[\/\\])\../
				persistent: yes
				awaitWriteFinish: yes

			console.info("Watching:",toWatch)
			watcher.on "add", (path)-> self._include(config, path)
			watcher.on "change", (path)-> self._include(config, path)
			watcher.on "unlink", (path)-> self._removeinclude(config, path)
			watcher.on "error", (e)-> console.error "Watching error", e
			###



	sleep: (time=100)->
		def= @deferred()
		setTimeout def.resolve, time
		def.promise



	_include: (config, path, timeout = 400)->
		try
			await @sleep timeout


			newconfig= await `import(path)`
			if newconfig.configfile
				return await @_include(config, newconfig.configfile, timeout)

			@emit "include", path
			@_removeinclude config, path, no

			config._includes=config._includes or {}
			config._includes[path]= true


			newconfig.__time= newconfig.__time or Date.now()
			if not newconfig.kawixDynamic
				Object.defineProperty newconfig, "kawixDynamic",
					enumerable: no
					value:
						time: 5000
			@_process config, newconfig, path

		catch e
			console.error "Failed including: ", path, e

	_removeinclude: (config, path, _emit)->
		if config._includes
			delete config._includes[path]

		if _emit isnt false
			@emit "include.remove", path


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
		site.__time= site.__time ? Date.now()
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
		return @_config if @_config
		def= @deferred()
		this.once "change", def.resolve
		return def.promise

	readCached: ()->
		return @_config


	_read1: ()->
		try
			try
				config= await `import(this.file)`
			catch e
				@sleep 100
				config= await `import(this.file)`

			if not config.kawixDynamic
				Object.defineProperty config, "kawixDynamic",
					enumerable: no
					value: {}


			config.__time= config.__time or Date.now()
			if not config.__defined
				config.__defined= this.file

			await @_checkConfig config
			return config
		catch e
			console.error(" > [KAWIX] Failed reloading config in background: ",e )

export default Config
