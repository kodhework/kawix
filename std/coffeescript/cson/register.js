// Copyright 2019 Kodhe @kawix/std

/** Enable @kawix/core use coffeescript language */
import CSON from './runtime.js'
if(typeof kwcore != "object" || !kwcore){
    throw new Error("You need require @kawix/core")
}

var compile= function(code, file, options){
    if(typeof file == "object"){
        options= file 
        file= options.filename 
    }
    

    options= options || {}
    var obj= CSON.parse(code)
    return {
        transpile: false,
        code: "module.exports= " + JSON.stringify(obj)
    }
}



var register= function(){
    var extensions= kwcore.KModule.Module.extensions
    if(!extensions[".cson"]){
        extensions[".cson"]= compile
    }
}

register()
exports.default = register 
exports.CSON= CSON 
exports.register= register 
exports.compile = compile 

// console.log(" > CSON support added")