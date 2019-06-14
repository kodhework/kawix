import Exception from './exception'

import KawixHttp from '../../std/http/mod'
import Url from 'url'
import Path from 'path'
import Cluster from 'cluster'
import Config from './config'
import ConfigIPC from './config.ipc'
import Os from 'os'
import IPC from './channel/ipc'
import fs from './lib/_fs'
import {EventEmitter} from 'events'

class Service extends EventEmitter

	constructor: (@config)->
		super()
		Service.current= @
		@_crons={}
		@_urlconns = {}
		@__id = 0
		@_router= new KawixHttp.router()
		@workers= []
		@_contexts= {}
		@_concurrent=0

	createIPC: (id)->
		new IPC(@, id)





	parseAddress: (address)->
		value={}
		if typeof address == "string"
			if address.indexOf(":") >= 0
				value.host= address.split ":"
				value.port= parseInt(value.host[1])
				value.host= value.host[0]
			else
				return address

		else
			value.host= '127.0.0.1'
			value.port= parseInt(address)

		return value

	deferred:()->
		def= {}
		def.promise= new Promise (a,b)->
			def.resolve= a
			def.reject = b
		return def


	_checkFileExists: (file)->
		def= @deferred()
		fs.access file, fs.constants.F_OK, (err)->
			def.resolve(if err then no else yes)
		return def.promise


	getDataPath:()->
		path= Path.join(Os.homedir(),".kawi")
		if not await @_checkFileExists(path)
			await fs.mkdirAsync(path)
		return path



	getConfig: ()->
		return @config.readCached()


	start: ()->


		if Cluster.isMaster
			config= await @config.read()
			#@config.on "include", @_include_to_workers.bind(@)
			@config.on "change",  @_config_to_workers.bind(@)

			try
				@channel= new IPC(@)
				@_socketpath= await @channel._getListenPath()
				await @channel.listen()
			catch e
				console.error("ERROR STARTING: ", e)
				process.exit(10)


			await @_cluster()

		else

			@config.stop()
			delete @config

			@channel= new IPC(@)
			await @channel.connect()
			await @channel.send
				action: 'import'
				args: [__filename]
				params:
					pid: process.pid
				name: "service"

			@config= new ConfigIPC(@channel)
			@config._load()
			await @config.read()
			await @_start()


	_cluster: (name)->
		config= @config.readCached()

		clusters= config.cluster ? [{
			purpose: 'default'
			address: config.address
		}]
		for cluster in clusters
			cluster.count= cluster.count ? 1
			if cluster.count is 'all'
				cluster.count= Os.cpus().length


			cluster.count= Math.min(cluster.count, cluster.min) if cluster.min
			cluster.count= Math.max(cluster.count, cluster.max) if cluster.max


			for i in [0...cluster.count]
				# create cluster
				w= @_fork(cluster)
				w._cid= name

				# wait a time for ensure not recompiling same files at time
				#await @sleep 500


	_config_to_workers: (config)->

		return if not Cluster.isMaster

		# determine if need reload clusters
		if(this.__time && this.__time != config.__time)

			console.info(" > [kawix/dhs] Base config changed. Need reload clusters: ", this.__time, config.__time)

			this.__time= config.__time
			clearTimeout @__reloadtimeout if @__reloadtimeout
			@__reloadtimeout= setTimeout(@reloadCluster.bind(@), 1000)


			return



		this.__time= config.__time
		for w in @workers
			if not w.finished
				if not w.IPC
					undefined
					#console.warn "No IPC channel on worker: ", w.id
				else
					if not w.IPC.__loaded
						await w.IPC.send
							action: 'import'
							args: [__filename]
							name: "service"

						w.IPC.__loaded= yes


					await w.IPC.send
						action: 'call'
						args: []
						method: '_load_config'
						name: "service"



	_load_config: ()->

		#clearTimeout @_in01 if @_in01
		config= @config
		console.info("> [kawix/dhs] Reloading config in worker: ", process.pid)
		config._load()

		###
		@_in01= setTimeout ()->

		, 1000
		###


	_include_to_workers: (path)->

		for w in @workers
			if not w.IPC
				console.warn "No IPC channel on worker: ", w.id
			else
				if not w.IPC.__loaded
					await w.IPC.send
						action: 'import'
						args: [__filename]
						name: "service"

					w.IPC.__loaded= yes

				await w.IPC.send
					action: 'call'
					args: [path]
					method: '_include_in_worker'
					name: "service"



	_include_in_worker: (path)->
		console.info "Including inside worker: ", path

	_config_in_worker: (config)->
		console.info "Changing config inside worker: ", config


	_fork: (cluster)->
		self= this

		env= Object.assign({}, process.env, cluster.env ? {})
		env.ADDRESS= cluster.address
		env.KAWIX_PURPOSE= cluster.purpose
		env.KAWIX_CHANNEL_PATH= @_socketpath

		w= Cluster.fork(env)
		@workers.push w
		w.env= env
		w.info= cluster
		w.purpose= cluster.purpose
		w.pid= w.process.pid
		self= @
		u= (message)->
			if message.startsWith("Listening:")
				c= message.substring(10)
				c= JSON.parse(c)
				self.emit "listen", c
			else
				w.once "message", u

		w.once "message", u
		w.on "error", (e)->
			console.error(" > [kawix/dhs] Error in worker: ", w.pid, e)
		w.once "exit", ()->
			i= self.workers.indexOf(w)
			self.workers.splice(i,1)
			if not w.finished
				self._fork(cluster)
			else
				console.info(" > [kawix/dhs] Worker #{w.pid} fully closed")


		###
		w.process.stdout.on "data", (d)->
			console.info("FROM WORKER STDOUT:", d)
			self.emit("worker.stdout", w, d)
		w.process.stderr.on "data", (d)->
			console.info("FROM WORKER STDERR:", d)
			self.emit("worker.stderr", w, d)
		###
		return w


	# by default 5 hours to wait finish
	closeAndExit: (timeout= 5 * 3600)->
		num= 0
		try
			@_cronstop= yes

			# wait crons
			try
				await @_waitcron()


			await @http.close(timeout)
		catch e
			num= 100
		finally
			process.exit(num)
			# ensure finish
			setTimeout ()->

				process.kill(process.pid, 'SIGKILL')
			, 4000



	sleep: (timeout)->
		def= @deferred()
		setTimeout def.resolve, timeout
		def.promise

	# reload workers gracefull, when main configuration changed
	reloadCluster:()->
		for w in @workers
			w.finished= yes


		await @_cluster()
		await @sleep 3000


		for w in @workers
			if w.finished
				# send signal to exit
				if w.IPC
					w.finished= yes
					await w.IPC.send
						action: 'call'
						name: 'service'
						method: 'closeAndExit',
						args:[]
					w.disconnect()

				else
					w.finished= yes
					w.disconnect()
					w.kill('SIGTERM')








	_start: ()->
		config= await @config.read()
		addr= process.env.ADDRESS or config.address
		if not addr
			return Exception.create("Listen address no specified").putCode("INVALID_ADDR").raise()

		# create the server
		@http= new KawixHttp.server()
		if config.maxqueuecount
			@http.maxqueuecount= config.maxqueuecount
		#address= @parseAddress(addr)

		def= @deferred()

		###
		if address.port
			console.info address.host
			@address=await @http.listen address.port, address.host
		else
		###

		@address= await @http.listen addr
		console.info " > [kawix/dhs] Listening on: ", @address
		if Cluster.isMaster
			@emit "listen", @address
		else
			process.send "Listening: " + JSON.stringify(@address)


		#@_router.get "/.o./config", @api_config.bind(@)
		#@_router.all "*", @api_404.bind(@)
		#@_router.ERROR @api_500.bind(@)

		# build Router for each Site

		@buildRoutes()

		# date integer when started
		@started= Date.now()

		if parseInt(process.env.CRON_ENABLED) is 1
			@_startCron()

		# start accept
		@_accept()


	_waitcron: (timeout = 180000)->
		time= Date.now()
		while true
			if Date.now() - time > timeout
				throw Exception.create("Timedout waiting finishing crons").putCode("TIMEDOUT")
			executing= no
			for id, cron of @_crons
				if cron._executing
					executing= yes
					break

			if executing
				await @sleep 2000
			else
				break


	_startCron: ()->
		return if @_cronstop

		await @sleep(60000)
		return if @_cronstop


		config= @config.readCached()

		if config.sites
			for site in config.sites
				if site.crons
					ctx= @.getContext(site)
					for cron in site.crons
						c= cron.worker ? "CRON_ENABLED"
						if not cron.name
							cron.name = 'default'

						cron.id= site.name + "." + cron.name
						ccron= @_crons[cron.id]
						if ccron
							cron._executing= ccron._executing
							cron._executed= ccron._executed

						if c is "all" or (parseInt(process.env[c]) is 1)
							if ((cron.interval or 120000) >= (Date.now() - (cron._executed or Date.now())) ) and not cron._executing
								@_executeCron site, cron, ctx

		setImmediate @_startCron.bind(@)



	_executeCron: (site, cron, ctx)->
		try
			if cron.id
				ccron= @_crons[cron.id]

			console.log(" > [kawix/dhs] Starting cron #{cron.id}")
			cron._executing= yes
			ccron._executing= yes if ccron

			file= @.config.resolvePath(cron.file, site)
			mod= await `import(file)`
			env=
				server: @
			await mod.invoke(env, ctx)

			cron._executed= Date.now()
			ccron._executed= Date.now() if ccron

		catch e
			console.error(" > [kawix/dhs] Failed executing cron: #{cron.name or 'nodefined'} in site #{site.name}. Error: ", e)
		finally
			cron._executing= no
			ccron._executing= no if ccron


	buildRoutes: ()->


		@config.once "change", @buildRoutes.bind(@)
		config= @config.readCached()
		if not config.sites
			return

		for id,val of @_contexts
			val.config= config

		for site in config.sites
			try

				if site.preload
					if not (site.preload instanceof Array)
						site.preload= [site.preload]
					for preload in site.preload
						preload= @.config.resolvePath(preload, site)
						mod= await `import(preload)`
						if typeof mod.invoke == "function"
							await mod.invoke
								server: @
								site: site
								config: @.config.readCached()



				if not site._hrouter
					site._hrouter= new KawixHttp.router()
					site._urouter= new KawixHttp.router()

					if site.hostnames ? site.hosts
						hostnames = site.hostnames ? site.hosts
						for host in hostnames
							@_addHost host, site


					if site.globalprefixes
						site._arouter= new KawixHttp.router()
						# global prefixes can be analyzed before?
						for prefix in site.globalprefixes
							@_addGlobalPrefix prefix, site

					if site.prefixes
						for prefix in site.prefixes
							site._urouter.use prefix, this._createCallback(route, site), route.store

					if site.routes
						for route in site.routes
							site._urouter[route.method or "all"](route.path, this._createCallback(route, site), route.store)

					if site.defaultroute
						route= site.defaultroute
						if typeof route is "string"
							route=
								method: "all"
								file: route
						site._urouter.NOTFOUND(this._createCallback(route, site), route.store)
			catch e
				console.error(" > [kawix/dhs] Failed reloading site routes: ",e)





	_siteimport: ()->
		self= this
		return (file)->
			this.__mod= this.__mod ? {}
			file= self.config.resolvePath(file, this)
			cached= this.__mod[file]
			if cached and cached.__time and (Date.now() <= cached.__time )
				# cache is good
				undefined
			else
				cached= await `import(file)`
				if cached.kawixDynamic
					cached.__time= Date.now() + (cached.kawixDynamic.time || 10000)
				this.__mod[file]= cached

			return cached

	getContext: (site)->
		sitename= site
		config= @.config.readCached()

		if typeof sitename == "object"
			sitename= site.name

		if typeof site is "string"
			for s in config.sites
				if s.name is site
					site= s

			if typeof site is "string"
				site= { name: "$default", _notfound:yes}
		ctx= @_contexts[sitename]
		if not ctx
			ctx= @_contexts[sitename]= {}
			ctx.server= @
			ctx.config= config

		ctx.site= site
		ctx.config= config
		return ctx



	_createStaticCallback: (route,site)->
		if route.static
			path= route.static.path ? route.static
			path= @.config.resolvePath(path, site)
			g= KawixHttp.staticServe( path , route.static.options)


			if route.middleware
				h= @_createCallback(route.middleware, site)
				return (env,ctx)->
					await h(env,ctx)
					await g(env,ctx) if not env.response.finished

			return g

	_addHost: (host, site)->
		if host?.middleware
			h= @_createCallback(host.middleware, site)
			c= (env,ctx)->
				await h(env,ctx)
				await site._urouter.handle(env,ctx) if not env.response.finished

		site._hrouter.get "/" + (host.host ? host.name ? host), c ? site._urouter


	_addGlobalPrefix: (prefix, site)->
		if prefix?.middleware
			h= @_createCallback(prefix.middleware, site)
			c= (env,ctx)->
				await h(env,ctx)
				await site._urouter.handle(env,ctx) if not env.response.finished

		path= prefix.path ? prefix
		if not path.startsWith("/")
			throw Exception.create("Prefix #{path} is not valid").putCode("INVALID_PREFIX")
		site._arouter.use (prefix.path ? prefix), c ? site._urouter




	_createCallback: (route, site)->

		if route.static
			return @_createStaticCallback(route,site)


		self= this
		par=
			c: {}
		if route.folder
			par.folder= self.config.resolvePath route.folder, site
		if route.file
			par.file= self.config.resolvePath route.file, site
		ctx= self.getContext(site)


		g=  (env)->
			try
				if par.folder
					name= env.params.file or env.params["*"]
					if not name
						Exception.create("Failed to get a file to execute").putCode("PARAM_NOT_FOUND")

					file= Path.join par.folder, name
				else
					file= par.file


				mod= par.c[file]
				if not mod or (mod.__expire && Date.now() >= mod.__expire)
					mod= await `import(file)`
					if mod.kawixDynamic
						mod.__expire= Date.now() + (mod.kawixDynamic.time ? 30000)
					par.c[file]= mod

				env.server= self
				method= env.request.method.toLowerCase()
				if typeof mod.router?.handle == "function"
					return await mod.router.handle(env,ctx)
				else if typeof mod[method] == "function"
					return await mod[method](env,ctx)
				else if typeof mod.httpInvoke == "function"
					return await mod.httpInvoke(env,ctx)
				else if typeof mod.invoke == "function"
					return await mod.invoke(env,ctx)
				else
					env.response.end()
			catch e
				env.error= e
				self.api_500(env)


		if route.middleware
			h= @_createCallback(route.middleware, site)
			return (env,ctx)->
				await h(env,ctx)
				await g(env,ctx) if not env.response.finished

		return g

	_accept:()->
		while yes
			env= await @http.accept()
			if not env
				break
			@_handle env
			env= null



	api_config: (env)->
		config= @config.readCached()
		env.reply.code(200).send config

	api_500: (env)->
		try 
			env.reply.code(500).send
				error:
					message: env.error.message
					code: env.error.code
					stack: env.error.stack
				status: 'error'
		catch e 
			console.error "Error from ENV: ", env.error

	_bundle: (env)->
		ctx=
			server: @

		bundle= await `import(__dirname +"/dynamic/bundle")`
		return await bundle.invoke(env,ctx)

	api_kodhe: (env)->

		if not @__ks2
			@__ks2 = new KawixHttp.router()
			bund= @_bundle.bind(@)

			# deprecated #
			@__ks2.get "/.static./bundle/cached/:sitecache/:module", bund
			@__ks2.get "/.static./bundle/complete/cached/:sitecache/:module", bund
			@__ks2.get "/.static./bundle/cached/:sitecache/:module/*", bund
			@__ks2.get "/.static./bundle/complete/cached/:sitecache/:module/*", bund
			@__ks2.get "/.static./bundle/:module", bund
			@__ks2.get "/.static./bundle/:module/*", bund
			# deprecated #

			

			@__ks2.get "/.static./generate/cached/:sitecache/:module", bund
			@__ks2.get "/.static./generate/complete/cached/:sitecache/:module", bund
			@__ks2.get "/.static./generate/cached/:sitecache/:module/*", bund
			@__ks2.get "/.static./generate/complete/cached/:sitecache/:module/*", bund
			@__ks2.get "/.static./generate/:module", bund
			@__ks2.get "/.static./generate/:module/*", bund

			@__ks2.get "/.static./generate/:type/cached/:sitecache/:module", bund
			@__ks2.get "/.static./generate/:type/complete/cached/:sitecache/:module", bund
			@__ks2.get "/.static./generate/:type/cached/:sitecache/:module/*", bund
			@__ks2.get "/.static./generate/:type/complete/cached/:sitecache/:module/*", bund
			@__ks2.get "/.static./generate/:type/:module", bund
			@__ks2.get "/.static./generate/:type/:module/*", bund



			@__ks2.get "/.static./local/bundle/:site/*", bund


		uri= env.request.uri
		if not uri
			uri= Url.parse env.request.url

		if uri.pathname == "/.static./js/kawix.core.js"
			env.request.url= '/main.js'
			#console.info ">>>>", Path.normalize(Path.join(__dirname, "..", "..", "core", "crossplatform", "dist"))
			@__ks0 = KawixHttp.staticServe(Path.join(Path.dirname(kawix.__file), "crossplatform", "dist")) if not @__ks0
			await @__ks0(env)
		else if uri.pathname == "/.static./js/kawix.async.js" or uri.pathname == "/.static./js/kawix.core.async.js"
			env.request.url= '/main.js'
			@__ks1 = KawixHttp.staticServe(Path.join(Path.dirname(kawix.__file), "crossplatform", "async", "dist")) if not @__ks1
			await @__ks1(env)
		else
			await @__ks2.handle(env)

		env= null


	_handle: (env)->

		# check routes
		config= @config.readCached()
		if config.maxconcurrent and (@_concurrent >= config.maxconcurrent)
			env.reply.code(503).send("Max concurrent connections reached")
			env= null
			return

		defsite = null 


		@_concurrent++
		id = @__id++ 
		conn_ = @_urlconns[id] = 
			url: env.request?.url
			created: Date.now() 
			method: env.request?.method 
			id : id 

		if env.response 
			env.response.once "finish", ()=>
				@_concurrent--
				delete @_urlconns[id]
			conn_.end = env.response.end.bind(env.response)
		else if env.socket 
			env.socket.once "finish", ()=>
				@_concurrent--
				delete @_urlconns[id]
			env.response = env.socket
			conn_.end = env.response.close.bind(env.response)
		
		try

			if env.request?.url == "/.o./config"
				return env.reply.code(200).send(config)
			
			if env.request?.url == "/.status"
				return env.reply.code(200).send
					concurrent: @_concurrent
					connections: @_urlconns
			


			if env.request?.url.startsWith("/.static.")
				await @api_kodhe(env) if not env.response.finished


			if config.sites

				# check global prefixes and hostnames
				host= env.request.headers.host
				for site in config.sites
					if site._arouter?.handle
						await site._arouter.handle(env)
						return  if env.response.finished

				for site in config.sites
					if site._hrouter?.handle

						func= site._hrouter.find("GET", "/" + host)
						if typeof func?.handler == "function"
							await site._hrouter.handle(env, func)

						return if env.response.finished

					else if not site._arouter and site.routes and site._urouter
						await site._urouter.handle(env)
						return if env.response.finished

					
						
			for site in config.sites 
				if site.hostnames?.indexOf("DEFAULT") >= 0
					func= site._hrouter.find("GET", "/DEFAULT")
					if typeof func?.handler == "function"
						await site._hrouter.handle(env, func)
					return if env.response.finished

			if env.socket 
				if not env.handled
					env.socket.end()
			else 
				env.reply.code(404).send("NOT FOUND") if not env.response.finished
			env= null

		catch e

			if not env.response?.finished
				env.error = e
				@api_500(env)
			else
				console.error(" > [kawix/dhs] Error in server handle: #{e.stack}")
			env= null
		finally
			env= null




export default Service

export create= (state, socket, params)->
	server= Service.current

	if params?.pid and server.workers
		# get worker by pid
		for w in server.workers
			if w.process.pid is params.pid
				break
			w= null

	if w and (not w.IPC)
		w.IPC= IPC.fromClientSocket(socket, server)

	return Service.current
