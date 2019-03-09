#!/usr/bin/env node

var arg
var Kawix= require("../main")
var offset= 0
var args= [].concat(process.argv)
for(var i=2;i<args.length;i++){
    arg= args[i]
    if(!arg)
        break 

    if(arg == "--reload" || arg == "--force"){
        process.argv.splice(offset + i,1)
        offset--
        Kawix.KModule.defaultOptions= {
            force: true
        }
    }
    else if(arg.startsWith("--")){
        process.argv.splice(offset + i,1)
        offset--
    }
    else{
        
        // require file using KModule
        Kawix.KModule.injectImport()
        Kawix.KModule.import(arg,{
            parent: process.cwd() + "/cli.js"
        }).then(function(){}).catch(function(e){
            console.error("Failed executing: ", e)
        })
        break 
    }
}

