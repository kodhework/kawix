
import Net from 'net'
import * as async from '../util/async'
import crypto from 'crypto'
import Os, { hostname } from 'os'
import Path from 'path'
import fs from '../fs/mod'
import Exception from '../util/exception'
import { Socket } from 'net'
import {ChannelHandler} from './channel.handler'
import { EventEmitter } from 'events'


interface RPATarget{
    rpa_id:string,
    rpa_from?:boolean
}


export class Channel{
    cid: string 
    service: any 
    client: any 

    _str= ''
    _map: Map<any, any>
    _obs= {}
    _count= 0
    _store: Map<any,any>
    _taskid= 0
    _net 
    autounref = true 

    plain(obj){
        return {
            rpa_plain: obj
        }
    }

    proxy(obj){
        return {
            rpa_proxied: obj
        }
    }


    getStoreForSocket(socket: Socket, create?: boolean){
        if(create){
            if(!this._store.has(socket)){
                this._store.set(socket, {
                    tasks: {},
                    refs: {}
                })
            }
        }else{
            if (!this._store.has(socket))  return null 
        }
        return this._store.get(socket)
    }


    async executeCommand(socket: Socket, command: string){

        try{
            
            //console.log("RPA Command received: ", command)
            let cmd = JSON.parse(command)
            if(!cmd) return

            if(cmd.answer){


                let store= this.getStoreForSocket(socket)
                if(store){
                    
                    let tasks = store.tasks
                    if(tasks){
                        let task = tasks[cmd.taskid] as async.Deferred<any>
                        if(!task){
                            console.info("RPA Error: Failed to read taskid: " + cmd.taskid, cmd.result)
                        }
                        else{

                            delete tasks[cmd.taskid]
                            if(cmd.result.error){
                                
                                let e = cmd.result.error 
                                let ex = Exception.create(e.message).putCode(e.code || "RPA_ERROR")
                                for (let id in e) {
                                    ex[id] = e[id]
                                }
                                task.reject(ex)
                            }else{
                                task.resolve(this.getArgument(socket,cmd.result.data))
                            }               

                        }
                    }

                }

            }
            else if(cmd.unref){

            }
            else{

                
                try{
                    let target = this.getTarget(cmd.target)
                    if(cmd.props){
                        // get target by props 
                        for(let i=0;i<cmd.props.length;i++){
                            target = target[cmd.props[i]]
                            if(!target)
                                throw Exception.create(`The property '${cmd.props.join(".")}' is not valid for remote object`).putCode("RPC_OBJECT_NOT_FOUND")
                        }
                    }

                    let method = target[cmd.method]

                    /*
                    if(method === undefined){
                        throw Exception.create(`The remote object method '${cmd.method}' is not valid`).putCode("RPC_ERROR")
                    }*/


                    let result, args 

                    
                    if(typeof method == "function"){
                        // execute 
                        args = this.getArguments(socket, cmd.arguments)
                        try{
                            if (cmd.construct) {
                                result = new target[cmd.method](...args)
                            }else{
                                result = await method.apply(target, args)
                            }
                            
                            if(cmd.taskid != -1){
                                this.sendAnswer(socket, cmd, {
                                    data: result
                                })
                            }
                        }catch(e){

                            

                            if (cmd.taskid != -1) {
                                let ex = {
                                    message: e.message,
                                    code: e.code || "RPA_ERROR",
                                    stack: e.stack
                                }
                                for(let id in e){
                                    ex[id] = e[id]
                                }
                                this.sendAnswer(socket, cmd, {
                                    error: ex
                                })
                            }


                        }finally{

                            // make unref
                            if (cmd.taskid != -1 && this.autounref) {
                                for(let i=0;i<args.length;i++){
                                    let arg = args[i]
                                    if(arg && arg.rpa_unref){
                                        if(!arg.rpa_preserved){
                                            try{
                                                //console.info("unrefing")
                                                arg.rpa_unref()
                                            }catch(e){}
                                        }
                                    }
                                }
                            }

                        }

                    }else{

                        if(cmd.construct){
                            throw Exception.create(`The method '${cmd.target}'->'${cmd.method}' is not a constructor`).putCode("RPC_ERROR")
                        }

                        if (cmd.taskid != -1) {
                            args = this.getArguments(socket, cmd.arguments)
                            if(args.length == 1){
                                target[cmd.method] = args[0]                                
                                this.sendAnswer(socket, cmd, {
                                    data: true
                                })

                            }else{
                                this.sendAnswer(socket, cmd, {
                                    data: method
                                })
                            }
                        }

                    }
                }catch(e){

                    if (cmd.taskid != -1) {
                        let ex = {
                            message: e.message,
                            code: e.code || "RPA_ERROR",
                            stack: e.stack
                        }
                        for (let id in e) {
                            ex[id] = e[id]
                        }
                        this.sendAnswer(socket, cmd, {
                            error: ex
                        })
                    }
                    else{
                        console.error("Error on RPA: ", e)
                    }
                }
            
            }

        }catch(e){
            console.error("Failed parse command: ", e)
        }

    }


    constructor(service?:any){
        
        this._store = new Map<any, any>()
        this._map = new Map<any,any>()
        if (service) {
            this.service = service
            this.makeRef(this.service)
            this.makeRef(this.service)
        }

        this.makeRef(this, "R>y")
    }

    getArgument(socket: Socket, arg: any) {
        
        if (arg && arg.rpa_id) {
            if (arg.rpa_from) {            
                // create a proxy from rpa comunication
                arg = this.createProxy(socket, arg)                
            }
            else {
                // get from current 
                let id = arg.rpa_id
                
                arg = this._obs[arg.rpa_id]
                if (!arg)
                    throw Exception.create(`The remote object with id '${id}' was not found`).putCode("RPC_INVALID_OBJECT")
                arg = arg.target
            }
        }
        else if (arg && arg.rpa_socket) {
            arg = socket
        }
        else if (arg && arg.rpa_array) {

            let self = this
            if(arg.rpa_references && arg.rpa_references.length){
                let references = arg.rpa_references.join(",")
                arg.rpa_unref =  function () {
                    let cmd = {
                        target: "R>y",
                        method: "unRef",
                        arguments: [references, { rpa_socket: true }]
                    }
                    // ignore if cannot unref
                    self.send(socket, cmd, true)
                }
            }

            Object.setPrototypeOf(arg, Array.prototype)
            for(let i=0;i<arg.length;i++){
                arg[i] = this.getArgument(socket, arg[i])
            }
            
        }
        return arg
    }

    getArguments(socket: Socket, args: Array<any>){
        //let newargs = []
        for(let i=0;i<args.length;i++){
            let arg = args[i]
            args[i] = this.getArgument(socket, arg)
        }
        return args
    }

    sendAnswer(socket: Socket, command: any, result: any){
        if(result.data){
            result.data = this.convertArgument(result.data, socket)
        }
        let newcommand = {
            answer: true,
            taskid: command.taskid,
            result: result
        }
        if (socket.destroyed || !socket.writable) {
            throw Exception.create(`Cannot complete the requested operation: ${command.target}->${command.method}. The RPA connection was destroyed.`).putCode("RPA_DESTROYED")
        }
        socket.write(JSON.stringify(newcommand) + "\n")
    }

    send(socket: Socket, command: any, notask?: boolean){

        
        if(socket.destroyed || !socket.writable){
            throw Exception.create(`Cannot complete the call: ${command.target}->${command.method}. The RPA connection was destroyed`).putCode("RPA_DESTROYED")
        }

        if(notask){
            command.taskid = -1
            socket.write(JSON.stringify(command) + "\n")
            return 
        }
        
        let taskid = this._taskid++
        command.taskid = taskid 
        

        let store = this.getStoreForSocket(socket, true)
        
        socket.write(JSON.stringify(command) + "\n")
        return  store.tasks[taskid] = new async.Deferred<any>()
    }


    wrap(arg){
        return this.convertArgument(arg)
    }

    convertArgument(arg: any, socket?: Socket) {
        return this._convertArgument(arg, socket)
    }

    _convertArgumentMixed(arg: any, socket?: Socket, noproxy?:Boolean, circular?: any, references?: string[]) {

        // serialize the primitive values, proxy the object values 
        let main = false 
        if(!circular){
            circular = new Map()
            main = true 
        }

        if(arg){
            if(typeof arg == "object"){
                let props = Object.getOwnPropertyDescriptors(arg)
                let narg:any = {}
                let isarray = arg instanceof Array
                let isarray_proto = Object.getPrototypeOf(arg) == Array.prototype
                if(isarray_proto && main && !references){
                    references = []
                }
                for(let i in props){
                    let prop = props[i]
                    if(prop.enumerable && !prop.get){
                        // solo lo usa si no es un getter
                        if(circular.has(prop.value)){
                            //narg[i] = "~(Circular)"
                        }
                        else{
                            circular.set(prop.value, true)
                            narg[i] = this._convertArgumentMixed(prop.value, socket, isarray ? false: true, circular, references)
                        }
                    }
                }
                if(isarray){
                    narg.rpa_array = true 
                    narg.length = arg.length
                    if(main){
                        narg.rpa_references= references
                        console.info("references: ", references)
                    }
                }
                if(!noproxy && !isarray_proto){
                    arg = Object.assign(narg, {
                        rpa_id: this.makeRef(arg, null, socket),
                        rpa_from: true 
                    })
                    if(references){
                        references.push(arg.rpa_id)
                    }
                }else{
                    arg = narg 
                }
            } 
            else if(typeof arg == "function"){
                return null 
            }
        }
        return arg
    }

    _convertArgument(arg: any, socket?: Socket){
        let rpa_id = ''

        if (typeof arg == "function") {
            if (!arg.rpa_wrap) {
                arg.rpa_wrap = {
                    rpa_run: arg
                }
            }
            if (!rpa_id) rpa_id = this.makeRef(arg.rpa_wrap, null, socket)
            arg = {
                rpa_id: rpa_id,
                rpa_from: true,
                rpa_function: true
            }
            return arg
        }

        if(arg){
            if(typeof arg == "object"){
                if(arg.rpa_id && arg.rpa_from){
                    return {
                        rpa_id: arg.rpa_id
                    }
                }

                if(typeof arg.rpa_plain == "object"){
                    return arg.rpa_plain
                }
                if(arg.rpa_plain) return arg 


                if(typeof arg.rpa_proxied == "object"){
                    /* ONLY PROXIED */
                    rpa_id = this.makeRef(arg.rpa_wrap, null, socket)
                    arg = {
                        rpa_id: rpa_id,
                        rpa_from: true,
                    }
                    return arg
                }


                // mixed? 
                if (arg.rpa_mixed) {
                    return this._convertArgumentMixed(arg, socket)
                }

                // by default mixed 
                return this._convertArgumentMixed(arg, socket)
            }
        }
        return arg 
    }



    convertArguments(args: Array<any>){

        for (let i = 0; i < args.length; i++) {
            let arg = args[i]
            args[i] = this.convertArgument(arg)
        }
        return args

    }




    

    createProxy(socket: Socket, arg: any){
        
        let handler = new ChannelHandler(socket, this)
        let proxy

        if (arg.rpa_function) {
            let f
            let x = handler.generateFunction(arg, "rpa_run", true)
            
            f = x 
            f.rpa_id = arg.rpa_id
            f.rpa_from = arg.rpa_from
            f.rpa_function = arg.rpa_function
            arg = f 
            
        }

        
        proxy = new Proxy(arg, handler)
        return proxy
    }



    getTarget(cid: string){
        let target =  this._obs[cid]
        if(!target){
            throw Exception.create("The remote object doesn't exists or was disconnected").putCode("RPA_NOT_FOUND")
        }
        return target.target
    }

    addRef(object, id, socket){
        return this.makeRef(object, id, socket)
    }

    makeRef(object: any, id?: string, socket?: Socket){
        if(this._map.has(object)){
            let id = this._map.get(object)
            let refered= this._obs[id ]
            refered.refs++
            
        }
        else{
            if(!id){
                id = "R>" + (this._count++)
            }
            this._map.set(object, id)
            this._obs[id] = {
                target: object,
                refs: 1
            }
        }
            
        if(socket){
            let store = this.getStoreForSocket(socket, true)
            if(store.refs[id] == undefined) store.refs[id] = 0
            store.refs[id]++
        }
        return id
    }

    unRef(object: any, socket?: Socket) {      
        let id:string = ''      
        if(object && object.rpa_id && object.rpa_from){
            return object.rpa_unref()
        }
        if(typeof object == "string"){
            id = object
            // unref many 
            if(id.indexOf(",") >= 0){
                let ids = id.split(",")
                for(let i=0;i<ids.length;i++){
                    this.unRef(ids[i], socket)
                }
                return 
            }
        }
        else if (this._map.has(object)) {            
            id = this._map.get(object)
        }

        if(id){
            let refered = this._obs[id]
            if (refered) {
                refered.refs--
                if (refered.refs <= 0) {
                    this._map.delete(refered.target)
                    delete this._obs[id]
                }

                if (socket) {
                    let store = this.getStoreForSocket(socket)
                    if (store) {
                        if (store.refs[id]) {
                            store.refs[id]--
                            if (store.refs[id] === 0) delete store.refs[id]
                        }
                    }
                }
            }
        }
            
    }

    

    _connection(socket){

        socket.on("data", (data)=>{
            let i = -1
            
            while((i = data.indexOf(10)) >= 0){
                let command = this._str + data.slice(0, i).toString()
                if(command){
                    this.executeCommand(socket, command)
                }
                this._str = ''
                data = data.slice(i + 1)                
            }
            if(data.length){
                this._str += data.toString()
            }
        })

        socket.on("close", ()=>{

            // reject all tasks 

            let store = this.getStoreForSocket(socket)
            if(store){
                
                let tasks = store.tasks
                if(tasks){
                    let ex = Exception.create("RPA connection was destroyed").putCode("RPA_DESTROYED")
                    for(let id in tasks){
                        tasks[id].reject(ex)
                    }
                }
                if (store.refs) {
                    for (let id in store.refs) {
                        let count = store.refs[id]
                        for (let i = 0; i < count; i++)
                            this.unRef(id)
                    }                    
                }
                this._store.delete(socket)
            }
        })

        socket.on("error",function(){})


    }

    async connectRemote(port: number, host: string){

        let socket: Net.Socket = null
        try {
            socket = new Net.Socket()
            let def = new async.Deferred<void>()
            socket.on("error", function (e) {
                if (def) def.reject(e)
            })
            socket.once("connect", def.resolve)
            socket.connect(port, host)
            await def.promise
            def = null
        } catch (e) {
            if (e.code == "ECONNREFUSED") {
                throw Exception.create(`The RPA service with id ${this.cid} was not found`).putCode("RPA_UNAVAILABLE")
            }
            else {
                throw e
            }
        }
        this._net = socket
        this._connection(socket)

        try{
            this.client = this.getArgument(socket, {
                rpa_id: "R>0",
                rpa_from: true
            })
            this.client = await this.client.get(this.cid)
            if(!this.client){
                throw Exception.create(`The RPA service with id ${this.cid} was not found in this remote server. `).putCode("RPA_UNAVAILABLE")
            }
        }catch(e){

            // close ...
            this.close()
            throw e 
        }


    }

    async connectLocal() {

        let hash = crypto.createHash('sha1').update(this.cid).digest('hex')
        let listen = ''
        if (Os.platform() == "win32") {
            listen = "//./pipe/" + hash
        } else {
            listen = Path.join(Os.homedir(), ".kawi")
            if (!fs.existsSync(listen)) {
                fs.mkdirSync(listen)
            }
            listen = Path.join(listen, "rpa")
            if (!fs.existsSync(listen)) {
                fs.mkdirSync(listen)
            }
            listen = Path.join(listen, hash)
        }

        let socket = null 
        try{
            socket = new Net.Socket()        
            let def = new async.Deferred<void>()
            socket.on("error", function (e) {
                if (def) def.reject(e)
            })
            socket.once("connect", def.resolve)
            socket.connect(listen)
            await def.promise
            def = null 
        }catch(e){
            if(e.code == "ECONNREFUSED"){
                throw Exception.create(`The RPA service with id ${this.cid} was not found`).putCode("RPA_UNAVAILABLE")
            }   
            else{
                throw e
            }
        }
        this._net = socket
        this._connection(socket)

        this.client =  this.getArgument(socket, {
            rpa_id: "R>0",
            rpa_from: true
        })

    }

    async registerRemote(port: number, hostname?: string){

        let def = new async.Deferred<void>()
        let net = Net.createServer(this._connection.bind(this))
        net.on("error", function (e) {
            if (def) def.reject(e)
        })
        net.once("listening", def.resolve)
        net.listen(port, hostname || "0.0.0.0")
        this._net = net
        await def.promise
        def = null

        let thiscid = this.cid 
        let service = this.service

        let newservice = {
            get(cid: string) {
                if (cid == thiscid) {
                    return service
                }
                return null
            }
        }

        this._map.delete(service)
        this._map.set(newservice, "R>0")

        this._obs["R>0"].target = newservice

    }

    async registerLocal(){
        
        let hash = crypto.createHash('sha1').update(this.cid).digest('hex')
        let listen = ''
        if(Os.platform() == "win32"){
            listen = "//./pipe/"  + hash 
        }else{
            listen = Path.join(Os.homedir(),".kawi")
            if(!fs.existsSync(listen)){
                fs.mkdirSync(listen)
            }
            listen = Path.join(listen, "rpa")
            if (!fs.existsSync(listen)) {
                fs.mkdirSync(listen)
            }
            listen = Path.join(listen, hash)            
        }


        let failedconnect = true 
        if(Os.platform() != "win32"){
            if(fs.existsSync(listen)){
                failedconnect = false 
                try {
                    let socket = new Net.Socket()
                    let def = new async.Deferred<void>()
                    socket.on("error", function (e) {
                        if (def) def.reject(e)
                    })
                    socket.once("connect", def.resolve)
                    socket.connect(listen)
                    await def.promise
                    def = null
                    socket.destroy()

                } catch (e) {
                    // failed connect, so try delete the file 
                    failedconnect = true
                    await fs.unlinkAsync(listen)
                }
            }
        } 

        if(!failedconnect)
            throw Exception.create("RPA cannot register, id "  + this.id + " is already used").putCode("RPA_ID_USED")
        

        let def = new async.Deferred<void>()
        let net = Net.createServer(this._connection.bind(this))
        net.on("error", function(e){
            if (def) def.reject(e)
        })
        net.once("listening", def.resolve)
        net.listen(listen)
        this._net = net 
        await def.promise
        def = null

    }

    close(){
        this._net.close ? this._net.close() : this._net.destroy()
    }

    static async registerLocal(cid: string, service: any) {

        let channel = new Channel(service)
        channel.cid = cid
        //channel.service = service
        await channel.registerLocal()
        return channel

    }


    static async registerRemote(cid: string, service: any, port: number, hostname?: string) {

        let channel = new Channel(service)
        channel.cid = cid
        //channel.service = service
        await channel.registerRemote(port, hostname)
        return channel

    }


    static async connectLocal(cid: string) {

        let channel = new Channel()
        channel.cid = cid
        await channel.connectLocal()
        return channel


    }

    static async connectRemote(cid: string, port: number, host: string) {

        let channel = new Channel()
        channel.cid = cid
        await channel.connectRemote(port, host)
        return channel


    }





}