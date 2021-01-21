
import './deps'

import '/virtual/@kawix/std/coffeescript/register'
import '/virtual/@kawix/std/coffeescript/cson/register'

import Exception from '/virtual/@kawix/std/util/exception'
import {Channel} from '/virtual/@kawix/std/rpa/channel.v2'
import * as Types from '../src/typings'
import Server from '/virtual/@kawix/std/http/server'
import {Router} from '/virtual/@kawix/std/http/router'
import HttpStatic from '/virtual/@kawix/std/http/static'
import Cluster from 'cluster'
import Child from 'child_process'
import Path from 'path'
import * as async from '/virtual/@kawix/std/util/async'

//import 'npm://chokidar@3.5.1'
//import * as chokidar from 'chokidar'

import '/virtual/@kawix/std/package/kwa/register'
import { staticServe } from '/virtual/@kawix/std/http/mod'
import {EventEmitter} from 'events'
import Os from 'os'
import fs from '/virtual/@kawix/std/fs/mod'

import {Watcher} from './watcher'

export class Service extends EventEmitter{

    $start = function(){}
    $router: Router
    $config: any 
    $sites: Map<string,any> = new Map()
    $sitesb: Map<string,any> = new Map()
    $http: Server
    $started = 0
    $current = new Map()
    $rid = 0
    $customId= Date.now().toString(36).toUpperCase()
    $erCallback = null 
    $name = "dhs.service.v2-" + (process.env.KOWIX_SOCKET_NAME|| "default") + "+"
    $clusters = new Map() 
    $main = null 
    $configClients = new Map()
    $useHttp = false 

    ipcmodule = "RPA"
    address: any
    enableOutput = true 
    notFoundCallback = null 
    errorCallback = null
    restartOnControlExit = true  
    

    constructor(config){
        super()
        this.$config = config
        this.$router = new Router()        
    }


    setConfig(config){
        this.$config = config 
    }

    getContext(sitename){
        let site = sitename 
        if(typeof sitename == "string"){
            site = this.$sitesb.get(sitename)
        }
        //if(!site) throw Exception.create("Site " + sitename + " not found").putCode("SITE_NOT_FOUND")
        let ctx = {
            server: this,
            config: this.$config,
            site: site && site.config,
            siteData: site
        }
        return ctx 
    }

    async dynamicImport(file: string) {
		return await import(file)
    }
    
    dynamicRun(code: string) {
		let func = Function("", code)
		return func(this)
	}


    findWorkerPID(purpose){

        if(this.$main){
            return this.$main.findWorkerPID(purpose)
        }

        if(typeof purpose == "object"){
            purpose = purpose.purpose
        }
        if(!(purpose instanceof Array)){
            purpose = [purpose]
        }
        for(let p of purpose){
            let c = this.$clusters.get(p)
            if(c){
                return c.pid 
            }
        }
    }

    async attachToWorker(pid){

        let c = this.$clusters.get(pid)
        if(c){
            return c.channel 
        }

        // attach 
        let channel = await this.$connect(pid)
        this.$clusters.set(pid, {
            channel,
            pid
        })
        return channel

    }

    get config(){ return this.$config }
    get http(){return this.$http}
    get concurrent(){
        return this.$current.size
    }

    getDataPath(): string {
		let path = Path.join(Os.homedir(), ".kawi")
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path)
		}
		return path
	}

    

    async start(){

        let m = function(code){
            let workers = this.$clusters
            if(workers){
                return function(){
                    let keys = workers.keys()
                    for(let i=0;i<keys.length;i++){
                        let worker = workers.get(keys[i])
                        if(worker.type == "fork"){
                            process.kill(worker.pid, code)
                        }
                    }
                    setTimeout(function(){
                        process.exit(1)
                    }, 500)
                }
            }
            else{
                return function(){process.exit(0)}
            }
        }
        

		process.on('exit', m("SIGINT"))
		process.on('SIGUSR1', m("SIGINT"))
		process.on('SIGUSR2', m("SIGINT"))
		process.on('SIGINT', m("SIGINT"))
        process.on('SIGTERM', m("SIGTERM"))
        

        let pid = this.findWorkerPID("control")
        if(!pid){
            await this.$startManager()
            await this.$startHttp(this.$config)
        }
        else{
            let worker = await this.attachToWorker(pid)
            await worker.client.$startManager()
        }
    }




    async fork(purpose = 'control', type = 'fork', config = null){

        if(config && config.env && config.env.MEMSHARING)
            purpose = "control"


        // start another process 
        let def = new async.Deferred<void>(), ok = false        
        let cdesc= {
            channel:undefined,
            pid: 0,
            stdout: [],
            finished: false,   
            type,
            stderr: []
        }
        let pro = null , worker = null
        if(type == "cluster"){
            Cluster.setupMaster({
                exec: process.argv[1],
                args: [Path.join(__dirname, "start.1")]
            })

            worker = Cluster.fork(Object.assign({}, process.env, (config && config.env)||{}, {
                DHS_CLUSTER_NAME: purpose,
                FORCE_COLOR: "1"
            }))
            pro = worker.process
        }
        else if(type == "fork"){
            
            let args = [process.argv[1], Path.join(__dirname, "start.1")]
            let p = Child.spawn(process.argv[0], args, {
                env: Object.assign({}, process.env, (config && config.env)||{}, {
                    DHS_CLUSTER_NAME: purpose,
                    FORCE_COLOR: "1"
                })
            })
            pro = p
        }


        let onstd = null , onstd1 = null 
        onstd1 = function(std, b){
            let o = cdesc[std]
            o.push(b)
            if(o.length > 200)  o.shift()            
            if(this.enableOutput)
                this.$writeStd(std, b)
        }
        onstd = (b)=>{
            if(!ok){
                if(b.toString().startsWith("Cluster started")){
                    ok = true 
                    pro.stdout.removeListener("data",onstd)
                    pro.stdout.on("data", onstd1.bind(this,"stdout"))
                    def.resolve()
                }
            }
        }

        if(type == "cluster"){
            worker.once("message", function(msg){
                ok = true 
                def.resolve()
            })

            worker.on("exit", ()=>{

                console.info(`Process with PID:${pro.pid} finished.`)
                this.$clusters.delete(pro.pid)
                // reopen?
                if(cdesc.finished) return
                setTimeout(()=>{
                    this.fork(purpose, type, config)
                }, 100)                
                def.resolve()
            })
        }
        else{
            pro.stdout.on("data", onstd)        
            pro.stderr.on("data", onstd1.bind(this,"stderr"))
            process.on('uncaughtException', function (err) {
                console.log(err)
            })
            
            pro.on("exit", ()=>{

                console.info(`Process with PID:${pro.pid} finished.`)
                
                this.$clusters.delete(pro.pid)
                this.$clusters.delete(purpose)
                // reopen?
                if(cdesc.finished) return

                
                setTimeout(()=>{
                    if(purpose == "control" && this.restartOnControlExit){
                        this.restart()
                    }
                    else{
                        this.fork(purpose, type, config)
                    }
                }, 100)                
                def.resolve()
            })
            pro.on("error", def.reject)

        }
        await def.promise 
        if(!ok)
            throw Exception.create("Failed starting child process").putCode("CHILD_FORK_FAILED")


        let channel = await this.$connect(pro.pid)
        cdesc.pid = pro.pid 
        cdesc.channel = channel
        await channel.client.setConfig(channel.plain(this.$config))
        await channel.client.$setMain(this)
        if(purpose.indexOf("control") >= 0){
            this.$clusters.set(purpose, cdesc)
            if(config && config.address){                
                channel.client.$startHttp(config)
            }
        }else{
            await channel.client.$startClientManager()
            channel.client.$startHttp(config)        
        }
        this.$clusters.set(cdesc.pid, cdesc)
    }

    configureStart(start){
        this.$start = start 
    }


    async restart(){

        let keys = this.$clusters.keys()
        for(let key of keys){
            let c = this.$clusters.get(key)
            if(c){
                c.finished = true 
                process.kill(c.pid,'SIGTERM')
            }
        }

        // start again? 
        if(this.$start){
            await async.sleep(1000)
            await this.$start()
        }

    }

    $setHttp(value){
        this.$useHttp = value
    }

    get useHttp(){
        return (!this.$main) || this.$useHttp
    }

    $writeStd(type, buffer){
        process[type].write(buffer)
    }

    ping(){
        console.info("ping!")
    }

    $setMain(service){
        this.$main = service
        this.$main.rpa_preserve()        
        return 
    }



    async $startHttp(config = null){
        this.$http = new Server()
        if (this.$config.maxqueuecount) {
			this.$http.maxqueuecount = this.$config.maxqueuecount
        }

        config = config || {}
        this.address = (await this.$http.listen(config.address || "0.0.0.0:8081", config.httpOptions))
        console.info("Started:", this.address)
        this.$started= Date.now()
        await this.$accept()
    }


    async $register(name){
        let cid = this.$name + name
        await Channel.registerLocal(cid, this)
    }

    async $connect(name){
        let cid = this.$name + name
        return await Channel.connectLocal(cid)
    }

    async $accept(){
        while(true){
            let env = await this.$http.accept()
            this.$handle(env)
        }
    }

    $onclose(ids: string | string[]) {
		if (ids instanceof Array) {
			for (let id of ids) {
				if (this.$current.get(id)) {
					//this._concurrent--
					this.$current.delete(id)
				}
			}
		}
		else {
			let id = ids
			if (this.$current.get(id)) {
				delete this.$current.delete(id)
			}
		}

    }
    

    async $handle(env){
        env.request.id = this.$customId + (this.$rid++)
        this.$current.set(env.request.id, env)

        try{

            if(env.request)
                env.request.on("error",(e)=> console.error("Error in request:",e.message))
            if(env.socket)
                env.socket.on("error",(e)=> console.error("Error in socket:",e.message))

            let socket = env.socket 
            if(!socket) socket= env.response.socket 
            if(socket){
                if(socket.$ids){
                    socket.$ids.push(env.request.id)
                }
                else{
                    socket.$ids = []
                    socket.on("close", this.$onclose.bind(this, socket.$ids))
                }
            }
            await this.$router.handle(env)
            if(!env.response.finished){
                let hostname = env.request.headers["host"]
                if(hostname){
                    env.request.url = "/HOST_" + hostname + env.request.url             
                    await this.$router.handle(env)
                }
            }

            if(!env.response.finished){
                //this.emit("NOTFOUND", env)
                await (this.notFound && this.notFound(env))
            }

            if(!env.response.finished){
                env.response.write(JSON.stringify({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'URL not found'
                    }
                }))
                env.response.end()
            }
        }catch(e){
            console.error("Failed to serve:",e)
        }finally{
            this.$current.delete(env.request.id)
        }
    }


    async $clusterConfig(){
        let env = Object.assign({}, process.env)
        if(typeof this.$config == "object"){
            env.DHS_CONFIG_JSON = JSON.stringify(this.$config)
        }else{
            env.DHS_CONFIG_FILE = this.$config
        }
        
        let p1 = await Child.spawn(process.argv[0], [process.argv[1], __filename], {
            env
        })

    }

    // Manager process
    // execute crons and other things
    async $startClientManager(){

        let pid = await this.findWorkerPID("control")
        let channel = await this.attachToWorker(pid)
        
        let sites = await channel.client.$getNaturalSites()
        this.$backwardFuncs()

        for(let site of sites){
            await this.$add(site.source, site)
        }        
        this.$buildMain()
        await channel.client.$addManagerClient(process.pid, this)
        
    }

    $addManagerClient(id, service){
        this.$configClients.set(id, service)
        service.rpa_preserve()
    }

    $getNaturalSites(){
        return this.$config.sites  || []
    }

    $backwardFuncs(){
        // BACKWARD FUNCTIONS 
        this.$config.resolvePath = (path, siteDesc)=>{
            let site = this.$sitesb.get(siteDesc.id)
            if(site){
                return this.$resolve(path, site)
            }
            return "null"
        }
        this.$config.__defineGetter__("sites", ()=>{
            let sites = []
            let keys = this.$sites.keys()
            for(let key of keys){
                sites.push(this.$sites.get(key))
            }
            return sites
        })
        this.$config.readCached = function(){
            return this
        }
        // BACKWARD FUNCTIONS 
    }

    async $startManager(){
        let config = null, base = null 
        if(typeof this.$config == "object"){
            config = this.$config
        }else{
            base = Path.dirname(this.$config)
            config = await import(this.$config)
            config = config.config || config.default || config
        }
        this.$config = config 
        this.$backwardFuncs()        

        if(process.env.PROJECTS_DIR) base = process.env.PROJECTS_DIR
        if(process.env.DHS_BASE_DIR) base = process.env.DHS_BASE_DIR
        if(!base) base = Path.join(__dirname, "..", "..", "..", "sites")
    
        let include = config.include.map(function(path){
            if(path.startsWith(".")){
                return Path.join(base, path)
            }
            return path
        })
        if(!include.length) return;
        

        /*
        let watcher = chokidar.watch(include[0],{
            persistent: true,
            followSymlinks: false,
            awaitWriteFinish: true,
            ignorePermissionErrors : true
        })
        
        console.info(include)
        watcher.add(include.slice(1))
        watcher.on("add", (path)=>{
            console.log("Nuevo archivo agregado:", path)
            this.$addFile(path)
        })
        watcher.on("change", (path)=>{
            console.log("Archivo cambiado:", path)
        })
        watcher.on("unlink", (path)=>{
            console.log("Archivo eliminado:", path)
        })*/
        let watcher = new Watcher()
        watcher.watch(include)
        watcher.on("add", (path)=>{
            console.log("Nuevo archivo agregado:", path)
            this.$addFile(path)
        })
        watcher.on("remove", (path)=>{
            console.log("Archivo eliminado:", path)
            this.$deleteFile(path)
        })


        if(process.env.CRON_ENABLED){

            // start executing cron
            setTimeout(this.$startCrons.bind(this), 8000)
            //this.$startCrons()

        }

    }

    async $startCrons(){
        let sites = this.$config.sites 
        //console.info("executing crons:")
        for(let site of sites){
            let ctx = this.getContext(site)
            if(site.config.crons){
                for(let cron of site.config.crons){
                    //console.info("executing cron:", cron)
                    try{
                        let file = this.$resolve(cron.file, site)
                        let mod = (await import(file))
                        await mod.invoke({
                            server: this
                        }, ctx)
                    }
                    catch(e){
                        console.error(`[kawix/dhs] Failed executing cron: ${cron.name || 'nodefined'} in site ${site.name}. Error: `, e.message)
                    }
                }
            }
        }

        setTimeout(this.$startCrons.bind(this), 120000)
    }

    async $addFile(path){
        let mod = await import(path)
        let src = path 
        mod = mod.config || mod.default  || mod
        if(mod.configfile){
            
            src = mod.configfile
            mod = await import(mod.configfile)
        }
        let current = this.$sites.get(path)
        if(current){
            // delete 
            await this.$deleteFile(path)
        }
        mod = mod.site || mod 
        let site = {
            id: mod.id,
            name: mod.site,
            config: mod,
            source: path,
            resolvedSource: src,
            resolvedPath: Path.dirname(src),
            started: Date.now()
        }

        if(this.$main){
            let keys = this.$configClients.keys()
            for(let key of keys){
                let s = this.$configClients.get(key)
                try{
                    await s.$add(path, {rpa_plain:site})
                    //console.info("Called client")
                }catch(e){
                    if(e.code == "RPA_DESTROYED")
                        this.$configClients.delete(key)
                }
            }
            
            
        }
        //else{
        if(this.$http){
            await this.$add(path, site)
        }
        else{
            this.$sites.set(path, site)
            this.$sitesb.set(site.id, site)
            this.$sitesb.set(site.name, site)
        }
    }

    async $deleteFile(path){
        if(this.$main){        
            
            let keys = this.$configClients.keys()
            for(let key of keys){
                let s = this.$configClients.get(key)
                try{
                    await s.$delete(path)
                    //console.info("Called client")
                }catch(e){
                    if(e.code == "RPA_DESTROYED")
                        this.$configClients.delete(key)
                }
            }
        }

        if(this.$http){
            await this.$delete(path)
        }
        else{
            let site = this.$sites.get(path)
            if(site){
                this.$sites.delete(path)
                this.$sitesb.delete(site.id)
                if(site.id != site.name) this.$sitesb.delete(site.name)
            }
        }
        //}
    }




    async $add(path, site){
        this.$sites.set(path, site)
        this.$sitesb.set(site.id, site)
        this.$sitesb.set(site.name, site)
        await this.$buildRoutes(site)
        this.$buildMain()
    }
    $delete(path){
        let site = this.$sites.get(path)
        if(site){
            this.$sites.delete(path)
            this.$sitesb.delete(site.id)
            if(site.id != site.name) this.$sitesb.delete(site.name)
            this.$buildMain()
        }   
    }





    $buildMain(){
        this.$router = new Router()

        let bund = this.$bundle.bind(this)
        this.$router.get("/.static./bundle/cached/:sitecache/:module", bund)
        this.$router.get("/.static./bundle/complete/cached/:sitecache/:module", bund)
        this.$router.get("/.static./bundle/cached/:sitecache/:module/*", bund)
        this.$router.get("/.static./bundle/complete/cached/:sitecache/:module/*", bund)
        this.$router.get("/.static./bundle/:module", bund)
        this.$router.get("/.static./bundle/:module/*", bund)
        // deprecated #
        this.$router.get("/.static./generate/cached/:sitecache/:module", bund)
        this.$router.get("/.static./generate/complete/cached/:sitecache/:module", bund)
        this.$router.get("/.static./generate/cached/:sitecache/:module/*", bund)
        this.$router.get("/.static./generate/complete/cached/:sitecache/:module/*", bund)
        this.$router.get("/.static./generate/:module", bund)
        this.$router.get("/.static./generate/:module/*", bund)
        this.$router.get("/.static./generate/:type/cached/:sitecache/:module", bund)
        this.$router.get("/.static./generate/:type/complete/cached/:sitecache/:module", bund)
        this.$router.get("/.static./generate/:type/cached/:sitecache/:module/*", bund)
        this.$router.get("/.static./generate/:type/complete/cached/:sitecache/:module/*", bund)
        this.$router.get("/.static./generate/:type/:module", bund)
        this.$router.get("/.static./generate/:type/:module/*", bund)
        this.$router.get("/.static./local/bundle/:site/*", bund)

        let kwStatic = staticServe(Path.join(Path.dirname(kawix.__file),"crossplatform","dist"))
        let kwStatic_2 = staticServe(Path.join(Path.dirname(kawix.__file),"crossplatform","async","dist"))
        this.$router.get("/.static./js/kawix.core.js", (env)=>{
            env.request.url = "/main.js"
            return kwStatic(env)           
        })
        this.$router.get("/.static./js/kawix.async.js", (env)=>{
            env.request.url = "/main.js"
            return kwStatic_2(env)           
        })
        this.$router.get("/.static./js/kawix.core.async.js", (env)=>{
            env.request.url = "/main.js"
            return kwStatic_2(env)           
        })
        



        let keys = this.$sites.keys()
        for(let key of keys){
            let site = this.$sites.get(key)            
            for(let h of site.$hosts){
                let middle 
                if(h.middleware){
                    middle = this.$createCallback(h.middleware, site)
                }
                
                
                ((middle, h, site)=>{
                    let genFunc = async function(env){

                        if(middle) await middle(env)
                        return site.$router.handle(env)
                    }
                    this.$router.use("/HOST_" + h.name, genFunc)
                })(middle, h, site);

            }


            for(let h of site.$prefixes){
                let middle 
                if(h.middleware){
                    middle = this.$createCallback(h.middleware, site)
                }
                ((middle, h, site)=>{
                    let genFunc = async function(env){
                        if(middle) await middle(env)
                        return site.$router.handle(env)
                    }
                    this.$router.use(h.name, genFunc)
                })(middle, h, site);
            }
        }
    }

    // buildRoutes? 
    async $buildRoutes(site){
        site.$router = new Router()
        site.$hosts = []
        if(site.config.hostnames){
            let hosts = site.config.hostnames.map((a)=>{
                if(typeof a =="string"){
                    return {
                        name: a
                    }
                }else{
                    return a 
                }
            })
            site.$hosts = hosts
        }
        site.$prefixes = []
        if(site.config.globalprefixes){
            let hosts = site.config.globalprefixes.map((a)=>{
                if(typeof a =="string"){
                    return {
                        name: a
                    }
                }else{
                    return a 
                }
            })
            site.$prefixes = hosts
        }

        if(site.config.routes){
            for(let i=0;i<site.config.routes.length;i++){
                let route = site.config.routes[i]
                //console.info("ROUTE:", route)
                site.$router[route.method || "all"](route.path, this.$createCallback(route, site), route.store || {})
            }
        }

        if (site.config.defaultroute) {
            
            let route = site.config.defaultroute
            if (typeof route === "string") {
                route = {
                    method: "all",
                    file: route
                }
            }
            site.$router.NOTFOUND(this.$createCallback(route, site), route.store || {})
        }


        if(!site.$preloaded && site.config.preload && site.config.preload.length){
            let ctx = this.getContext(site)
            for(let i=0;i<site.config.preload.length;i++){
                let preload = this.$resolve(site.config.preload[i], site)
                let mod = await import(preload)
                if(typeof mod.invoke == "function"){
                    await mod.invoke(ctx)
                }
            }
            site.$preloaded = true 
        }
    }

    $resolve(path, site){

        

        if(!Path.isAbsolute(path)){
            path = Path.join(site.resolvedPath, path)
        }
        return path
    }

    $catchErrorCallback(func){
        return async function(env){
            try{
                await func(env)
            }catch(e){
                await this.$onerror(env, e)
            }
        } 
    }

    async $onerror(env, e){
        if(this.errorCallback){
            await this.errorCallback(env)
        }
        
        if(env.response){
            if(!env.response.finished){
                try{
                    let pretty = {
                        message: e.message, 
                        code: e.code, 
                        stack: e.stack
                    }
                    let code = 500 
                    if(e.code && (e.code.indexOf("NOT_FOUND")>=0)) code = 404
                    env.reply.code(code)
                    if(!env.response.finished){
                        env.response.write(JSON.stringify(pretty))
                        env.response.end()
                    }
                }catch(e){
                    console.error(e.message)
                }
            }
        }
        else{
            env.socket.close()
        }
    }

    $createCallback(route, site){
        if(route.static){
            let folder = this.$resolve(route.static .path || route.static, site)
            let options = route.static.options || route.options || {}
            
            let h_static = HttpStatic(folder, options)
            let middle 
            if(route.middleware){
                /// TODO 
            }
            return async  function(env, ctx){
                if(middle) await middle(env,ctx)
                if (!env.response.finished) {
                    return (await h_static(env))
                }
            }
        }
        let params = {
            folder: undefined,
            file: undefined,
            c: new Map<string,any>()
        }
        if(route.folder)
            params.folder = this.$resolve(route.folder, site)
        if(route.file)
            params.file = this.$resolve(route.file, site)
        

        let ctx = this.getContext(site)
        let server = this 
        //let resolver = this.$resolve.bind(this)
        let g = async function(env){

            
            let file = params.file 
            if(params.folder){
                let name = env.params.file || env.params["*"]
                if (!name) {
                    throw Exception.create("Failed to get a file to execute").putCode("PARAM_NOT_FOUND")
                }
                file = Path.join(params.folder, name)              
            }
            let mod = params.c.get(file)
            if(mod){
                if(mod.$expires > Date.now()){
                    mod = null 
                }
            }
            if(!mod){
                mod = await import(file)
                if(mod.kawixDynamic){
                    mod.$time_expire = mod.kawixDynamic.time || 15000
                    mod.$expires = Date.now() + mod.$time_expire
                }
                params.c.set(file, mod)
            }
            

            env.server = server 
            let method = env.request.method.toLowerCase()
            if (mod.router) {
                return (await mod.router.handle(env, ctx))
            } else if (typeof mod[method] === "function") {
                return (await mod[method](env, ctx))
            } else if (typeof mod.httpInvoke === "function") {
                return (await mod.httpInvoke(env, ctx))
            } else if (typeof mod.invoke === "function") {
                return (await mod.invoke(env, ctx))
            } else {
                throw Exception.create("Failed to get a handler to execute").putCode("HANDLER_NOT_FOUND")
            }        
        }
        
        return this.$catchErrorCallback(g)

    }


    async $bundle(env) {
		var bundle, ctx ={
			server: this
		}
		bundle = (await import(__dirname + "/dynamic/bundle"))
		return (await bundle.invoke(env, ctx))
	}



}

