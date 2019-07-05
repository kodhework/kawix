// Copyright 2019 Kodhe @kawix/kivi
import '../std/coffeescript/register'
import Parser from './parser'

var compile= function(code, file, options){
    if(typeof file == "object"){
        options= file
        file= options.filename
    }
    options= options || {}
	var parser= new Parser()
    var ast= parser.transform(code, {
        inlineMap: options.inlineMap !== false,
        filename: file
    })
    return ast
}


var register= function(){
    var extensions= kwcore.KModule.Module.extensions
    var languages = kwcore.KModule.Module.languages
	if(!extensions[".kivi"]){
        extensions[".kivi"]= compile
    }
	if(!extensions[".kivi.html"]){
        extensions[".kivi.html"]= compile
    }
	if(!extensions[".es6.html"]){
        extensions[".es6.html"]= compile
    }

    if (!languages["kivi"]) {
        languages["kivi"]= ".kivi"
    }
    if (!languages["es6html"]) {
        languages["es6html"]= ".kivi"
    }
}

register()
exports.default = register
exports.register= register
exports.compile = compile
