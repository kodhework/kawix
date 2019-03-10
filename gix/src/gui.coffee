


import {EventEmitter} from 'events'
import Child from 'child_process'
import Path from 'path'
import Os from 'os'
import Url from 'url'

import Registry from './lib/_registry'
import fs from './lib/_fs'
import IPC from './ipc'
import Exception from './exception'



class GuiServer
	constructor: ()->
		@_evs= []
		@_f= {}

	___: ()->
		var1=null
		typeof var1
		var1 instanceof Array

	_eval: (str)->
		return eval("(#{str})")

	deferred: ()->
		def= {}
		def.promise= new Promise (a,b)->
			def.resolve= a
			def.reject = b 
		return def 

		
	electron: ()->
		if not @_electron
			@_electron= require("electron")		
		return @_electron 

	test:()->
		electron= @electron()
		create= ()->
			BrowserWindow= electron.BrowserWindow 
			mainWindow = new BrowserWindow({width: 800, height: 600})
			mainWindow.loadURL("file://#{Path.join(__dirname,"..","html","hello.world.html")}")
			mainWindow.show()
		create()


	registerFunction: (name, str)->
		func= @_eval str 
		@_f[name]= func 
	

	callFunction: (name, params)->
		func= @_f[name]
		if not func 
			throw Exception.create("Function #{name} not registered").putCode("NOT_FOUND")
		
		
		return func(@electron(), @, params)

	emit: (event, ...args)->
		@_evs.push 
			event: event 
			args: args 
		if @_evdef
			evs= @_evs
			@_evs=[] 
			@_evdef.resolve(evs)


	_readEvents: ()->
		if @_evs.length 
			evs= @_evs
			@_evs=[] 
			return evs 
		else 
			@_evdef= @deferred()
			return @_evdef.promise 



class Gui extends EventEmitter
	constructor:(@id)->
		super()
		@ipc= new IPC(@id) 
		@api= {}
	

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


	test: ()->
		return @ipc.send 
			"action": "call"
			"args": []
			"method": "test"
	

	
	register: (id, func)->
		str= func.toString() 
		await @ipc.send 
			"action": "call"
			"args": [id, str]
			"method": "registerFunction"
		ipc= @ipc
		@api[id]= (params)->
			return ipc.send 
				"action" : "call"
				"args": [id, params]
				"method": "callFunction"
		
		return @api[id]


	sleep: (timeout)->
		def= @deferred()
		setTimeout def.resolve,timeout
		return def.promise 

	_start_read_events: ()->
		while @ipc.connected
			try 
				evs= await @ipc.send 
					"action": "call"
					"args": []
					"method": "_readEvents"
				for ev in evs 
					this.emit ev.event, ...ev.args 
			catch e 
				console.error("Error reading events:", e)
				await @sleep(200)


	_check_secondinstance: ()->
		# check if is second instance 
		try
			await @ipc.connect()
		catch e 
			return yes
		
		await @ipc.send 
			"action": "import" 
			"args": [__filename]
			"params": {}

		
		await @ipc.send 
			"action": "call"
			"method": "emit"
			"args": ["second-instance", process.argv, process.cwd()]

		return no


	
	hasSingleInstanceLock: ()->
		return @_locked ? no

	requestSingleInstanceLock:(noretry)->
		try
			val= await @_check_secondinstance()
			if val 			
				@ipc= new IPC(@id)
				await @connect()
				@_locked= yes 
				return yes 
		catch er

			if not noretry
				@sleep(100)
				return await @requestSingleInstanceLock(yes)


			Exception.create("Failed getting single instance lock. Message: #{er.message}", er).putCode(er.code).raise()
		
		no 

	connect: ()->

		# require electron
		if not @electron 
			reg= new Registry()
			mod= await reg.resolve "electron@^4.0.8"
			install= Path.join(mod.folder,"install.js")
			dist= Path.join(mod.folder,"dist", "electron")
			if Os.platform() is "win32"
				dist += ".exe"
			
			if not await @_checkFileExists(dist)
				#install electron
				def= @deferred()
				console.log(" > Installing electron: ", install)
				p= Child.spawn(process.execPath, [install])
				p.on "error", def.reject 
				p.stderr.on "data", (er)->
					console.error er.toString()
				
				p.stdout.on "data", (d)->
					process.stdout.write d 
				p.on "exit", def.resolve 
				await def.promise 
			
				if not await @_checkFileExists(dist)
					throw Exception.create("Failed to install electron").putCode("LOAD_FAILED")

			@electron= 
				folder: mod.folder 
				install: install 
				dist: dist 
		else 
			dist= @electron.dist
			
		
		# open electron
		file1= Path.join(__dirname, "_electron_boot.js")
		file3= Path.join(__dirname,"start")
		if __filename.startsWith("http:") or __filename.startsWith("https:")
			file3= Url.resolve(__filename, 'start')
			file1= await @_createBootFile()
		file2= kawix.__file
		id= @id
		def= @deferred()
		
		
		@_p= Child.spawn dist , [file1,file2,id,file3]
		@_p.on "error", def.reject 

		@_p.on "exit", ()=>
			this.emit("close")
			this.connected= no
			def.reject(Exception.create("Failed start electron")) if not def.good

		@_p.stdout.on "data", (d)->
			try 
				process.stdout.write(" [GIX Electron]: ")
				process.stdout.write(d.toString())
				if not def.good and d.toString().indexOf("ELECTRON PROCESS LISTENING") >=0 
					def.good= yes 
					def.resolve() 
			
			catch e 
				console.error("error here?",e)
		await def.promise
		await @ipc.connect() 
		this.connected= yes
		await @ipc.send 
			"action": "import" 
			"args": [__filename]
			"params": {}
		@_start_read_events()
		return 

	_createBootFile: ()->
		path= Path.join(Os.homedir(), ".kawi")
		if not await @_checkFileExists(path)
			await fs.mkdirAsync(path)

		file= Path.join(path, ".electron.boot.tmp.js")
		await fs.writeFileAsync(file, """

var arg, kawix, n, id, start
var Path= require("path")
for(var i=0;i<process.argv.length;i++){
	arg= process.argv[i]
	if(n==0){
		id= arg 
		n= 1
	}
	else if (n == 1) {
		start = arg
		break 
	}
	else if (arg.indexOf("core"+Path.sep+"main.js") >= 0) {

		// require kawix core
		kawix = require(arg)
		n = 0
	}
}


var init1= function(){
	if(kawix){
		kawix.KModule.injectImport()
		if (!start) start = __dirname + "/start.js"
		kawix.KModule.import(start).then(function(response){
			response.default(id).then(function(){

			}).catch(function(e){
				console.error("Failed execute: ", e)
				process.exit(10)	
			})
		}).catch(function(e){
			console.error("Failed execute: ", e)
			process.exit(10)	
		})
	}
}
require("electron").app.once("ready", init1)
		""")
		return file




export ipcCreate= ()->
	if not Gui.s 
		Gui.s= new GuiServer()
		global.Gix= Gui.s
	return Gui.s

export default Gui


