import Server from './server.js'
import Router from './router.js'
import Reply from './reply.js'
import Serializer from './serializer.js'
import Static1 from './static.js'
var Static= function(path,options){
    if(!options){
        options= {
            // 1 día
            maxAge: 3600000 * 24
        }
    }
    return Static1(path,options)
}
export var router= Router
export var reply= Reply
export var serializer= Serializer
export var server= Server
export var staticServe= Static
export default {
    server: Server,
    router: Router,
    reply: Reply,
    serializer: Serializer ,
    staticServe: Static
}
