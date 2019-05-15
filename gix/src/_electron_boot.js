var arg, kawix, n, id, start
var Path = require("path")


for (var i = 0; i < process.argv.length; i++) {
	arg = process.argv[i]
	if (n == 0) {
		id = arg
		n = 1
	}
	else if (n == 1) {
		start = arg
		break
	}
	else if (arg == process.argv[2]) {
		// require kawix core
		kawix = require(arg)
		n = 0
	}
}


var init1 = function () {
	if (kawix) {
		kawix.KModule.injectImport()
		if (!start) start = __dirname + Path.sep + "start.js"

		kawix.KModule.import(start).then(function (response) {
			response.default(id).then(function () {
			}).catch(function (e) {
				console.error("Failed execute: ", e)
				process.exit(10)
			})
		}).catch(function (e) {
			console.error("Failed execute: ", e)
			process.exit(10)
		})
	}
}
require("electron").app.once("ready", init1)
