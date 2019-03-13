require("./native.js")
require("./Promise")
global.regeneratorRuntime= require("./runtime.js")

exports.Promise = global.Promise
global.kwcore = global.kawix = module.exports
// good helpers
global.kwcore.__path = __dirname
global.kwcore.__file = __filename


var op = {}

/** Access to object for transpile code */
Object.defineProperty(exports, "NextJavascript", {
	get: function () {
		if (global.___kmodule___basic && global.___kmodule___basic.__nextJavascript)
			return global.___kmodule___basic.__nextJavascript
		throw new Error("Not implemented in browser")
	}
})

/** Access to object for requiring modules */
op.KModule = require("./KModule")
Object.defineProperty(exports, "KModule", {
	get: function () {
		return op.KModule 
	}
})

/** Access to babel transpilator */
Object.defineProperty(exports, "babel", {
	get: function () {
		throw new Error("Not implemented in browser")
	}
})