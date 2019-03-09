import '../mod.js'
import  config from '../config.coffee'
import Path from 'path'

init()
function deferred(){
    var def= {}
    def.promise= new Promise(function(a,b){
        def.resolve= a 
        def.reject = b
    })
    return def
}

function sleep(time){
    var def= deferred() 
    setTimeout(def.resolve, time)
    return def.promise 
}
async function init(){
    try{

        var c= new config(Path.join(__dirname,"config.cson"))
        var d= await c.read()
        console.info(d)

        c.on("change", function(d){
            console.info(d)
        })
        await sleep(1000000)
        


    }catch(e){
        console.error(e)
    }
}

