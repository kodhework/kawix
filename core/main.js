
require("./Promise")
exports.Promise= global.Promise 

global.kwcore= global.kawix= module.exports 

// good helpers
global.kwcore.__path= __dirname 
global.kwcore.__file = __filename 


var op={}

/** Access to object for transpile code */
Object.defineProperty(exports, "NextJavascript", {
	get: function () {
		return op.NextJavascript ? op.NextJavascript : (op.NextJavascript = require("./NextJavascript"))
	}
})

/** Access to object for requiring modules */
Object.defineProperty(exports, "KModule", {
	get: function () {
		return op.KModule ? op.KModule : (op.KModule = require("./KModule"))
	}
})

/** Access to babel transpilator */
Object.defineProperty(exports, "babel", {
	get: function () {
		return op.babel ? op.babel : (op.babel = require("./babel"))
	}
})