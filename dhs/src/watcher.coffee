# pure js basic watcher 
import {EventEmitter} from 'events'


import Glob from '../glob/mod.js'
import fs from '../../std/fs/mod.js'
import Path from 'path'



class Watcher  extends EventEmitter
	constructor: (@options = {})->
		super()
		@paths= {}
		@_stats={}

	watch: (paths)->
		if typeof paths is "string"
			paths=[paths]
		for path in paths 
			path= @parseEnvironment path
			@paths[path]= yes 
		
		@_start()
	
	sleep: (timeout)->
		def= @deferred()
		setTimeout def.resolve, timeout
		return def.promise 

	_start: ()->
		return if @_started
		@_started= yes 
		while @_started	
			try 
				await @_analyze()
			await @sleep(10000)
		

	close: ()->
		@_started= no


	
	unwatch: (path)->
		path= @parseEnvironment path
		delete @paths[path]
	
	_analyze:  ()->
		processing= Object.assign {}, @_stats 
		for path of @paths 
			_paths= await @_getpaths path
			for _path in _paths 
				await @_emit _path, processing		

		for path,stat of processing 
			@emit "remove", path , stat
			delete @_stats[path]
		


	_emit: (path, processing)->
		old= @_stats[path]
		try 
			stat= await fs.lstatAsync(path)
			if not old
				@emit "add", path, stat 
			else if old.mtimeMs != stat.mtimeMs
				@emit "change", path, stat, old
			@_stats[path]= stat 
		catch e 
			if e.code is "ENOENT" and old
				@emit "remove", path , old
				delete @_stats[path]

		if processing 
			delete processing[path]

		if stat.isDirectory()
			if @options.recursive 
				files= await fs.readdirAsync(path)
				for f in files 
					if (not f.startsWith("./")) and (not f.startsWith("../"))
						ufile= Path.join(path, f)
						await @_emit ufile 
		



	deferred:()->
		def= {}
		def.promise= new Promise (a,b)->
			def.resolve= a 
			def.reject = b
		return def 

	_getpaths: (path)->
		def= @deferred()    
		
		Glob path, (er, files)->    
			return def.reject er if er 
			def.resolve files 
		return def.promise
	

	parseEnvironment: (path)->
		path= Path.normalize path 
		reg= /\$(\w[\w|\_|\-|\d]+)/g
		path.replace reg, (a,b)->
			return process.env[b] ? a

export default Watcher
		
