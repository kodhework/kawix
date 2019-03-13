global.___kmodule___basic = global.___kmodule___basic || {}
var b = global.___kmodule___basic.mod = global.___kmodule___basic.mod || {}

var builtInModules = [
	"assert",
	"path",
	"http",
	"https",
	"buffer",
	"events",
	"process",
	"querystring",
	"string_decoder",
	
	"url",
	"stream",
	"vm",
	"util",
	// "inherits",
	"os",
	"zlib"
	//"module"
]
var yes= true
b.builtInModules= builtInModules
Object.defineProperty(b, "assert", {
	enumerable: yes,
	get: function () {
		return require("assert")
	}
})

Object.defineProperty(b, "path", {
	enumerable: yes,
	get: function () {
		return require("path")
	}
})

Object.defineProperty(b, "string_decoder", {
	enumerable: yes,
	get: function () {
		return require("string_decoder")
	}
})

Object.defineProperty(b, "buffer", {
	enumerable: yes,
	get: function () {
		return require("buffer")
	}
})

Object.defineProperty(b, "events", {
	enumerable: yes,
	get: function () {
		return require("events")
	}
})
Object.defineProperty(b, "process", {
	enumerable: yes,
	get: function () {
		return require("process")
	}
})
Object.defineProperty(b, "querystring", {
	enumerable: yes,
	get: function () {
		return require("querystring")
	}
})
Object.defineProperty(b, "url", {
	enumerable: yes,
	get: function () {
		return require("url")
	}
})
Object.defineProperty(b, "stream", {
	enumerable: yes,
	get: function () {
		return require("stream")
	}
})
Object.defineProperty(b, "vm", {
	enumerable: yes,
	get: function () {
		return require("vm")
	}
})

Object.defineProperty(b, "util", {
	enumerable: yes,
	get: function () {
		return require("util")
	}
})

/*
Object.defineProperty(b, "inherits", {
	enumerable: yes,
	get: function () {
		return require("inherits")
	}
})*/

Object.defineProperty(b, "http", {
	enumerable: yes,
	get: function () {
		return require("http")
	}
})

Object.defineProperty(b, "https", {
	enumerable: yes,
	get: function () {
		return require("https")
	}
})

Object.defineProperty(b, "os", {
	enumerable: yes,
	get: function () {
		return require("os")
	}
})

Object.defineProperty(b, "zlib", {
	enumerable: yes,
	get: function () {
		return require("zlib")
	}
})

/*
Object.defineProperty(b, "module", {
	enumerable: yes,
	get: function () {
		return require("module")
	}
})*/

