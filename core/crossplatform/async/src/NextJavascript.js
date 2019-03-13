
var Babel

var dynamicImport
var transpiledLine = exports.transpiledLineComment= "\n// kawi converted. Preserve this line, Kawi transpiler will not reprocess if this line found"
var Next= exports.default= function(){}
Next.prototype.transpile= function(source, options){

	if(source.indexOf(transpiledLine) >= 0){
		return {
			code: source
		}
	}

	if(!Babel)
		Babel = require("./babel")

	if (!options) {
		options = {
			presets: ['es2015','es2016','es2017',['stage-2',{
				decoratorsBeforeExport: false
			}]],
			sourceMaps: true,
			comments: false
		}
	}
	if(!options.plugins){
		if(!dynamicImport)
			dynamicImport=require("./babel.dynamic.import.js")
		options.plugins= [dynamicImport]
	}
	
	var result= Babel.transform(source, options)
	if(result.code){
		result.code += transpiledLine
		if(result.code.trim().startsWith("#!")){
			// remove that line
			result.code= result.code.split(/\r\n|\r|\n/g)
			result.code.shift()
			result.code= result.code.join("\n")
		}
	}
	
	return result

}



exports.Next= Next
exports.transpile= function(a,b){
	var next= new Next()
	return next.transpile(a,b)
}