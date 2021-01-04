// 2019-10-09
// New module for IPC, advanced and more stable
import { Channel } from '/virtual/@kawix/std/rpa/channel'
import Exception from '/virtual/@kawix/std/util/exception'
import KawixHttp from '/virtual/@kawix/std/http/mod'
import {Server as KawixHttpServer} from '/virtual/@kawix/std/http/server'

import Url from 'url'
import Path from 'path'
import Cluster from 'cluster'
import Child from 'child_process'
import { Config, ConfigRPA, ConfigBase } from './config'
//import ConfigIPC from './config.ipc';

import Os from 'os';

//import IPC from './channel/ipc'

import fs from '/virtual/@kawix/std/fs/mod'
import * as async from '/virtual/@kawix/std/util/async'

import {
	EventEmitter
} from 'events'

import { AddressInfo } from 'net'
import * as Types from './typings'
declare var kawix
require('events').EventEmitter.prototype._maxListeners = 1000


let isMaster = Cluster.isMaster && !process.env.NO_MASTER

export class Service extends EventEmitter implements Types.DhsServerMaster {

	_crons: any
	_urlconns: any
	__id: number
	_router
	_cronstop: any
	_contexts: any
	_concurrent: number
	__time: number
	__reloadtimeout: any
	__ks0: any
	__ks1: any
	__ks2: any
	ipcmodule = 'RPA'


	static current: Service
	config: ConfigBase
	workers: any[]

	channel: Channel
	channels = {}

	address: AddressInfo
	http: KawixHttpServer
	started: number

	constructor(config1) {
		super()
		Service.current = this

		this.config = config1
		this._crons = {}
		this._urlconns = {}
		this.__id = 0
		this._router = new KawixHttp.router()
		this.workers = []
		this._contexts = {}
		this._concurrent = 0
	}

	async _accept() {
		var env
		while (true) {
			env = (await this.http.accept())
			if (!env) {
				break
			}
			this._handle(env)
			env = null
		}
	}
	async _bundle(env) {
		var bundle, ctx
		ctx = {
			server: this
		}
		bundle = (await import(__dirname + "/dynamic/bundle"))
		return (await bundle.invoke(env, ctx))
	}

	_onclose(ids: string | string[]) {

		if (ids instanceof Array) {
			for (let id of ids) {
				if (this._urlconns[id]) {
					this._concurrent--
					delete this._urlconns[id]
				}
			}
		}
		else {
			let id = ids
			if (this._urlconns[id]) {
				this._concurrent--
				delete this._urlconns[id]
			}
		}

	}

	async _handle(env) {

		var config, conn_, defsite, e, func, host, id, j, k, l, len, len1, len2, ref, ref1, ref10, ref11, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, site
		config = this.config.readCached()
		if (((ref3 = env.request) != null ? ref3.url : void 0) === "/.status") {
			return env.reply.code(200).send({
				concurrent: this._concurrent,
				connections: this._urlconns
			});
		}

		if (config.maxconcurrent && (this._concurrent >= config.maxconcurrent)) {
			env.reply.code(503).send("Max concurrent connections reached")
			env = null
			return
		}

		defsite = null
		this._concurrent++
		id = this.__id++
		conn_ = this._urlconns[id] = {
			url: (ref = env.request) != null ? ref.url : void 0,
			created: Date.now(),
			method: (ref1 = env.request) != null ? ref1.method : void 0,
			id: id
		}



		//let onclose = this._onclose.bind(this, id)
		let socket = env.socket, r = false
		if(socket){
			r = true 
			env.response = env.socket 
			conn_.end = env.response.end.bind(env.response)
		}
		if(!socket && env.response){
			socket = env.response.socket
		}
		if(socket) {
			if(socket.$ids){
				socket.$ids.push(id)
			}
			else{
				socket.$ids = []
				socket.on("close", this._onclose.bind(this, socket.$ids))
			}
		}
		if (env.response && !r) {
			env.response.once("close", this._onclose.bind(this, id))
			conn_.end = env.response.end.bind(env.response)
		}


		try {
			if (((ref2 = env.request) != null ? ref2.url : void 0) === "/.o./config") {
				return env.reply.code(200).send(config);
			}

			if ((ref4 = env.request) != null ? ref4.url.startsWith("/.static.") : void 0) {
				if (!env.response.finished) {
					await this.api_kodhe(env);
				}
			}

			if (config.sites) {
				// check global prefixes and hostnames
				host = env.request.headers.host
				ref5 = config.sites
				for (j = 0, len = ref5.length; j < len; j++) {
					site = ref5[j]
					if ((ref6 = site._arouter) != null ? ref6.handle : void 0) {
						await site._arouter.handle(env)
						if (env.response.finished) {
							return
						}
					}
				}
				ref7 = config.sites
				for (k = 0, len1 = ref7.length; k < len1; k++) {
					site = ref7[k]
					if ((ref8 = site._hrouter) != null ? ref8.handle : void 0) {
						func = site._hrouter.find("GET", "/" + host)
						if (typeof (func != null ? func.handler : void 0) === "function") {
							await site._hrouter.handle(env, func)
						}
						if (env.response.finished) {
							return
						}
					} else if (!site._arouter && site.routes && site._urouter) {
						await site._urouter.handle(env)
						if (env.response.finished) {
							return
						}
					}
				}
			}

			ref9 = config.sites
			for (l = 0, len2 = ref9.length; l < len2; l++) {
				site = ref9[l]
				if (((ref10 = site.hostnames) != null ? ref10.indexOf("DEFAULT") : void 0) >= 0) {
					if (site._hrouter) {
						func = site._hrouter.find("GET", "/DEFAULT");
						if (typeof (func != null ? func.handler : void 0) === "function") {
							await site._hrouter.handle(env, func)
						}
						if (env.response.finished) {
							return
						}
					}
				}
			}



			if (env.socket) {
				if (!env.handled) {
					env.socket.end()
				}
			} else {
				if (!env.response.finished) {
					env.reply.code(404).send(JSON.stringify({ error: { code: 'NOTFOUND', message: 'Host configuration not found for domain requested' } }))
				}
			}
			return env = null
		} catch (error) {
			e = error
			if (!((ref11 = env.response) != null ? ref11.finished : void 0)) {
				env.error = e
				this.api_500(env)
			} else {
				console.error(`[kawix/dhs] Error in server handle: ${e.stack}`)
			}
			return env = null
		} finally {
			env = null
		}
	}

	_addHost(host, site) {
		var c, h, ref, ref1;
		if (host != null ? host.middleware : void 0) {
			h = this._createCallback(host.middleware, site)
			c = async function (env, ctx) {
				await h(env, ctx)
				if (!env.response.finished) {
					return (await site._urouter.handle(env, ctx))
				}
			};
		}
		return site._hrouter.get("/" + ((ref = (ref1 = host.host) != null ? ref1 : host.name) != null ? ref : host), c != null ? c : site._urouter)
	}


	_addGlobalPrefix(prefix, site) {
		var c, h, path, ref, ref1
		if (prefix != null ? prefix.middleware : void 0) {
			h = this._createCallback(prefix.middleware, site)
			c = async function (env, ctx) {
				await h(env, ctx)
				if (!env.response.finished) {
					return (await site._urouter.handle(env, ctx))
				}
			}
		}
		path = (ref = prefix.path) != null ? ref : prefix
		if (!path.startsWith("/")) {
			throw Exception.create(`Prefix ${path} is not valid`).putCode("INVALID_PREFIX")
		}
		return site._arouter.use((ref1 = prefix.path) != null ? ref1 : prefix, c != null ? c : site._urouter)
	}



	_createCallback(_route: string | Types.RouteDefinition, site) {
		var g, h, par
		var self = this
		var route: Types.RouteDefinition
		if (typeof _route == "string") {
			route = {
				file: _route
			}
		} else {
			route = _route
		}


		if (route.static) {
			return this._createStaticCallback(route, site)
		}
		par = {
			c: {}
		}
		if (route.folder) {
			par.folder = this.config.resolvePath(route.folder, site)
		}
		if (route.file) {
			par.file = this.config.resolvePath(route.file, site)
		}
		let ctx = this.getContext(site)

		g = async function (env) {
			var e, file, method, mod, name, ref, ref1
			try {
				if (par.folder) {
					name = env.params.file || env.params["*"]
					if (!name) {
						Exception.create("Failed to get a file to execute").putCode("PARAM_NOT_FOUND")
					}
					file = Path.join(par.folder, name)
				} else {
					file = par.file
				}
				mod = par.c[file]
				if (!mod || (mod.__expire && Date.now() >= mod.__expire)) {
					mod = (await import(file))
					if (mod.kawixDynamic) {
						mod.__expire = Date.now() + ((ref = mod.kawixDynamic.time) != null ? ref : 30000)
					}
					par.c[file] = mod
				}
				env.server = self
				method = env.request.method.toLowerCase()
				if (typeof ((ref1 = mod.router) != null ? ref1.handle : void 0) === "function") {
					return (await mod.router.handle(env, ctx))
				} else if (typeof mod[method] === "function") {
					return (await mod[method](env, ctx))
				} else if (typeof mod.httpInvoke === "function") {
					return (await mod.httpInvoke(env, ctx))
				} else if (typeof mod.invoke === "function") {
					return (await mod.invoke(env, ctx))
				} else {
					return env.response.end()
				}
			} catch (error) {
				e = error
				env.error = e
				return self.api_500(env)
			}
		};
		if (route.middleware) {
			h = this._createCallback(route.middleware, site)
			return async function (env, ctx) {
				await h(env, ctx)
				if (!env.response.finished) {
					return (await g(env, ctx))
				}
			}
		}
		return g
	}

	_createStaticCallback(route, site) {
		var g, h, path, ref
		if (route.static) {
			path = (ref = route.static.path) != null ? ref : route.static
			path = this.config.resolvePath(path, site)
			g = KawixHttp.staticServe(path, route.static.options)
			if (route.middleware) {
				h = this._createCallback(route.middleware, site)
				return async function (env, ctx) {
					await h(env, ctx)
					if (!env.response.finished) {
						return (await g(env, ctx))
					}
				}
			}
			return g
		}
	}


	async _cluster(name?: string){		
		let config = this.config.readCached()
		let clusters = config.cluster || [{
			purpose:'default',
			address: config.address
		}]
		for(let i=0;i<clusters.length;i++){
			let cluster = clusters[i]
			if(cluster.count == "all") cluster.count = Os.cpus().length 
			if(cluster.min) cluster.count = Math.min(cluster.count, cluster.min)
			if(cluster.max) cluster.count = Math.max(cluster.count, cluster.max)
			for(let y=0;y<cluster.count;y++){
				let w = this._fork(cluster)
				if(name)w._cid = name 				
			}
			await async.sleep(200)
		}
	}


	_fork(cluster) {
		var env, ref, self, u, w
		self = this
		env = Object.assign({}, process.env, (ref = cluster.env) != null ? ref : {})
		env.ADDRESS = cluster.address
		env.KAWIX_PURPOSE = cluster.purpose
		if(cluster.httpOptions)
			env.DHS_HTTP_CONFIG= JSON.stringify(cluster.httpOptions)

		if(env.MEMSHARING){
			env.NO_MASTER = "1"			
			w = Child.spawn(process.argv[0], process.argv.slice(1), {
				stdio:'inherit',
				env
			})
			w.child = true
		}
		else{
			w = Cluster.fork(env)
			w.child = false 
			w.pid = w.process.pid
		}		
		this.workers.push(w)
		w.env = env
		w.info = cluster
		w.purpose = cluster.purpose
		self = this
		w.on("error", function (e) {
			return console.error("[kawix/dhs] Error in worker: ", w.pid, e);
		});
		w.once("exit", function () {
			var i;
			i = self.workers.indexOf(w);
			self.workers.splice(i, 1);
			if (!w.finished) {
				return self._fork(cluster);
			} else {
				return console.info(`[kawix/dhs] Worker ${w.pid} fully closed`);
			}
		})
		return w;
	}

	async _executeCron(site, cron, ctx) {
		var ccron, e, file, mod
		try {
			if (cron.id) {
				ccron = this._crons[cron.id]
			}
			console.log("\x1b[32m[kawix/dhs] Info:", "\x1b[0m" + `Starting cron ${cron.id}`)
			cron._executing = true
			if (ccron) {
				ccron._executing = true
			}
			file = this.config.resolvePath(cron.file, site)
			try {
				mod = (await import(file))
			} catch (e) {
				if (e.message.indexOf("Cannot resolve") >= 0)
					console.info("\x1b[32m[kawix/dhs] Info:", "\x1b[0m" + `No cron tasks configured for ${site.name}: ${e.message}`)
				else
					throw e
				return
			}
			await mod.invoke({
				server: this
			}, ctx)
			cron._executed = Date.now()
			if (ccron) {
				return ccron._executed = Date.now()
			}
		} catch (error) {
			e = error
			return console.error(`[kawix/dhs] Failed executing cron: ${cron.name || 'nodefined'} in site ${site.name}. Error: `, e.message)
		} finally {
			cron._executing = false
			if (ccron) {
				ccron._executing = false
			}
		}
	}

	async _start() {
		var addr, config, def: async.Deferred<any>
		config = this.config.readCached()
		addr = config.address || process.env.DHS_ADDRESS || process.env.ADDRESS
		if (!addr) {
			return Exception.create("Listen address no specified").putCode("INVALID_ADDR").raise()
		}

		if(process.env.DHS_SSL || process.env.DHS_SSL_KEY){
			let key, cert;
			if(process.env.DHS_SSL_KEY){
				key = await fs.readFileAsync(process.env.DHS_SSL_KEY)
			}
			if(process.env.DHS_SSL_CERT){
				cert = await fs.readFileAsync(process.env.DHS_SSL_CERT)
			}
			config.httpOptions = Object.assign({},config.httpOptions||{}, {
				ssl: true,
				key,
				cert			
			})
		}else{
			if(process.env.DHS_HTTP_CONFIG){
				config.httpOptions = JSON.parse(process.env.DHS_HTTP_CONFIG)
			}
			else{
				config.httpOptions = config.httpOptions || {}
			}
		}

		if(config.httpOptions.keyFile){
			config.httpOptions.key =  await fs.readFileAsync(config.httpOptions.keyFile)
			delete config.httpOptions.keyFile
		}
		if(config.httpOptions.certFile){
			config.httpOptions.cert =  await fs.readFileAsync(config.httpOptions.certFile)
			delete config.httpOptions.certFile
		}

		// create the server
		this.http = new KawixHttp.server()
		if (config.maxqueuecount) {
			this.http.maxqueuecount = config.maxqueuecount
		}
		def = new async.Deferred<any>()
		this.address = (await this.http.listen(addr, config.httpOptions))
		console.info("\x1b[32m[kawix/dhs] Info:", "\x1b[0m" + "Listening on", this.address, "SSL =", !!config.httpOptions.ssl)
		if (isMaster) {
			this.emit("listen", this.address)
		} else {
			this.address.rpa_plain = true
			this.channel.client.emit("listen", this.address)
		}
		// build Router for each Site
		this.startbuildingRoutes()
		this.started = Date.now()
		// start accept
		return this._accept()
	}


	async _startCrons() {

		await async.sleep(10000)
		let worker = await this.findWorker({
			purpose: ['cron', 'tasks']
		})
		if (!worker && (this.workers.length == 1)) {
			worker = this.workers[0]
		}
		if (worker && worker.service) {
			// execute cron 
			await worker.service.dynamicRun(`
			let service = arguments[0]
			service._startCron()
			`)
		}

		await async.sleep(50000)
		return setImmediate(this._startCrons.bind(this))

	}


	async _startCron(){
		if (this._cronstop) {
			return
		}

		let config = this.config.readCached()
		if(config.sites){
			for(let i=0;i<config.sites.length;i++){
				let site = config.sites[i]
				let ctx = this.getContext(site)
				let crons = site.crons

				if(crons){
					for(let y=0;y<crons.length;y++){
						let cron = crons[y]
						let c = cron.worker || "CRON_ENABLED"
						if(!cron.name) cron.name = 'default'
						cron.id = site.name + "." + cron.name 
						let ccron = this._crons[cron.id]
						if(ccron){
							cron._executing = ccron._executing
							cron._executed = ccron._executed
						}
						if(c == "all" || (parseInt(process.env[c]) == 1)){
							if((cron.interval || 120000) >= (Date.now() - (cron._executed || Date.now()))){
								if(!cron._executing) this._executeCron(site, cron, ctx)
							}
						}
					}
				}
			}
		}
	}


	async _waitcron(timeout = 180000) {
		var cron, executing, id, ref, results, time
		time = Date.now()
		results = []

		while (true) {
			if (Date.now() - time > timeout) {
				throw Exception.create("Timedout waiting finishing crons").putCode("TIMEDOUT")
			}
			executing = false
			ref = this._crons
			for (id in ref) {
				cron = ref[id]
				if (cron._executing) {
					executing = true
					break
				}
			}
			if (executing) {
				results.push((await async.sleep(2000)))
			} else {
				break
			}
		}
		return results
	}

	_siteimport() {
		var self
		self = this
		return async function (file) {
			var cached, ref
			this.__mod = (ref = this.__mod) != null ? ref : {}
			file = self.config.resolvePath(file, this)
			cached = this.__mod[file]
			if (cached && cached.__time && (Date.now() <= cached.__time)) {
				// cache is good
				void 0
			} else {
				cached = (await import(file))
				if (cached.kawixDynamic) {
					cached.__time = Date.now() + (cached.kawixDynamic.time || 10000)
				}
				this.__mod[file] = cached
			}
			return cached
		}
	}



	async attachToMaster() {
		this.channel = await Channel.connectLocal(process.env.KAWIX_CHANNEL_ID)
		this.channel.client.setWorkerService(process.pid, this)
	}

	// added. Comunicate between al processes not only master
	async attachToWorker(pid) {
		if (!this.channels[pid]) {
			if (Os.platform() == "win32") {

				let client = await this.channel.client.dynamicRun(`
				let works = arguments[0].workers.filter(function(a){
					return a.pid == ${JSON.stringify(pid)}
				})
				if(!works.length) return null 
				if(works[0].child) return "child"
				return works[0].service
				`)
				console.info("SERVICE:", client)
				if(client == "child"){
					this.channels[pid] = await Channel.connectLocal(process.env.KAWIX_CHANNEL_ID + "." + pid)	
				}
				else{
					if (!client) return null
					this.channels[pid] = {
						client,
						plain: this.channel.plain.bind(this.channel)
					}
				}
			}
			else {
				this.channels[pid] = await Channel.connectLocal(process.env.KAWIX_CHANNEL_ID + "." + pid)
			}
		}
		return this.channels[pid]
	}


	async closeAndExit(timeout = 2 * 3600) {
		var e, num
		num = 0
		try {
			this._cronstop = true
			try {
				// wait crons
				await this._waitcron()
			} catch (error) { }
			return (await this.http.close(timeout))
		} catch (error) {
			e = error
			return num = 100
		} finally {
			process.exit(num)
		}
	}

	// should be called async 
	findWorkerPID(worker: { purpose?: string | string[], env?: string | string[] }) {
		if (!isMaster) {
			return this.channel.client.findWorkerPID({
				rpa_plain: worker
			})
		}

		let nworker = this.findWorker(worker)
		return nworker && nworker.pid
	}

	get workerPIDs() {
		return this.workers.map((a) => a.pid)
	}


	findWorker(workerc: { purpose?: string | string[], env?: string | string[] }) {


		let nworker = null
		if (!isMaster) return null


		if (workerc.purpose) {
			let p = (workerc.purpose instanceof Array) ? workerc.purpose : [workerc.purpose]
			for (let i = 0; i < this.workers.length; i++) {
				let worker = this.workers[i]
				if (worker.purpose) {
					let pdata = worker.purpose.split("|")
					for (let p1 of pdata) {
						if (p.indexOf(p1) >= 0) {
							nworker = worker
							break
						}
					}
					if (nworker) break
				}
			}
		}

		if (workerc.env) {
			let p = (workerc.env instanceof Array) ? workerc.env : [workerc.env]
			for (let i = 0; i < this.workers.length; i++) {
				let worker = this.workers[i]
				for (let e in p) {
					if (worker.env[e] == 1) {
						nworker = worker
						break
					}
				}
			}
		}

		return nworker
	}

	fork(cluster) {
		return this._fork(cluster)
	}


	getAddress() {
		return this.address
	}

	getConfig() {
		return this.config.readCached()
	}

	get connections() {
		if (!this._urlconns.rpa_plain) {
			Object.defineProperty(this._urlconns, 'rpa_plain', {
				enumerable: false,
				value: true
			})
		}
		return this._urlconns
	}

	async getDataPath(): Promise<string> {
		var path
		path = Path.join(Os.homedir(), ".kawi")
		if (!(await fs.existsAsync(path))) {
			await fs.mkdirAsync(path)
		}
		return path
	}

	parseAddress(address): string {
		var value
		value = {}
		if (typeof address === "string") {
			if (address.indexOf(":") >= 0) {
				value.host = address.split(":")
				value.port = parseInt(value.host[1])
				value.host = value.host[0];
			} else {
				return address
			}
		} else {
			value.host = '127.0.0.1'
			value.port = parseInt(address)
		}
		return value
	}







	async setWorkerService(pid: number, service: Service) {
		for (let i = 0; i < this.workers.length; i++) {
			let worker = this.workers[i]
			if (worker.pid == pid) {
				service.rpa_preserve()
				worker.service = service
			}
		}
	}








	async start() {
		var config, e

		if (isMaster) {
			
			config = (await this.config.read())
			this.channel = await Channel.registerLocal("DHS." + config.id, this)
			process.env.KAWIX_CHANNEL_ID = "DHS." + config.id
			if (config.singleprocess) {
				await this._start()
			}
			else {
				(await this._cluster())
			}

			this._startCrons()
			return this
		} else {
			this.config.stop()
			delete this.config
			// register a channel for each process, so can comunicate 

			await this.attachToMaster()
			let tclient = await this.channel.client.config()
			this.config = new ConfigRPA(tclient)
			let config1 = await this.config.read()
			let id = "DHS." + config1.id + "." + process.pid
			if (Os.platform() != "win32"){
				await Channel.registerLocal(id, this)
			}
			else if(process.env.NO_MASTER == "1"){
				await Channel.registerLocal(id, this)
			}
			//this.config._load()
			//await this.config.read()
			return (await this._start())
		}
	}


	// reload workers gracefull, when main configuration changed
	async reloadCluster() {
		// This need be change, to fully use the new RPA
	}



	startbuildingRoutes() {
		if (this.startbuildingRoutes.timer) {
			clearTimeout(this.startbuildingRoutes.timer)
		}
		// Previous 200ms, now wait about 1.5 second, maybe is better
		this.startbuildingRoutes.timer = setTimeout(this.buildRoutes.bind(this), 1500)
	}

	async buildRoutes() {

		var config, e, host, hostnames, id, j, k, l, len, len1, len2, len3, len4, len5, m, mod, n, o, prefix, preload, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, results, route, site, val;
		config = this.config.readCached()
		if (!this.__time) {
			this.__time = config.__time
		} else {
			if (this.__time != config.__time) {
				this.__time = config.__time
				// close for restart, only if multiprocess
				if (!isMaster) {
					console.info("[kawix/dhs] Main config change detected, restarting cluster")
					this.closeAndExit()
					return
				}
			} else {
				console.info("\x1b[32m[kawix/dhs] Info:", "\x1b[0m" + " Site change detected")
			}
		}


		// wait a little?

		this.config.once("change", this.startbuildingRoutes.bind(this))
		if (!config.sites) {
			return
		}
		ref = this._contexts
		for (id in ref) {
			val = ref[id]
			val.config = config
		}
		ref1 = config.sites
		results = []
		for (j = 0, len = ref1.length; j < len; j++) {
			site = ref1[j]
			try {
				if (site.preload) {
					if (!(site.preload instanceof Array)) {
						site.preload = [site.preload]
					}
					ref2 = site.preload
					for (k = 0, len1 = ref2.length; k < len1; k++) {
						preload = ref2[k]
						preload = this.config.resolvePath(preload, site)
						mod = (await import(preload))
						if (typeof mod.invoke === "function") {
							await mod.invoke({
								server: this,
								site: site,
								config: this.config.readCached()
							})
						}
					}
				}

				if (!site._hrouter) {
					site._hrouter = new KawixHttp.router()
					site._urouter = new KawixHttp.router()
					if ((ref3 = site.hostnames) != null ? ref3 : site.hosts) {
						hostnames = (ref4 = site.hostnames) != null ? ref4 : site.hosts
						for (l = 0, len2 = hostnames.length; l < len2; l++) {
							host = hostnames[l]
							this._addHost(host, site)
						}
					}
					if (site.globalprefixes) {
						site._arouter = new KawixHttp.router()
						ref5 = site.globalprefixes

						// global prefixes can be analyzed before?
						for (m = 0, len3 = ref5.length; m < len3; m++) {
							prefix = ref5[m]
							this._addGlobalPrefix(prefix, site)
						}
					}
					if (site.prefixes) {
						ref6 = site.prefixes
						for (n = 0, len4 = ref6.length; n < len4; n++) {
							prefix = ref6[n]
							site._urouter.use(prefix, this._createCallback(route, site), route.store)
						}
					}
					if (site.routes) {
						ref7 = site.routes
						for (o = 0, len5 = ref7.length; o < len5; o++) {
							route = ref7[o]
							site._urouter[route.method || "all"](route.path, this._createCallback(route, site), route.store)
						}
					}
					if (site.defaultroute) {
						route = site.defaultroute
						if (typeof route === "string") {
							route = {
								method: "all",
								file: route
							}
						}
						results.push(site._urouter.NOTFOUND(this._createCallback(route, site), route.store))
					} else {
						results.push(void 0)
					}
				} else {
					results.push(void 0)
				}
			} catch (error) {
				e = error
				results.push(console.error("[kawix/dhs] Failed reloading site routes: ", e))
			}
		}
		return results
	}

	async dynamicImport(file: string) {
		return await import(file)
	}

	dynamicRun(code: string) {
		let func = Function("", code)
		return func(this)
	}





	getContext(site) {
		var config, ctx: Types.Context, j, len, ref, s, sitename
		sitename = site
		config = this.config.readCached()
		if (typeof sitename === "object") {
			sitename = site.name
		}
		if (typeof site === "string") {
			ref = config.sites
			for (j = 0, len = ref.length; j < len; j++) {
				s = ref[j]
				if (s.name === site) {
					site = s
				}
			}
			if (typeof site === "string") {
				site = {
					name: "$default",
					_notfound: true
				}
			}
		}
		ctx = this._contexts[sitename]
		if (!ctx) {
			ctx = (this._contexts[sitename] = {}) as Types.Context
			ctx.server = this
			ctx.config = config
		}
		ctx.site = site
		ctx.config = config
		return ctx
	}





	api_config(env) {
		var config
		config = this.config.readCached()
		return env.reply.code(200).send(config)
	}

	api_500(env) {
		var e
		try {
			return env.reply.code(500).send({
				error: {
					message: env.error.message,
					code: env.error.code,
					stack: env.error.stack
				},
				status: 'error'
			})
		} catch (error) {
			e = error
			return console.error("Error from ENV: ", env.error)
		}
	}




	async api_kodhe(env) {
		var bund, uri
		if (!this.__ks2) {
			this.__ks2 = new KawixHttp.router()
			bund = this._bundle.bind(this)
			// deprecated #
			this.__ks2.get("/.static./bundle/cached/:sitecache/:module", bund)
			this.__ks2.get("/.static./bundle/complete/cached/:sitecache/:module", bund)
			this.__ks2.get("/.static./bundle/cached/:sitecache/:module/*", bund)
			this.__ks2.get("/.static./bundle/complete/cached/:sitecache/:module/*", bund)
			this.__ks2.get("/.static./bundle/:module", bund)
			this.__ks2.get("/.static./bundle/:module/*", bund)
			// deprecated #
			this.__ks2.get("/.static./generate/cached/:sitecache/:module", bund)
			this.__ks2.get("/.static./generate/complete/cached/:sitecache/:module", bund)
			this.__ks2.get("/.static./generate/cached/:sitecache/:module/*", bund)
			this.__ks2.get("/.static./generate/complete/cached/:sitecache/:module/*", bund)
			this.__ks2.get("/.static./generate/:module", bund)
			this.__ks2.get("/.static./generate/:module/*", bund)
			this.__ks2.get("/.static./generate/:type/cached/:sitecache/:module", bund)
			this.__ks2.get("/.static./generate/:type/complete/cached/:sitecache/:module", bund)
			this.__ks2.get("/.static./generate/:type/cached/:sitecache/:module/*", bund)
			this.__ks2.get("/.static./generate/:type/complete/cached/:sitecache/:module/*", bund)
			this.__ks2.get("/.static./generate/:type/:module", bund)
			this.__ks2.get("/.static./generate/:type/:module/*", bund)
			this.__ks2.get("/.static./local/bundle/:site/*", bund)
		}

		uri = env.request.uri
		if (!uri) {
			uri = Url.parse(env.request.url)
		}
		if (uri.pathname === "/.static./js/kawix.core.js") {
			env.request.url = '/main.js'
			if (!this.__ks0) {
				this.__ks0 = KawixHttp.staticServe(Path.join(Path.dirname(kawix.__file), "crossplatform", "dist"))
			}
			await this.__ks0(env)
		} else if (uri.pathname === "/.static./js/kawix.async.js" || uri.pathname === "/.static./js/kawix.core.async.js") {
			env.request.url = '/main.js'
			if (!this.__ks1) {
				this.__ks1 = KawixHttp.staticServe(Path.join(Path.dirname(kawix.__file), "crossplatform", "async", "dist"))
			}
			await this.__ks1(env)
		} else {
			await this.__ks2.handle(env)
		}
		env = null
	}



}

export default Service

/*
export var create = function(state, socket, params) {
	var j, len, ref, server, w;
	server = Service.current;
	if ((params != null ? params.pid : void 0) && server.workers) {
		ref = server.workers;
		// get worker by pid
		for (j = 0, len = ref.length; j < len; j++) {
			w = ref[j];
			if (w.process.pid === params.pid) {
				break;
			}
			w = null;
		}
	}
	if (w && (!w.IPC)) {
		w.IPC = IPC.fromClientSocket(socket, server);
	}
	return Service.current;
}
*/