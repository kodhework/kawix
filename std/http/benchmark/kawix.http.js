import Server from '../server.js'
import Router from '../router.js'
var server, env, router, init, handle 


var schema={
    "response": {
        "200": {
            "type": "object",
            "properties": {
                "hello":{
                    "type": "string"
                }
            }
        }
    }
}



init= async function(){
    server= new Server()
    server.listen("0.0.0.0:3000")


    router= new Router()
    router.get("/", {schema}, function(env){
        //env.reply.serializer= oschema
        env.reply.send({ hello: 'world' })
    })
    router.NOTFOUND(function(env){
        env.response.statusCode= 404
        env.response.end()
    })
    //server.router= router 
    console.log("Listening: 3000")
    
    while(env= await server.accept()){
        router.handle(env)
    }
}
init()