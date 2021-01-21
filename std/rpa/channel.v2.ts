import Os from 'os'
import Path from 'path'
import fs from '../fs/mod'
import crypto from 'crypto'
import Net from 'net'
import * as async from '../util/async'
import Exception from '../util/exception'


import readline from 'readline'
import { Socket } from 'dgram'
import { EventEmitter } from 'events'

interface RPATarget {
    rpa_id: string,
    rpa_from?: boolean
}


export class RPAHandler{
    
    channel: Channel 
    socket: Socket
    constructor(channel, socket ){
        this.channel = channel 
        this.socket= socket 
    }

    set(target: any, prop: string, value:any) {
        if(prop && prop.startsWith && prop.startsWith("rpa_")){
            target[prop] = value
        }
        else{
            throw Exception.create("Seting " + prop + " is not valid through RPA").putCode("RPA_INVALID_OPERATION")
        }
        return true
    }


    get(target: any, prop: string){
        var self= this 
        if(!target.$map){
            target.$map = {}
        }
        
        if(target.hasOwnProperty(prop))
            return target[prop]
        
        if(prop == "then") return undefined
        if(prop == "catch") return undefined


        let props = [...(target.$props||[])]
        props.push(prop)
        let value = this.channel.$genProxy(null, {rpa_id: target.$rpaData.id}, this, props)
        return target[prop]= value 
    }



}
//RPAHandler  = new RPAObject()



let currentId = Date.now().toString(36)
let currentIdN = 0


export class Channel extends EventEmitter{

    serialization = "mixed"
    $tasks = new Map() 
    $taskPrefix = currentId + "-"  + (currentIdN++).toString() + "-"
    $taskId = 0

    $vars = new Map()
    $id = 0
    taskid = Date.now()

    $net: Net.Server
    cid: string 
    client: any 


    constructor(id){
        super()
        this.cid = id
    }

    plain(object){
        return Channel.plain(object)
    }
    proxy(object){
        return Channel.proxy(object)
    }

    static plain(obj) {
        if (obj) {
            if (typeof obj == "object") {
                if (!obj.rpa_plain) {
                    Object.defineProperty(obj, 'rpa_plain', {
                        enumerable: false,
                        value: true
                    })
                }
                obj.rpa_plain = true
            }
        }
        return obj
    }

    static proxy(obj) {
        return {
            rpa_proxied: obj
        }
    }

    async connectLocal() {
        let socket = await this.getSocket()
        this.$net = socket
        this.$net.on("close", ()=> this.emit("close"))
        this.$connection(socket)        
        this.client = this.$getArgument(socket, {
            rpa_id: "R>0",
            rpa_from: true
        })
    }



    async getSocket() {

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
        try {
            socket = new Net.Socket()
            let def = new async.Deferred<void>()
            socket.on("error", function (e) {
                if (def) def.reject(e)
            })
            socket.once("connect", def.resolve)
            socket.connect(listen)
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
        return socket
    }

    async registerLocal() {
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


        let failedconnect = true
        if (Os.platform() != "win32") {
            if (fs.existsSync(listen)) {
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

        if (!failedconnect)
            throw Exception.create("RPA cannot register, id " + this.cid + " is already used").putCode("RPA_ID_USED")


        let def = new async.Deferred<void>()
        let net = Net.createServer(this.$connection.bind(this))
        net.on("error", function (e) {
            if (def) def.reject(e)
        })
        net.once("listening", def.resolve)
        net.listen(listen)
        this.$net = net
        await def.promise
        
        def = null
    }





    $connection(socket){
        readline.createInterface({
            input: socket
        }).on("line", (command) => {

            this.$executeCommand(socket, command)
        })

        socket.store = {}
        socket.on("close", () => {
            // reject all tasks 
            let tasks = socket.store.tasks
            if (tasks) {
                let ex = Exception.create("RPA connection was destroyed").putCode("RPA_DESTROYED")
                for (let id in tasks) {
                    tasks[id].reject(ex)
                }
            }
            if (socket.store.refs) {
                for (let id in socket.store.refs) {
                    let count = socket.store.refs[id]
                    for (let i = 0; i < count; i++)
                        this.unRef(id)
                }
            }
            delete socket.store 
        })
        socket.on("error", function () { })
    }

    unRef(){

    }

    $addVariable(object){
        let id = "R>" + this.$id++
        this.$vars.set(id, object)
        return id
    }

    $execute(socket, {target, props, params}){
        let obj = this.$getArgument(socket, target)
        let args = this.$getArguments(socket, params)
        if(obj){
            let main = obj 
            for(let i=0;i<props.length;i++){
                main = obj 
                obj = obj[props[i]]
            }
            if(!obj){
                //console.info("MAIN:", main)
                throw Exception.create(`Object ${JSON.stringify({target,props})} not found`).putCode("RPA_OBJECT_NOT_FOUND")
            }
            //console.info(obj)
            if(obj.apply){
                return obj.apply(main, args)    
            }
            else{
                if(args.length){
                    throw Exception.create(`Object ${JSON.stringify({target,props})} is not a function`).putCode("RPA_OBJECT_NOT_A_FUNCTION")
                }
                return obj 
            }
            
        }
        throw Exception.create(`Object ${JSON.stringify(target)} not found`).putCode("RPA_OBJECT_NOT_FOUND")

    }

    async $executeCommand(socket, cmd){
        //console.info("CMD:",cmd)
        cmd = JSON.parse(cmd)
        if(cmd.type == "request"){
            let response = null , er = false
            try{
                response = await this.$execute(socket, cmd)
                if(response instanceof Promise){
                    response = await response
                }
                response = this.$convertArgument(response, this.serialization)
            }catch(e){
                er= true 
                response = {
                    message:e.message,
                    code: e.code,
                    stack: e.stack
                }
            }
            let command = {
                type: 'response',
                errored: er,
                value: response,
                task: cmd.task
            }
            let data = JSON.stringify(command)+"\n"
            socket.write(data)
        }else if(cmd.type == "response"){
            let task = this.$tasks.get(cmd.task)
            if(task){
                this.$tasks.delete(cmd.taskid)
                if(cmd.errored){
                    let e = Exception.create(cmd.value.message).putCode(cmd.value.code)
                    e.stack = cmd.value.stack 
                    task.reject(e)
                }
                else{
                    let value = this.$getArgument(socket, cmd.value)
                    task.resolve(value)
                }
            }            
        }
    }


    $sendExecute({socket, rpa, props, args}){

        if(socket.destroyed){
            throw Exception.create("RPA connnection was destroyed").putCode("RPA_DESTROYED")
        }
        let taskid = this.$taskPrefix + (this.$taskId++)
        let command = {
            "type": "request",
            "params": this.$convertArguments(args),
            "target": {
                "rpa_id": rpa.id
            },
            "props": props,
            "task": taskid
        }
        let def = new async.Deferred<any>()
        this.$tasks.set(taskid, def)
        let data = JSON.stringify(command)+"\n"
        socket.write(data)

        return def.promise
    }

    $getArguments(socket, args){
        for(let i=0;i<args.length;i++){
            args[i] = this.$getArgument(socket, args[i])
        }
        return args 
    }

    $getArgument(socket, arg){

        if(typeof arg == "object" && arg){
            if(arg.rpa_type == 'date'){
                return new Date(arg.rpa_type)
            }
            else if(arg.rpa_type == 'buffer'){
                return Buffer.from(arg.data,'base64')
            }
            else if(arg.rpa_id){
                if(arg.rpa_from){
                    // generate Proxy? 
                    // TODO
                    return this.$genProxy(socket, arg)
                }
                else{
                    return this.$vars.get(arg.rpa_id)
                }
            }
            else{
                let narg = {}
                if(arg instanceof Array){
                    narg = []
                }
                for(let id in arg){
                    narg[id] = this.$getArgument(socket, arg[id])
                }
            }
        }
        return arg 
    }

    $genProxy(socket, arg, handler: RPAHandler = null, props: string[] = undefined){
        if(!handler){
            handler = new RPAHandler(this, socket)
        }
        let value = function(){            
            return handler.channel.$sendExecute({
                socket: handler.socket,
                rpa: value.$rpaData,
                props: value.$props,
                args: Array.prototype.slice.call(arguments, 0, arguments.length)
            })
        }
        value.rpa_preserve = function(){}
        value.rpa_unref = ()=>{
            this.$vars.delete(arg.rpa_id)
        }
        value.$rpaData = {id: arg.rpa_id}
        value.$props = props || []

        return new Proxy(value, handler)
        
    }


    $convertArguments(args){
        for(let i=0;i<args.length;i++){
            args[i] = this.$convertArgument(args[i])
        }
        return args 
    }

    $convertArgument(arg, serialization = 'mixed'){

        

        

        if(arg instanceof Date){
            return {
                rpa_type: "date",
                time: arg.getTime() 
            }
        }

        if(Buffer.isBuffer(arg)){
            return {
                rpa_type:'buffer',
                data: arg.toString('base64')
            }
        }

        if(serialization == "plain") return arg 
        if(serialization == "proxy"){
            let id = this.$addVariable(arg)
            return {
                rpa_id: id,
                rpa_from: true
            }
        }

        if(typeof arg == "function"){
            return this.$convertArgument(arg, "proxy")
        }

        if(typeof arg != "object"){
            return arg 
        }

        if(arg){
            if(arg.rpa_plain){
                if(typeof arg.rpa_plain == "object")
                    return arg.rpa_plain 
                else 
                    return arg 
            }

            if(arg.rpa_proxied){
                if(typeof arg.rpa_proxied == "object")
                    return arg.rpa_proxied 
                else 
                    return arg 
            }

            if(Object.getPrototypeOf(arg) == Object.prototype){
                let narg = {}
                for(let id in arg){
                    if(typeof arg[id] == "function"){
                        return this.$convertArgument(arg, "proxy")
                    }
                    else{
                        narg[id] = this.$convertArgument(arg[id], serialization)
                    }
                }
                return narg 
            }
            else if(Object.getPrototypeOf(arg) == Array.prototype){
                let narg = []
                for(let i=0;i<arg.length;i++){
                    narg[i] = this.$convertArgument(arg[i], serialization)
                }
                return narg 
            }
        

            return this.$convertArgument(arg, "proxy")
        }
        
        return arg
    }






    static async registerLocal(cid: string, service: any) {

        let channel = new Channel(cid)
        //channel.cid = cid
        //channel.service = service
        channel.$addVariable(service)
        await channel.registerLocal()
        return channel

    }


    static async registerRemote(cid: string, service: any, port: number, hostname?: string) {

        let channel = new Channel(cid)        
        //channel.service = service
        channel.$addVariable(service)
        await channel.registerRemote(port, hostname)
        return channel

    }


    static async connectLocal(cid: string) {

        let channel = new Channel(cid)    
        await channel.connectLocal()
        return channel


    }

    static async connectRemote(cid: string, port: number, host: string) {

        let channel = new Channel(cid)        
        await channel.connectRemote(port, host)
        return channel


    }


}