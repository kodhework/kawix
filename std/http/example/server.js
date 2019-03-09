
import Server from '../server.js'
import Router from '../router.js'


var server, env, router, init 


handle= async function(env){
	if(!router){
		router= new Router()
		router.use("/api", function(env){
			console.log("/api .. here", env.request.url)
		})
		router.get("/api/test", function(env){
			env.write("Test")
		})
		router.get("/hello", function(env){
			env.write("Hello")
		})
		router.get("/hello/c", function(env){
			env.write(`Hello ${JSON.stringify(env.params)}`)
		})

		router.get("/hello/*/b/c/*", function(env){
			env.write(`Hello ${JSON.stringify(env.params)}`)
		})
		router.get("/error", function(env){
			throw new Error("Failed JAJA")
		})
		router.NOTFOUND(function(env){
			env.response.statusCode= 404 
			env.write("NOTFOUND")
		})
		router.ERROR(function(env){
			env.response.statusCode= 500
		})
	}
	var result 
	try{
		result= await router.handle(env)
	}catch(e){
		try{
			env.response.write("ERROR: " + e.message)
		}catch(e){}
	}
	finally{
		if(!env.response.finished)	
			env.end()
	}
}

init= async function(){
	try{
		server= new Server()
		server.listen("0.0.0.0:8181")
		server.on("error", function(e){
			console.error(e)
		})
		console.log("Listening: 8181")
		while(env= await server.accept()){
			handle(env)
		}
	}catch(e){
		console.error("ERROR:",e)
	}
}
init()