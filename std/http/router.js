import FindMyWay from './find-my-way/mod.js'
import {EventEmitter} from 'events'
import Path from 'path'
import Url from 'url'
import QueryString from 'querystring'
class Router {
	constructor() {
		this._router = FindMyWay()
		this._routes= {}
		this._cached= {}
	}



	NOTFOUND(callback, store = {}){
		if(typeof store == "function" && typeof callback == "object"){
			var c= store
			store= callback
			callback= c
		}
		var id= "$NOTFOUND"
		if(typeof store == "object"){
			callback= this._callback( callback, store)
		}
		var callbacks= this._routes[id]= this._routes[id] || []
		callbacks.push(callback )
	}


	ERROR(callback, store = {}){
		if(typeof store == "function" && typeof callback == "object"){
			var c= store
			store= callback
			callback= c
		}
		var id= "$ERROR"
		if(typeof store == "object"){
			callback= this._callback( callback, store)
		}
		var callbacks= this._routes[id]= this._routes[id] || []
		callbacks.push(callback)
	}


	_use(store, callback){
		var self= this
		return function(env){
			var url= env.request.url
			var uri= env.request.uri



			var i= url.indexOf("?")
			var y= url.indexOf(";")
			var e = url.indexOf("#")
			var nextu = ''
			if((y < i && y >= 0) || i < 0) i= y
			if ((e < i && e >= 0) || i < 0) i = e
			if (i >= 0) nextu= url.substring(i)


			if(uri) delete env.request.uri
			env.request.url= "/"  + (env.params["*"] || "") + nextu

			var promise
			if(callback instanceof Router)
				promise= callback.handle(env)
			else
				promise=  callback(env)
			var end= function(){
				env.request.url= url
				env.request.uri= uri
			}
			var def
			if(promise && promise.then){
				def= self.deferred()
				promise.then(function(a){
					end()
					return def.resolve(a)
				}).catch(function(e){
					end()
					return def.reject(e)
				})
				return def.promise
			}else{
				end()
			}
			return promise
		}
	}


	_callback(callback, store, env){
		return function(env){
			env.store= store
			if(typeof callback.handle == "function"){
				return callback.handle(env)
			}else{
				return callback(env)
			}
		}
	}



	METHOD(method, route, callback, store= {}) {

		if(typeof store == "function" && typeof callback == "object"){
			var c= store
			store= callback
			callback= c
		}


		method= method.toUpperCase()
		if(method == "USE" || method == "MIDDLEWARE"){
			if(route.indexOf("/*") >=0 ){
				throw new Error("Route cannot have /*")
			}

			this.METHOD("ALL", Path.join(route, "*"), this._use(store, callback))
			this.METHOD("ALL", route, this._use(store, callback))
			return this
		}

		if(typeof store == "object"){
			callback= this._callback(callback, store)
		}

		if(method == "ALL"){
			this._router.all(route, callback)
		}
		else {
			this._router.on(method, route, callback)
		}
		return this
	}

	OFF(method, route) {
		var id
		if(method == "NOTFOUND" && !route){
			id= "$NOTFOUND"
			delete this._routes[id]
		}
		else if(method == "ERROR" && !route){
			id= "$ERROR"
			delete this._routes[id]
		}
		else{
			//id= method + "." + route
			//delete this._routes[id]
			this._router.off(method, route)
		}
		this._cached={}
		return this
	}

	deferred(){
		var obj={}
		obj.promise=new Promise(function(resolve,reject){
			obj.resolve= resolve
			obj.reject= reject
		})
		return obj
	}

	async _error(reject, env, e){
		var id= "$ERROR"
		env.error= e
		var callbacks= this._routes[id]
		var callback
		if(callbacks && callbacks.length){
			for(var i=0;i<callbacks.length;i++){
				callback= callbacks[i]
				await callback(env)
			}
		}
		reject(e)
	}

	sanitizeUrl (url) {
		for (var i = 0, len = url.length; i < len; i++) {
			var charCode = url.charCodeAt(i)
			// Some systems do not follow RFC and separate the path and query
			// string with a `;` character (code 59), e.g. `/foo;jsessionid=123456`.
			// Thus, we need to split on `;` as well as `?` and `#`.
			if (charCode === 63 || charCode === 59 || charCode === 35) {
			return url.slice(0, i)
			}
		}
		return url
	}

	find(method, path, sanitize= true){

		if(sanitize){
			path= this.sanitizeUrl(path)
		}

		var route= this._cached[path]
		if(!route){
			route= this._router.find(method.toUpperCase(), path)
			this._cached[path]= route || true
		}
		return route
	}

	async handle(env) {
		var route, def
		/*
		if(this._router2){
			result= await this._router2.handle(env)
			if(env.response.finished)
				return result
		}*/
		if(!env.request.uri)
			env.request.uri= Url.parse(env.request.url)

		route= this.find(env.request.method, env.request.uri.pathname, false)
		if(route &&  route !== true){

			if(env.request.uri.search && !env.request.query)
				env.request.query= QueryString.parse(env.request.uri.search.substring(1))


			if(route.params)
				env.params = Object.assign({}, env.params || {}, route.params )
			else if(!env.params)
				env.params= {}

			await route.handler(env)

		}
		else{
			def= this._routes["$NOTFOUND"]

			if(def && def.length){
				for(var i=0;i<def.length;i++){
					await def[i](env)
					if(env.response.finished)
						return
				}
			}

		}

	}
}


var methods = [
	'get',
	'post',
	'put',
	'head',
	'delete',
	'options',
	'trace',
	'copy',
	'lock',
	'mkcol',
	'move',
	'purge',
	'propfind',
	'proppatch',
	'unlock',
	'report',
	'mkactivity',
	'checkout',
	'merge',
	'm-search',
	'notify',
	'subscribe',
	'unsubscribe',
	'patch',
	'search',
	'connect',

	// special methods
	'upgrade',
	'use',
	'all'
]

var createMethod = function (method) {
	return function (path, callback, store) {


		return this.METHOD(method, path, callback, store)
	}
}
for (var i = 0; i < methods.length; i++) {

	Router.prototype[methods[i]] = createMethod(methods[i].toUpperCase())
}
export default Router
