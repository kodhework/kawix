import Path from 'path'
import axios from 'npm://axios@^0.18.0'




reg= /\$\{(\w[\w|\d]*)\}/g
state= {}

# update database each 2 minutes
update= ()->
	try 
		fname= Path.join __dirname,"registry"
		state.registry= await `import(fname)`
		# make hot reloading
		state.registry.kawixDynamic=
			time: 60000
		state.registryInt= setTimeout update, 120000
		state.registryInt.unref()



resolve= (url, file, lib, env)->	
	cached= state.cached = state.cached ? []
	iurl= u= url.replace reg, (a,b)-> if b is "file" then file else (env.params[b] ? "")
	if cached[u]
		# cache of 5 minutes 
		if cached[u].time >= (Date.now() - 600000)
			return cached[u].url
	
	# get
	try 
		response= await axios.get u 
		cached[u]= 
			url: u 
			time: Date.now() 
		return u 
	catch e 

	obj= {}
	cached[u]= obj 
	# check with extensions 
	for ext in lib.extensions
		file2= file + ext 
		u= url.replace reg, (a,b)-> if b is "file" then file2 else (env.params[b] ? "")
		
		try 
			response= await axios.get u 
			cached[u]= obj 
			obj.url= u 
			obj.time= Date.now()
			return u 
		catch e 

	
	# return default URL
	return iurl






export invoke = (env, ctx)->

	# env is an object
	# .request
	# .response
	# .params
	# .state 

	if not state.registry		
		await update()

	lib= env.params.lib 
	if lib 
		y= lib.lastIndexOf("@")
		if y > 0
			env.params.version= lib.substring(y+1)
			env.params.lib= lib.substring(0,y)


	lib= state.registry.database[env.params.lib]
	if not lib 
		return env.reply.code(404).send
			name: env.params.lib 
			version: env.params.version 
			message: "NOTFOUND"
			code: 404
		
	if not env.params.version 
		env.params.version = "master"


	file= env.params.file= env.params["*"]

	

	url= lib.url 
	if lib.extensions 
		url = await resolve url, file, lib, env
	else 
		url= url.replace reg, (a,b)-> env.params[b] ? ""
	
	return env.reply.redirect url  


export _state= state
export kawixDynamic=
	time: 15000
	reload: (oldm, newm)->
		# this method is executed in hot reloading
		# this allows preserve cache and state properties
		newm._state= oldm._state
		newm 
