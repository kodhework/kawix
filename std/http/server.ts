// Copyright 2018-2019 the kawix authors. All rights reserved. MIT license.

import http from 'http'
import Reply from './reply'
import {EventEmitter} from 'events'
import Net, { Socket } from 'net'
import fs from '../fs/mod'



export class Env extends EventEmitter{

	response: http.ServerResponse | Socket
	reply : Reply
	head 
	request: http.IncomingMessage
	socket: Socket
	type: string

	store?: any
	

	constructor(options = null){
		super()
		if(options){
			for(var id in options){
				this[id]= options[id]
			}
		}
	}

	write(data,encoding,callback){
		var socket= (this.response || this.socket)
		return socket.write(data,encoding,callback)
	}
	end(){
		var socket= (this.response || this.socket)
		return socket.end()
	}
}
class Server extends EventEmitter{

	constructor(){
		super()
		this.options = {}
		this._queue= []
	}


	/** Listen http server. Returns a promise */
	async listen(addr){
		if(!this._http){
			this._http = http.createServer(this.options, this._listener.bind(this))
			this._http.on("error", (e) => {
				this.emit("error", e)
			})
		}

		var host,port, self, r1, r2
		self= this

		var listen= ()=>{
			self.address= self._http.address()
			this.emit("listen")
			r1(self.address)
		}


		if (typeof addr == "string"){
			if(addr.indexOf(":")>=0){
				host= addr.split(":")

				port= parseInt(host[1])
				host = host[0]
				this._http.listen(port, host, listen)
				this.once("error", (e) => {
					r2(e)
				})
			}else{

				this.once("error", async function () {
					try {
						let socket = new Net.Socket()
						socket.connect(addr)
						let def = this.deferred()
						socket.once("connect", def.resolve)
						socket.once("error", def.reject)
						await def.promise
						throw new Error(`Cannot listen to ${addr}, address is in use.`)
					} catch (e) {
						if (!(e.code == "ECONNREFUSED" || e.code == "ENOENT"))
							throw e
					}
					try { await fs.unlinkAsync(addr) } catch (e) { }

					this._http.once("error", r2)
					return this._http.listen(addr, listen)

				})
				this._http.listen(addr, listen)

			}
		}else{
			this._http.listen(addr, listen)
			this.once("error", (e) => {
				r2(e)
			})
		}


		this._http.on("upgrade", this._upgrade.bind(this))
		var prom= new Promise(function(resolve,reject){
			r1= resolve
			r2= reject
		})
		return await prom
	}

	deferred() {
		var obj = {}
		obj.promise = new Promise(function (resolve, reject) {
			obj.resolve = resolve
			obj.reject = reject
		})
		return obj
	}

	/** close http server. Returns a promise */
	close(timeout){
		var def= this.deferred()
		var int1
		if(timeout){
			int1= setTimeout(function(){
				def.reject(new Error("Timedout closing server"))
			}, timeout)
		}

		this._http.close((e) => {
			if(int1) clearTimeout(int1)


			if(e) return def.reject(e)
			def.resolve()
			this.emit("close")


		})
		return def.promise

	}


	get connectEnabled(){
		return this._connectEnabled
	}

	set connectEnabled(value) {
		if(value){
			if (!this._connectCallback){
				this._connectCallback= this._connect.bind(this)
				this.on("connect", this._connectCallback)
			}
		}else{
			if(this._connectCallback){
				this.removeListener("connect", this._connectCallback)
				delete this._connectCallback
			}
		}
		return this._connectEnabled= value
	}


	get listening() {
		return this._http.listening
	}

	get maxHeadersCount() {
		return this._http.maxHeadersCount
	}

	set maxHeadersCount(value) {
		return this._http.maxHeadersCount = value
	}

	get headersTimeout() {
		return this._http.headersTimeout
	}

	set headersTimeout(value) {
		return this._http.headersTimeout = value
	}

	get timeout() {
		return this._http.timeout
	}

	set timeout(value) {
		return this._http.timeout = value
	}

	get keepAliveTimeout() {
		return this._http.keepAliveTimeout
	}

	set keepAliveTimeout(value) {
		return this._http.keepAliveTimeout = value
	}



	get innerServer(){
		return this._http
	}


	accept(){
		var self= this
		if(this._queue.length > 0){
			return this._queue.shift()
		}
		return new Promise(function(resolve,reject){
			self._resolve= resolve
			self._reject= reject
		})
	}





	_connect(req, socket, head) {
		var env= this.reuse(req, undefined, socket, head, 'connect')
		return this._addQueue(env)
	}

	_upgrade(req, socket, head) {

		var env= this.reuse(req, undefined, socket, head, 'upgrade')
		return this._addQueue(env)
	}

	reuse(request, response, socket, head, type){

		var env= new Env()
		env.response= response
		env.socket = socket
		if(!response){
			env.response= env.socket
		}
		if(response)
			env.reply = new Reply(env)
		env.type= type
		env.head= head
		env.request= request
		return env
	}



	

	_listener(req, res){
		var env= this.reuse(req, res, undefined, undefined)
		return this._addQueue(env)
	}

	_addQueue(env){
		if(this._router){
			return this._router.handle(env)
		}

		var resolve= this._resolve
		if(resolve){
			delete this._resolve
		}
		if(this._queue.length){
			if(this.maxqueuecount && (this._queue.length >= this.maxqueuecount)){
				//console.error(` > [kawix/std/http] Reaching the maxqueuecount ${this.maxqueuecount} Current count: ${this._queue.length}`)
				env.response.statusCode= 503
				env.response.end()

			}else{
				this._queue.push(env)
			}
			if(resolve){
				resolve(this._queue.shift())
			}
		}
		else{
			if(resolve){
				resolve(env)
			}else{
				this._queue.push(env)
			}
		}
	}

	get router(){
		return this._router
	}
	set router(value){
		this._router= value
	}


}

export default Server
