import Net from 'net'
import Os from 'os'
import fs from '../lib/_fs'
import Path from 'path'
import Exception from '../exception'
import uniqid from '../lib/_uniqid'
import {EventEmitter} from 'events'
class IPC extends EventEmitter
	# get a server from id 
	constructor:(@server, @id)->
		super()
		@_deferred= {} 



	@fromClientSocket:(socket, server)->
		c= new IPC(server)
		#c.IPC= IPC
		server.channel.on "response", c._in_response_i.bind(c)
		c.socket= socket 
		c._type= 'client'

		return c


	

	deferred: ()->
		def= {}
		def.promise= new Promise (a,b)->
			def.resolve= a
			def.reject = b 
		return def 

	
	_checkFileExists: (file)->
		def= @deferred()
		fs.access file, fs.F_OK, (err)->
			def.resolve(if err then no else yes)
		return def.promise 



	_getListenPath: ()->
		
		if process.env.KAWIX_CHANNEL_PATH
			path1= process.env.KAWIX_CHANNEL_PATH
		else 
			config= @server.config.readCached()
			path1= Path.join(Os.homedir(),".kawi")
			path1= Path.join(path1, ".sockets")
			if not await @_checkFileExists(path1)
				await fs.mkdirAsync(path1)
			if process.env.KAWIX_CHANNEL_NAME
				path1= Path.join(path1, process.env.KAWIX_CHANNEL_NAME)
			else 
				path1= Path.join(path1, config.name or ("default." + Date.now()))
			path1+=".socket"
			if Os.platform() is "win32"
				return "//./pipe/" + path1
		
		path1+= "."+ @id if @id 
		path1 
		
	
	connect: ()->
		listen= await @_getListenPath() 
		@socket= socket= new Net.Socket() 
		socket.connect listen 
		def= @deferred()
		socket.once "connect", def.resolve 
		socket.once "error", def.reject 
		await def.promise 

		# attach responses 
		@_type='client'
		@_connection @socket 


	listen: (path)->
		listen= path ? await @_getListenPath() 
		
		# try a connect for see is being used
		try 
			socket= new Net.Socket() 
			socket.connect listen 
			def= @deferred()
			socket.once "connect", def.resolve 
			socket.once "error", def.reject 
			await def.promise

			Exception.create("Cannot listen to #{listen}, address is in use.").raise()
		catch e 

			if not (e.code is "ECONNREFUSED" or e.code is "ENOENT")
				throw e 
			

		if Os.platform() != "win32"
			if await @_checkFileExists(listen)
				await fs.unlinkAsync listen

		@_net= Net.createServer @_connection.bind(@)
		@_net.on "error", (er)->
			console.error("Channel error: ", er)
		def= @deferred()
		@_net.once "error", def.reject 
		@_net.once "listening", def.resolve 
		@_net.listen listen
		@_type='server'
		await def.promise 


	_in_response: (state, socket, response)->
		if not response 
			return 
		
		try 	
			res= response
			if typeof response is "string"
				res= JSON.parse response 
		catch e 
			return console.error("Invalid response from server: " + response)


		
		if @_in_response_i(state,socket,res) is no
			#console.info "Not promise available for result"
			@emit "response", state, socket, res



	_in_response_i: (state,socket,res)->
		def= @_deferred[res.uid]
		if def 
			delete @_deferred[res.uid]
			if res.status is 'error'
				excep= Exception.create(res.error.message).putCode(res.error.code).putStack(res.error.stack)
				def.reject excep 
				return
			else 
				def.resolve res.value 
				return
		else 	
			return false 
		


	_in_request: (state, socket, request)->
		return if not request
		
		try 
			req= JSON.parse request 
		catch e 
			return console.error("Invalid request from client: " + request)


		if req.type is 'response'
			
			return @_in_response(state, socket, req)

		
		result= null 
		error= null
		try 

			if req.action is "log"
				console.log.apply console, req.args
			else if req.action is "log.error"
				console.error.apply console, req.args
			else if req.action is "log.info"
				console.info.apply console, req.args
			else if req.action is "log.warn"
				console.warn.apply console, req.args


			else if req.action is "import"
				# import a file 
				mod= await `import(req.args[0])`
				result= yes 
				if mod.ipcInvoke 
					result= await mod.ipcInvoke(state, socket, req.params, @)
				else if mod.ipcCreate or mod.create 
					state[req.name or "mod"]= await (mod.ipcCreate or mod.create)(state, socket, req.params, @)
				else 
					state[req.name or "mod"]= mod 
				
				

			else if req.action is "assign"
				state[req.name]= req.value 
				result= yes  
			
			else if req.action is "call"
				name= req.name or "mod"
				target= state[name]
				if not target 
					throw Exception.create("Invalid identifier #{name}. You need make an import")
				if not target[req.method]
					throw Exception.create("#{name}.#{req.method} is not a function ")			
				result= await target[req.method].apply(target, req.args)
			
			
		catch e 
			error= e 
		
		if error
			response= 
				status: 'error'
				uid: req.uid
				type: 'response'
				error: 
					code: error.code 
					message: error.message 
					stack: error.stack 
		else 
			response= 
				type: 'response'
				status: 'ok'
				value: result 
				uid: req.uid
		
		socket.write(JSON.stringify(response)+"\n")

		
	send: (request, timeout= 0)->
		
		request.uid= uniqid() if not request.uid 
		if @_type == 'client'
			str= JSON.stringify(request)+ "\n"
			@socket.write str 

			return if request.nowait 	

			# wait a response 
			def= @deferred() 
			@_deferred[request.uid]= def 
			if timeout 
				int1= setTimeout ()=>
					delete @_deferred[request.uid]
					def.reject Exception.create("Timedout waiting response").putCode("TIMEDOUT")
				, timeout 
				result= await def.promise 
				clearTimeout int1 
				return result 


			return await def.promise
	



	close: ()->
		@_stopped= yes 
		@socket?.close()
		@_net?.close()


	# functions 
	_import: (file, params)->
		return @send 
			action:'import'
			args: [file]
			params: params 
	
	_call: (target, method, args)->
		return @send 
			action:'call'
			args: args 
			method: method 
			name: target 
	


	_connection: (socket)->
		

		buffer= []
		self= this 
		state= {}

		analyzeRequest= ()->
			

			buf= Buffer.concat(buffer)
			buffer= []
			i= buf.lastIndexOf(10)
			str= buf.slice(0, i)
			buf= buf.slice(i)
			if buf.length 
				buffer.push buf 
			
			requests= str.toString().split("\n")
			if requests.length 
				# process request 
				for request in requests 
					self._in_request state, socket, request 


		socket.on "data", (b)->
			buffer.push b 
			y= b.indexOf(10)
			if y >= 0	
				analyzeRequest(y)
		
		if @_type is 'client'
			socket.on "disconnect", ()->
				for id, val of self._deferred
					val.reject Exception.create("IPC Channel disconnected").putCode("DISCONNECTED")
				
				self._deferred={}
				if not self._stopped 
					self.connect()
		

export default IPC 