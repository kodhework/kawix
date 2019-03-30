
import Path from 'path'
import ipc from '../lib/_ipc'
import Os from 'os'
import fs from '../lib/_fs'

class IPC extends ipc


	constructor:(server, id)->
		super(id)
		@server= server
		@_deferred= {}



	@fromClientSocket:(socket, server, id)->
		c= new IPC(server, id)
		#c.IPC= IPC
		server.channel.on "response", c._in_response_i.bind(c)
		c.socket= socket
		c._type= 'client'
		return c


	listen: ()->
		@_address= await @_getListenPath()  if not @_address

		return await super.listen(...arguments)

	connect: ()->
		@_address= await @_getListenPath()  if not @_address
		return await super.connect(...arguments)

	_getListenPath: ()->

		if process.env.KAWIX_CHANNEL_PATH
			path1= process.env.KAWIX_CHANNEL_PATH
		else
			path1= Path.join(Os.homedir(),".kawi")
			path1= Path.join(path1, ".sockets")
			if not await @_checkFileExists(path1)
				await fs.mkdirAsync(path1)
			if process.env.KAWIX_CHANNEL_NAME
				path1= Path.join(path1, process.env.KAWIX_CHANNEL_NAME)
			else
				config= @server.config.readCached()
				path1= Path.join(path1, config.name ? ("dhs.#{Date.now().toString(32)}"))
			if Os.platform() is "win32"
				###
				if(path1[1]==":")
					path1= path1.substring(2).replace(/\\/g,'/')
				###
				return "//./pipe/" + Path.basename(path1)

		path1+= "."+ @id if @id
		path1

	_getAddress: ()->
		if not @_address
			return

export default IPC
