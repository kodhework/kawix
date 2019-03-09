import Exception from './exception.coffee'

import KawixHttp from '../../std/http/mod.js'

import Path from 'path'
import Cluster from 'cluster'
import Config from './config'
import ConfigIPC from './config.ipc'

import IPC from './channel/ipc'


class Service 

	constructor: (@config)->
		Service.current= @ 
		@_router= new KawixHttp.router()
		@workers= []


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
		

	_config_to_workers: (config)->


		# determine if need reload clusters
		if(this.__time && this.__time != config.__time)
			console.info(" > [KAWIX] Base config changed. Need reload clusters")
			clearTimeout @__reloadtimeout if @__reloadtimeout
			@__reloadtimeout= setTimeout(@reloadCluster.bind(@), 2000)



		this.__time= config.__time 
	

		for w in @workers 
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
		console.info("> [KAWIX] Reloading config in worker: ", process.pid)
		@config._load() 


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
		w.once "exit", ()->
			i= self.workers.indexOf(w)
			self.workers.splice(i,1)
			if not w.finished
				self._fork(cluster)
			else 
				console.info(" > [KAWIX] Worker #{w.pid} fully closed")
		
		
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

		cid= Date.now().toString(24)
		await @_cluster(cid)

		await @sleep 3000		
		for w in @workers 
			if w.finished
				# send signal to exit
				if w.IPC
					w.finished= yes  
					w.IPC.send 
						action: 'call'
						name: 'service'
						method: 'closeAndExit',
						args:[]
					w.disconnect() 

				else 
					w.finished= yes 
					w.disconnect() 
					w.kill()








	_start: ()->
		config= await @config.read()
		addr= process.env.ADDRESS or config.address
		if not addr
			return Exception.create("Listen address no specified").putCode("INVALID_ADDR").raise()
		
		# create the server 
		@http= new KawixHttp.server()
		#address= @parseAddress(addr)

		def= @deferred()
		
		###
		if address.port 
			console.info address.host
			@address=await @http.listen address.port, address.host
		else 
		###

		@address= await @http.listen addr
		
		console.info "Listening on: ", @address 

		
		@_router.get "/.o./config", @api_config.bind(@)
		@_router.NOTFOUND @api_404.bind(@)
		@_router.ERROR @api_500.bind(@)

		# build Router for each Site
		
		@buildRoutes()

		# start accept 
		@_accept()
		



	buildRoutes: ()->

		@config.once "change", @buildRoutes.bind(@)

		config= @config.readCached()
		if not config.sites 
			return 


		for site in config.sites 
			if not site._hrouter 				
				site._hrouter= new KawixHttp.router() 
				site._urouter= new KawixHttp.router() 

				if site.hostnames 
					for host in site.hostnames
						site._hrouter.get "/" + host, site._urouter 
				
				if site.globalprefixes 
					site._arouter= new KawixHttp.router() 
					# global prefixes can be analyzed before? 
					for prefix in site.globalprefixes
						site._arouter.use prefix, site._urouter 

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
		config= @.config.readCached() 
		if typeof site is "string"
			for s in config.sites 
				if s.name is site
					site= s 
			
			if typeof site is "string"
				site= {name: "$default"}


		return 
			server: @ 
			site: site 
			config: config
		


	_createCallback: (route, site)->
		# route to file 
		self= this
		if not site.import 
			site.import= this._siteimport()
		
		if route.static 
			path= route.static.path ? route.static
			path= self.config.resolvePath(path, site)		
			g= KawixHttp.staticServe( path , route.static.options)
			return g 



		return (env)->
			try 
				if route.folder 
					name= env.params.file or env.params["*"]
					if not name 
						Exception.create("Failed to get a file to execute").putCode("PARAM_NOT_FOUND")

					file= self.config.pathJoin route.folder, env.params.file
				else 
					file= route.file 
				


				mod= await site.import(file)
				ctx= self.getContext(site)
				env.server= self



				method= env.request.method.toUpperCase() 
				if typeof mod.router?.handle == "function"
					return await mod.router.handle(env,ctx)
				else if typeof mod[method] == "function"
					return await mod[method](env,ctx)
				else if typeof mod.invoke == "function"
					return await mod.invoke(env,ctx)
				else 
					env.response.end()	
			catch e 
				env.error= e
				self.api_500(env)


	_accept:()->
		while yes 
			env= await @http.accept() 
			@_router.handle env 
		


	api_config: (env)->
		config= @config.readCached()
		env.reply.send config

	api_500: (env)->
		env.reply.code(500).send
			message: env.error.message 
			code: env.error.code 
			stack: env.error.stack 

	api_404: (env)->

		# check routes 
		config= @config.readCached()
		if config.sites  

			# check global prefixes 
			for site in config.sites 
				if site._arouter?.handle 
					await site._arouter.handle(env)
					if env.response.finished 
						return 

			# check now hostnames 
			host= env.request.headers["host"]
			if host 
				for site in config.sites 
					if site._hrouter?.handle 
						await site._hrouter.find("GET", "/" + host)
						if env.response.finished 
							return 

		# kowix Site?
		# TODO

		env.reply.code(404).send "NOT FOUND"




export default Service 

export create= (state, socket, params)->
	server= Service.current 
	
	if params?.pid and server.workers
		# get worker by pid 
		for w in server.workers
			if w.process.pid is params.pid
				break 
			w= null 
	
	if w 
		w.IPC= IPC.fromClientSocket(socket, server)
		
	return Service.current 