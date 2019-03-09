import http from 'http'

class Server{
	constructor(){
		this.reqs= []
	}

	listen(port, host){
		this.http= http.createServer(this._listener.bind(this))
		this.http.listen(port,host)
	}

	close(){
		var http= this.http 
		var self= this
		return new Promise(function(resolve, reject){
			http.close(function(err){
				if(err) return reject(err)
				self._stop()
				resolve()
			})
		})
	}

	_stop(){
		if (this.promise && this.promise.resolve) {
			return this.promise.resolve(null)
		}
		this.reqs.push(null)
	}

	acceptAsync(){
		var self= this 
		if(this.reqs.length){
			return this.reqs.shift()
		}
		self.promise= {}
		var promise= new Promise(function(resolve, reject){
			self.promise.resolve= resolve 
			self.promise.reject= reject 
		})
		return promise
	}

	_listener(req, res){
		var arg={
			req,
			res 
		}
		if(this.promise && this.promise.resolve){
			return this.promise.resolve(arg)
		}
		this.reqs.push(arg)
	}
}
export default Server 