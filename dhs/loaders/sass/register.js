// Copyright 2019 Kodhe @kawix/std


// import fs from '../../fs/mod.js'
import sass from './runtime' //'npm://sass@1.19.0'

var compile = function (code, file, options) {
	var imports= [], id=0
	if (typeof file == "object") {
		options = file
		file = options.filename
	}
	options = options || {}

	var result= sass.renderSync({
		data: code,
		importer: function(url,prev){
			// add an import
			imports.push(url)
			id++
			return {
				contents: "/*$$$IMPORT:" + id + "*/\n"
			}
		}
	})
	var css= result.css.toString()
	var lines, line, cline = [], allcode = [], reg = /\$\$\$IMPORT:(\d+)/
	lines= css.split("\n")
	for(var y=0;y<lines.length;y++){
		line= lines[y]
		if(reg.test(line)){
			allcode.push("content += " + JSON.stringify(cline.join("\n")))
			cline=[]
			line.replace(reg, function(a,b){
				allcode.push("content += _invoke(imported[" + b + "]) + \"\\n\"")
			})
		}else{
			cline.push(line)
		}
	}


	if(cline.length){
		allcode.push("content += " + JSON.stringify(cline.join("\n")))
	}

	var code= [], imported=[]
	imported.push("var imported= []")
	for(var y=0;y<imports.length;y++){
		code.push("import * as _a" + y + " from " + JSON.stringify(imports[y]))
		imported.push("imported.push(_a"+y+")")
	}

	code.push("var _invoke= function(mod){")
	code.push("	if(typeof mod.invoke == 'function') return mod.invoke() ")
	code.push("	if(typeof mod.default == 'function') return mod.default() ")
	code.push("	if(mod.default !== undefined) return mod.default ")
	code.push(" return mod || ''")
	code.push("}")
	code.push("export var invoke= function(){")
	code.push("	var content=''")
	code.push("	" + imported.join("\n\t"))
	code.push("	" + allcode.join("\n\t"))
	code.push("	return content")
	code.push("}")

	code.push("export var httpInvoke= function(env, ctx){")
	code.push("	env.reply.setHeader('content-type', 'text/css')")
	code.push("	var content= invoke()")
	code.push("	env.reply.send(content)")
	code.push("}")




	return {
		code: code.join("\n")
	}
}


var register = function () {
	var extensions = kwcore.KModule.Module.extensions
	var languages = kwcore.KModule.Module.languages
	if (!extensions[".scss"]) {
		extensions[".scss"] = compile
	}

	if (!languages["sass"]) {
		languages["sass"] = ".scss"
	}
	if (!languages["scss"]) {
		languages["scss"] = ".scss"
	}
}

register()
exports.default = register
exports.register = register
exports.compile = compile
