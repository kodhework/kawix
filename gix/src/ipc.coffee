import Path from 'path'
import ipc from './lib/_ipc'
import Os from 'os'
import fs from './lib/_fs'

class IPC extends ipc 
	constructor: (id)->
		super(id)
	

	listen: ()->
		@_address= await @_getListenPath()  if not @_address
		
		return await super.listen(...arguments)
	
	connect: ()->
		@_address= await @_getListenPath()  if not @_address
		return await super.connect(...arguments)

	_getListenPath: ()->
		
		if process.env.KAWIX_GIX_CHANNEL_PATH
			path1= process.env.KAWIX_GIX_CHANNEL_PATH
		else 
			
			path1= Path.join(Os.homedir(),".kawi")
			path1= Path.join(path1, ".sockets")
			if not await @_checkFileExists(path1)
				await fs.mkdirAsync(path1)
			if process.env.KAWIX_GIX_CHANNEL_NAME
				path1= Path.join(path1, process.env.KAWIX_GIX_CHANNEL_NAME)
			else 
				path1= Path.join(path1, "gix")
			if Os.platform() is "win32"
				return "//./pipe/" + path1
		
		path1+= "."+ @id if @id 
		path1 
	
	_getAddress: ()->
		if not @_address 
			return 

export default IPC