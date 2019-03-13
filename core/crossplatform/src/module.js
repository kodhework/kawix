var Path= require("path")
var Module= function(file,parent){
	this.filename= file 
	this.parent= parent 
	this.exports={}
}
Module._cache= {}
Module._resolveFilename= function(filename){
	throw new Error("Not implemented resolveFilename. Failed to resolve: "+filename)
}
Module.isBrowser= true
Module.prototype._compile= function(code, filename){
	if(filename){
		this.filename= filename 
	}

	if(code.startsWith("#")){
		var i= code.indexOf(10)
		var y= code.indexOf(13)
		if((y < i && y > 0) || i < 0 ) i= y 
		code= code.substring(i+1)
	}
	var wrapped= Function("global,module,require,exports,Buffer,process,__filename,__dirname", code)
	wrapped(window, this, this._createrequire(), this.exports, global.___kmodule___basic.mod.buffer.Buffer, global.___kmodule___basic.mod.process, this.filename, Path.dirname(this.filename))
}


Module.prototype._createrequire= function(){
	return function(mod){
		var mod1 = global.___kmodule___basic.mod[mod]
		if (mod1) {
			return mod1
		}
		
		if(Module._cache[mod]){
			return Module._cache[mod].exports
		}
		throw new Error("Failed getting module: " + mod)
	}
}

module.exports= {
	Module: Module,
	builtinModules: global.___kmodule___basic.mod.builtInModules,
	defaultRequire: function (mod) {
		var mod1 = global.___kmodule___basic.mod[mod]
		if (mod1) {
			return mod1
		}
		if (Module._cache[mod]) {
			return Module._cache[mod].exports
		}
		throw new Error("Failed getting module: " + mod)
	}
}