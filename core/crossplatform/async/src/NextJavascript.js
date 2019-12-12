
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

	if(!Babel){
		require("./babel")
		Babel = ___Babel 
	}
	/*
	if (!options) {
		options = {
			presets: ['typescript', 'es2015','es2016','es2017',['stage-2',{
				decoratorsBeforeExport: false
			}]],
			sourceMaps: true,
			comments: false
		}
	}
	*/
	if(!options.filename.endsWith(".js")){
		/*
		if(options.presets && options.presets.indexOf("typescript") >= 0){
			options.filename += ".ts"
		}*/
	}

	/*
	// options.filename += ".js"
	if(!options.plugins){
		if(!dynamicImport)
			dynamicImport=require("./babel.dynamic.import.js")
		options.plugins= [dynamicImport]
	}*/
	var result 
	
	if(Babel.__defaultTransform)
		result = Babel.__defaultTransform(source,options)
	else 
		result= Babel.transform(source, options)
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