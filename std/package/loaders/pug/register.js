// Copyright 2019 Kodhe @kawix/std


import Url from 'url'

import lexer from 'npm://pug-lexer@^4.0.0'
import parser from 'npm://pug-parser@^5.0.0'
import codegen from 'npm://pug-code-gen@^2.0.1'


import Exception from '../../../util/exception'
import Path from 'path'

if (typeof kwcore != "object" || !kwcore) {
	throw new Error("You need require @kawix/core")
}

/*
export var kawixPreload= async function(){
	try{
		var int1= setTimeout(function(){}, 20000000)
		codegen = await import('npm://pug-code-gen@^2.0.1')
		lexer = await import('npm://pug-lexer@^4.0.0')
		parser = await import('npm://pug-parser@^5.0.0')
		
	}catch(e){
		console.error("error loading:",e)
		throw e 
	}finally{
		clearTimeout(int1)
	}
}*/

var parseAst= function(ast,parent, data){
	if (ast.type == "Extends")
		throw Exception.create("Extends is not supported in this async version of pug loader")
	
	if (ast.type == "RawInclude"){
		let id = '$$$' + data.imports.length
		
		data.imports.push({
			path: ast.file.path,
			id
		})
		ast.type= 'Code'
		ast.mustEscape= false 
		ast.val = `((${id}.invoke || ${id}.default || ${id})(locals))`
		ast.buffer= true 
		delete ast.file 
	}
	else{

		let nodes= ast.nodes || (ast.block && ast.block.nodes) || []
		for(var i=0;i<nodes.length;i++){
			parseAst(nodes[i], ast, data)
		}
	}

}

var parse1= function(code, filename){
	
	var tokens = lexer(code, { filename })
	var ast = parser(tokens, { filename, code })
	var data={
		imports:[]
	}
	parseAst(ast, null, data)
	
	data.ast= ast 
	return data
}

var runtimefile
if (__filename.indexOf("://") >= 0 && __filename[1] != ":") {
	runtimefile = Url.resolve(__filename, 'runtime.js')
}
else {
	runtimefile = Path.join(__dirname, "runtime.js")
}


var compile1 = function (code, file, options) {
	if (typeof file == "object") {
		options = file
		file = options.filename
	}
	
	var data= parse1(code, file)

	// generate code
	// var wrap = require(Path.normalize('/virtual/pug-runtime_2/wrap.js'))

	
	var funcStr = codegen(data.ast, {
		compileDebug: true,
		pretty: true,
		inlineRuntimeFunctions: true,
		templateName: 'default$$'
	})

	var rcode= ''
	for(var i=0;i<data.imports.length;i++){
		// use imports 
		rcode += "\nimport * as " + data.imports[i].id + " from "+ 
			data.imports[i].path
	}
	
	//rcode+= "\nimport pug from \"" + runtimefile + "\""
	
	rcode += '\nvar _def= (function(){\n\t' + funcStr + "\n;return default$$; })()"
	rcode+= "\nexport default _def"
	rcode += `\nexport var invoke = function(env){
		var content
		if(env && env.reply && env.request){
			var locals= env.body || env.request.body || env.request.query || {}
			content= _def(locals)
			env.reply.code(200).type('text/html;charset=utf8').send(content)
		}else{
			content= _def(env)
		}
		return content
	}
	
	export var kawixDynamic={
		time: 10000
	}
	`
	//rcode += "\nif(typeof module == 'object')"
	return {
		code: rcode
	}
}



var register1 = function () {
	var extensions = kwcore.KModule.Module.extensions
	var languages = kwcore.KModule.Module.languages
	if (!extensions[".pug"]) {
		extensions[".pug"] = compile1
	}
	if (!languages["pug"]) {
		languages["pug"] = ".pug"
	}
}

register1()
export default register1
export var register = register1
export var parse = parse1
export var compile = compile1

