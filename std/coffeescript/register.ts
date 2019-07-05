// Copyright 2019 Kodhe @kawix/std

/** Enable @kawix/core use coffeescript language */

import CoffeeScript from './runtime.js'
if(typeof kwcore != "object" || !kwcore){
    throw new Error("You need require @kawix/core")
}

var compile= function(code, file, options){
    if(typeof file == "object"){
        options= file
        file= options.filename
    }
    // compile to coffee
    options= options || {}
    var code= CoffeeScript.compile(code, {
        inlineMap: options.inlineMap !== false,
        filename: file
    })
    return {
        code: code
    }
}

var register= function(){
    var extensions= kwcore.KModule.Module.extensions
    var languages = kwcore.KModule.Module.languages
    if(!extensions[".coffee"]){
        extensions[".coffee"]= compile
    }
    if (!languages["coffeescript"]) {
        languages["coffeescript"]= ".coffee"
    }
    if (!languages["coffee"]) {
        languages["coffee"]= ".coffee"
    }
}

register()
exports.default = register
exports.register= register
exports.compile = compile

// console.log(" > Coffeescript support added")
