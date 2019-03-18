var Next, fs, Os, Path, Module, Url, browser, _require, Mod, nd, npmResolver, _module, _next
Os= require("os")
Mod = function () { }


if(Os.platform() != 'browser'){
	npmResolver= function(){
		return Mod.import(Path.join(__dirname, "..", "..", "src", "npm-import"))
	}

	// THIS FOR AVOID ERRORS WITH WEBPACK
	
	Next= function(){
		var nd  = __dirname + "/../async/src/NextJavascript.js"
		if(!_next) _next= require(nd)
		return _next 
	}
	Next()

	nd= "f" +"s"
	fs = require(nd)
	nd= "mod" + "ule"
	_module = require(nd)


	Module= _module.Module
	_require = require 

}else{

	Next = function () {
		if (global.___kmodule___basic && global.___kmodule___basic.__nextJavascript)
			return global.___kmodule___basic.__nextJavascript
		if (!_next){
			_next= {
				transpile: function(code){
					return {
						code:code
					}
				}
			}
		}
		return _next
	}

	_module= require("./module.js")
	Module= _module.Module
	npmResolver= function(){
		throw new Error("npm resolver not available in browser")
		return 
	}

	browser= {}
	

	fs= require("./browser.fs.js")
	fs= fs(Mod)

	_require = _module.defaultRequire 

	// enable loader
	window.KModuleLoader= Mod
}

var eval1= function(str){
	var wrapped= Function("", "return "+ str)
	return wrapped()
}


var Path= require("path")
var Url= require('url')
var httpr={}

// Inline functions 
var isVirtualFile, transpile, createDefault, getKModule,
	_getCachedFilename, getCachedFilenameSync, getCachedFilename,
	changeSource, loadInjectImportFunc, readHttp, readNpm 

var builtinModules = _module.builtinModules;
(function(){
	isVirtualFile= function(file){
		if(Os.platform() == "win32" && file.startsWith("\\virtual")) return true;
		return file.startsWith("/virtual")
	}

	createDefault = function (options) {
		var defoptions = Mod.defaultOptions || exports.defaultOptions
		options = options || {}
		for (var id in defoptions) {
			if (options[id] === undefined)
				options[id] = defoptions[id]
		}
		return options
	}
	getKModule= function(filename){
		var nmod={
			filename: filename,
			require : Mod.require,
			import : Mod.import,
			addVirtualFile : Mod.addVirtualFile,
			extensions : Mod.extensions,
			languages: Mod.languages,
			replaceSyncRequire : Mod.replaceSyncRequire,
			removeCached : Mod.removeCached
		}
		return nmod 
	}
	_getCachedFilename= function(uri, options){
		options= options || {}
		if(!uri.protocol){
			uri.protocol= "file:"
			uri.pathname= Path.normalize(uri.pathname)
		}

		var name= (options.mask || Url.format(uri)).replace(/\:|\?/g, '').replace(/\\/g, '/')
		if(uri.search){
			name += uri.search.replace(/\:|\?|\\/g, '')
		}
		var parts= name.split("/")
		parts= parts.filter(function(a){
			return !!a
		})
		if(options.virtual){
			parts.shift()
		}

		var full= parts.join(Path.sep)
		var kawi_dir= Path.join(Os.homedir(), ".kawi")
		var file_dir= Path.join(kawi_dir, full)
		var cache_dir= Path.dirname(file_dir)
		return {
			kawi_dir: kawi_dir,
			file_dir: file_dir,
			cache_dir: cache_dir ,
			parts: parts,
			full: full 
		}
	}
	getCachedFilenameSync = function (uri, options) {
		var result = _getCachedFilename(uri, options)
		var kawi_dir = result.kawi_dir
		var cache_dir = result.cache_dir
		var file_dir = result.file_dir
		var parts = result.parts
		var full = result.full
		var part

		try {
			if (fs.accessSync(cache_dir, fs.constants.F_OK)) {
				return file_dir
			}
		} catch (e) { }

		var path = kawi_dir
		try {
			fs.accessSync(path, fs.constants.F_OK)
		} catch (e) {
			fs.mkdirSync(path)
		}

		for (var i = 0; i < parts.length - 1; i++) {
			part = parts[i]
			path = Path.join(path, part)
			try {
				fs.accessSync(path, fs.constants.F_OK)
			} catch (e) {
				fs.mkdirSync(path)
			}
		}

		return file_dir

	}
	getCachedFilename = function (uri, options) {
		var result = _getCachedFilename(uri, options)
		var kawi_dir = result.kawi_dir
		var cache_dir = result.cache_dir
		var file_dir = result.file_dir
		var parts = result.parts
		var full = result.full


		return new Promise(function (resolve, reject) {
			var i = 0, part
			var createTree = function (path) {
				try {
					if (!path) {
						path = kawi_dir
					}
					fs.access(path, fs.constants.F_OK, function (err) {
						if (err) {
							fs.mkdir(path, function (err) {
								if (err) return reject(err)
								part = parts[i]
								if (i == parts.length - 1)
									return resolve(file_dir)
								i++
								return createTree(Path.join(path, part))
							})
						} else {
							part = parts[i]
							if (i == parts.length - 1)
								return resolve(file_dir)
							i++
							return createTree(Path.join(path, part))
						}
					})
				} catch (e) {
					reject(e)
				}
			}

			fs.access(cache_dir, fs.constants.F_OK, function (err) {
				if (err) return createTree()
				return resolve(file_dir)
			})
		})



	}

	validateFileUrl = function (file) {

		var uri = Url.parse(file)
		if (Os.platform() == "win32") {
			if (file[1] == ":")
				uri = Url.pathToFileURL(file)
		}
		if (uri.protocol) {

			if (uri.protocol != "http:" && uri.protocol != "npm:" && uri.protocol != "npmi:" && uri.protocol != "https:" && uri.protocol != "file:") {
				throw new Error("Protocol " + uri.protocol + " not supported")
			}
		}
		return uri
	}
	changeSource = function (source) {
		// this method works with transpiled code
		// that is known the generated style, can determine the modules imported with `import`

		var lines = source.split(/\r\n|\r|\n/g)
		var line
		var maybeRequire = []
		var reg = /\=?\s?(_interopRequire.*\()?require\((.*)\)\)?[\;|\n|\r]/
		var esm = false, req, required = []

		for (var i = 0; i < lines.length; i++) {
			line = lines[i]
			if (line) {
				if (reg.test(line)) {
					maybeRequire.push({
						line: line,
						index: i
					})
					esm = true
				}
				/*else if(!maybeRequire.length && (line.startsWith("Object") || line.startsWith("exports") || line.indexOf("use strict") >= 0) ){
	
				}*/
				else if (maybeRequire.length) {
					// good, is a ESM module
					esm = true
					break
				}
			}
		}



		var num, json, code

		num = Mod.__num++

		if (esm) {
			var z = -1
			for (var i = 0; i < maybeRequire.length; i++) {
				req = maybeRequire[i]

				mod = null
				req.line = req.line.replace(reg, function (a, _, c) {
					var b = c
					if (c.endsWith(")"))
						c = c.substring(0, c.length - 1)
					if (c[0] == "\"") {
						try {
							c = JSON.parse(c) //if good is because is module // c.substring(1, c.length-1)
							if (builtinModules.indexOf(c) < 0) {
								mod = c
								z++
								return a.replace(b, b.replace(c, "___kawi__internal__" + num + "MOD_" + c.replace(/\./g, '') + "_" + z))
							}
						} catch (e) {
						}
					}
					return a
				})


				if (mod) {
					if (builtinModules.indexOf(mod) < 0) {
						required.push(mod)
						lines[req.index] = req.line
					}
				}
			}

		}

		if (required.length) {

			source = lines.join("\n")

			// create a preloader function
			json = JSON.stringify(required)
			code = "function(KModule){\n"

			code += "	var resolve, reject\n"
			code += "	var required= " + json + "\n"
			code += "	var num=" + num + "\n"
			code += "	var i=-1\n"
			code += "	var __load= " + "function () {\n" +
			'	i++\n' +
			'	var mod = required[i]\n' +
			'	if (!mod) return resolve()\n' +
			'	var unq = "___kawi__internal__" + num + "MOD_" + mod.replace(/\\./g, "") + "_" + i\n'+
			'	var promise = KModule.import(mod, {\n'+
			'		uid: unq,\n'+
			'		parent: module\n'+
			'	})\n'+
			'	if (promise && typeof promise.then == "function")\n'+
			'		promise.then(__load).catch(reject)\n'+
			'	else\n'+
			'		__load()\n'+
			'}\n'

			code += "	var promise= new Promise(function(a,b){ resolve=a; reject=b; })\n"
			code += "	__load()\n"
			code += "	return promise\n"
			code += "}"
		}

		var imports = {}
		imports.mods = required
		imports.inject = code
		imports.source = source + (code ? ("\nvar ___kawi__async = \n" + code) : "")
		return imports

	}
	loadInjectImportFunc = function (ast) {

		


		var code, injectCode, ucode
		if (!ast.injectCode) {
			var i = ast.code.indexOf("var ___kawi__async = \n")
			if (i >= 0) {
				code = ast.code.substring(0, i)
				injectCode = ast.code.substring(i + 20)
				ast.code = code
				ast.injectCode = injectCode.trim()
				i = ast.injectCode.indexOf("function")
				ast.injectCode = ast.injectCode.substring(i)
			}
		}

		if (ast.injectCode && !ast.inject) {
			if (ast.injectCode.indexOf("regeneratorRuntime") >= 0) {
				ucode = "(function(){" + asynchelper + "\n\nreturn " + ast.injectCode + ";\n})()"
				ast.inject = eval(ucode)
			} else {

				ucode = "(" + ast.injectCode + ")"
				try {
					ast.inject = eval(ucode)
				} catch (e) {

					throw e
				}
			}
		}

	}

	getMask = function (url, value) {
		if (value.mask) {
			return value.mask
		}
		var name = Path.basename(value.redirect)
		if (url.endsWith(value)) {
			return url
		}
		else {
			return url + "/" + name
		}
	}
	readNpm = function (url) {

		//var uri= Url.parse(url)
		var module = url.substring(url.indexOf("://") + 3)

		var parts = module.split("/")
		var oparts = [].concat(parts)
		var subpath = ""

		while (parts.length > 2) {
			parts.pop()
		}
		if (parts.length > 1) {
			if (parts[0].startsWith("@")) {
				// valid 
			}
			else {
				parts.pop()
			}
		}
		subpath = oparts.slice(parts.length)
		subpath = subpath.join("/")
		module = parts.join("/")
		var moduledesc = Mod._npmcache[module]
		var continue3 = function (moduledesc) {

			if (moduledesc) {

				Mod._npmcache[module] = moduledesc
				// return 
				if (subpath) {
					return {
						redirect: Path.join(moduledesc.folder, subpath),
						from: 'npm',
						mask: "npm://" + moduledesc.name + "$v$" + moduledesc.version + "/" + subpath
					}
				} else {
					return {
						redirect: moduledesc.main,
						from: 'npm',
						mask: "npm://" + moduledesc.name + "$v$" + moduledesc.version + "/" + (Path.relative(moduledesc.folder, moduledesc.main))
					}
				}
			}
		}

		if (moduledesc) {
			return continue3(moduledesc)
		}




		return new Promise(function (resolve, reject) {
			var continue2 = function (moduledesc) {
				return resolve(continue3(moduledesc))
			}
			var continue1 = function () {
				if (!process.env.DISABLE_COMPILATION_INFO) {
					console.info("Caching npm module: " + url + " ...")
				}
				Mod._npmImport.resolve(module).then(continue2).catch(reject)
			}

			if (!Mod._npmImport) {
				npmResolver().then(function (loader) {
					Mod._npmImport = loader
					continue1()
				}).catch(reject)
			} else {
				continue1()
			}
		})

	}

	readHttp = function (url) {
		var xhttp = url.startsWith("http://") ? "http" : "https"
		var http = httpr[xhttp]
		if (!http)
			http = httpr[xhttp] = _require(xhttp)
		var uri = Url.parse(url)
		var promise = new Promise(function (resolve, reject) {
			var callback = function (resp) {

				var buf = [], code
				if (resp.statusCode == 302) {
					var loc = resp.headers.location
					if (!loc.startsWith("http:") && !loc.startsWith("https:")) {
						loc = Url.resolve(url, loc)
					}
					return resolve(readHttp(loc))
				}
				else if (resp.statusCode != 200) {
					return reject(new Error("Invalid response from " + url))
				}
				else {

					resp.on("data", function (b) {
						if (!Buffer.isBuffer(b))
							b = Buffer.from(b)
						buf.push(b)
					})
					resp.on("error", reject)
					resp.on("end", function () {
						buf = Buffer.concat(buf)
						code = buf.toString('utf8')

						return resolve({
							code: code,
							"type": resp.headers["content-type"],
							"name": uri.pathname
						})
					})
				}
			}

			http.get(url, callback).on("error", reject)
		})
		return promise
	}

	transpile= function(file, basename, source, options) {
		var transpilerOptions, json, imports


		if(options.injectImport === undefined && Mod.__injected){
			options.injectImport= true 
		}

		if (options && options.language) {
			// specified by language
			if (Mod.languages[options.language])
				basename += Mod.languages[options.language]
		}
		for (var ext in Mod.extensions) {
			if (basename.endsWith(ext)) {
				if (typeof Mod.extensions[ext] == "function") {
					json = Mod.extensions[ext](source, file, options)
					source = json.code
				}
				else {
					if (ext == ".json") {
						return {
							code: "module.exports= " + source
						}
					}
				}
			}
		}



		if (json && json.transpile === false) {
			options.transpile = false
		}

		if (options.transpile !== false) {
			if (json && json.transpilerOptions) {
				transpilerOptions = json.transpilerOptions
			}
			else {
				transpilerOptions = {
					presets: ['es2015', 'es2016', 'es2017', ['stage-2', {
						decoratorsBeforeExport: false
					}]],
					sourceMaps: true,
					comments: true,
					filename: file
				}

				if (basename.endsWith(".ts")) {
					transpilerOptions.presets = ["typescript", ['stage-2', {
						decoratorsBeforeExport: false
					}]]
				}
			}

			if (transpilerOptions && options.transpilerOptions) {
				for (var id in options.transpilerOptions) {
					transpilerOptions[id] = options.transpilerOptions[id]
				}
			}

			json = Next().transpile(source, transpilerOptions)
			delete json.options
			if (options.injectImport) {
				imports = changeSource(json.code)
				json.code = imports.source
				json.injectCode = imports.inject
				loadInjectImportFunc(json)
			}

		}
		else {
			json = {
				code: source
			}
			if (options.injectImport) {
				loadInjectImportFunc(json)
			}
		}

		return json

	}
})()



Mod._cache = {}
Mod._cacherequire = {}
Mod._cacheresolve= {}
Mod._virtualfile= {}
Mod._npmcache= {}
Mod.cachetime= 5000
Mod._namesid = 0

Mod.extensions= {
	".json": null,
	".js": null, 
	".es6": null
}

Mod.languages = {
	"json": ".json",
	"javascript": ".js",
	"ecmascript": ".js",
	"typescript": ".ts"
}
if(Module.isBrowser){
	Module.extensions= Mod.extensions
	Module.languages = Mod.languages
}

Mod.__num = 0
Mod.__injected = true
Mod.injectImport = function (value) {
	if(value === undefined) value= true 
	Mod.__injected = value
}
Mod.disableInjectImport = function () {
	Mod.__injected = false
}



Module._originalResolveFilename = Module._resolveFilename
Module._resolveFilename= function(name,parent){

	if(name.startsWith("___kawi__internal__")){
		return name 
	}
	else if(Mod._virtualfile[name]){
		return name 
	}
	else if(builtinModules.indexOf(name) >= 0){
		return name
	}
	else if (!name.startsWith(".")) {
		parts = name.split(/\/|\\/)
		parts = Path.normalize("/virtual/" + parts[0])
		if (Mod._virtualfile[parts]) {
			name = Mod.resolveVirtual(Path.normalize("/virtual/" + name), parent)
			if (name) return name
		}
	}

	if(parent && parent.filename && isVirtualFile(parent.filename)){
		// Allow resolve
		result= Mod.resolveVirtual(name,parent)
		if(!result){
			return Module._originalResolveFilename.apply(Module, arguments)			
		}
		return result
	}
	return Module._originalResolveFilename.apply(Module, arguments)
}


Mod.resolveVirtual= function(name, parent){
	var possibles=[]
	var path,dirname, path1, normalize=function(a){return a}

	if(isVirtualFile(name)){
		possibles.push(name)
	}
	
	else{
		
		dirname= Path.dirname(parent.filename)	
		if(name.startsWith("./") || name.startsWith("../")){
			path= normalize(Path.normalize(Path.join(dirname, name)))
			possibles.push(normalize(path))
		}
		else{
			path= Path.join(dirname, "node_modules", name)
			possibles.push(path)
			path1= dirname 
			while (path1 && path1 != (Path.sep + "virtual") && path1 != Path.sep  && path1 != ""){
				path1= Path.dirname(path1)
				path= Path.join(path1, "node_modules", name)
				possibles.push(normalize(path))
			}
		}
	}
	var possiblesFromFile= function(name){
		var possibles=[] 
		for(var ext in Mod.extensions){
			possibles.push(name+ext)
		}
		return possibles
	}
	var possiblesFromFolder= function(name){
		var possibles={}, path, data, pjson, rpossibles=[]
		// package json?
		path= normalize(Path.join(name,"package.json"))
		data= Mod._virtualfile[path]
		if(data){
			if(typeof data == "function")
				data= data()			
			
			pjson= data.content.toString()
			pjson= JSON.parse(pjson)
			if(pjson.main){
				path= normalize(Path.normalize(Path.join(name, pjson.main)))
				possibles[path]= true 
				for(var ext in Mod.extensions){
					possibles[path+ext]= true 
				}
			}
		}
		possibles[normalize(Path.join(name,"index.js"))]= true 
		for(var ext in Mod.extensions){
			possibles[normalize(Path.join(name,"index"+ext))]= true 
		}
		for(var id in possibles){
			rpossibles.push(id)
		}
		return rpossibles 
	}


	var processPossibles= function(possibles, deep=0){
		var possible, vfile, result, possibles1
		for(var i=0;i<possibles.length;i++){
			possible= possibles[i]
			
			vfile= Mod._virtualfile[possible]
			if(vfile){
				if(typeof vfile == "function")
					vfile= vfile()
				
				if(vfile.stat.isdirectory){
					possibles1= possiblesFromFolder(possible)
					result= processPossibles(possibles1, deep+1)
					if(result)
						return result
				}
				else{
					if(vfile.content){
						return possible
					}
				}
			}
			else{
				if(deep==0){
					possibles1= possiblesFromFile(possible)
					result= processPossibles(possibles1, deep+1)
					if(result)
						return result 
				}
			}
		}
	}


	path= processPossibles(possibles)
	//if(!path)
	//	throw new Error("Failed resolve " + name + " from " + parent.filename)
	return path
}


Mod.replaceSyncRequire= function(originalrequire, parent){
	var nrequire= function(name){		
		if(builtinModules.indexOf(name) >= 0)
			return originalrequire(name)

		var file= Module._resolveFilename(name, parent)
		var parts
		if(isVirtualFile(file)){
			return Mod.requireVirtualSync(file,parent)
		}
		else if (!file.startsWith("/") && !file.startsWith(".")){

			parts= file.split(/\/|\\/)
			parts= Path.normalize("/virtual/" + parts[0])
			
			if(Mod._virtualfile[parts]){
				file = Mod.resolveVirtual(Path.normalize("/virtual/" + file),parent)
				if (file) return Mod.requireVirtualSync(file, parent)
			}
		}
		return originalrequire(name,parent)
		
	}
	for(var id in require){
		nrequire[id]= require[id]
	}
	var kmodule=this
	nrequire.ensure= function(a,callback){
		return callback(kmodule.import)
	}
	return nrequire
}


Mod.generateModule= function(file){
	if(!file && Os.platform() == "browser"){
		file= location.url + "/" + Mod._names + ".js"
		Mod._names++ 
	}

	var nmod = getKModule(file)
	module = new Module(file, parent)
	module.filename = file
	module.KModule = nmod
	Module._cache[file] = module
	Mod._cacherequire[file] = module
	return module 
}

Mod.requireVirtualSync= function(file,parent){
	var module= Mod._cacherequire[file]
	if(module){
		return module.exports
	}
	var ast= Mod.compileSync(file)
	var nmod= getKModule(file)

	module = new Module(file, parent)
	module.filename= file
	module.dirname= Path.dirname(file)
	module.KModule= nmod 
	Module._cache[file] = module

	
	var code= "exports.__kawi= function(KModule){\n" +
	"\trequire= KModule.replaceSyncRequire(require,module);\n"
	+ ast.code + "\n}"

	module._compile(code, file)
	module.exports.__kawi(nmod,nmod.import.bind(nmod))
	Mod._cacherequire[file] = module
	return module.exports
}



Mod.compileSync= function(file, options){
	var vfile= Mod._virtualfile[file]
	options= createDefault(options)
	if(typeof vfile == "function"){
		vfile= vfile()
	}

	var ext= Path.extname(file)
	var cached2, stat1, stat2, compile , transpilerOptions, ast
	var uri = validateFileUrl(file)

	if(ext == ".json"){
		ast={
			"code": "module.exports=" + vfile.content.toString()
		}
		return ast
	}
	else{

		cached2= getCachedFilenameSync(uri,{
			virtual: true
		})
		if(!options.force){
			try{
				stat1= fs.statSync(cached2)
			}catch(e){
				if(e.code != "ENOENT"){
					throw e 
				}
				stat1= null 
			}

			if(stat1){
				stat2= vfile.stat 
				if(!(stat2.mtime instanceof Date))
					stat2.mtime= new Date(stat2.mtime)
				
				if(stat1.mtime.getTime() < stat2.mtime.getTime())
					compile= true 

			}else{
				compile= true
			}

		}
		else{
			compile= true
		}		
		if(compile){

			if(vfile.transpiled){				
				options.transpile= false 
			}
			
			ast= transpile(file, file, vfile.content.toString(), options)			
			if(ast){
				str= JSON.stringify(ast)
				fs.writeFileSync(cached2, str)
				delete ast.options
				ast.time= Date.now() 
				Mod._cache[file]= ast
			}
			return ast

		}
		else{
			ast= JSON.parse(fs.readFileSync(cached2, 'utf8'))
			return ast 
		}
	}
}




Mod.import= function(file, options){
	var uri2 , promise, original, filename
	original= file
	options= createDefault(options)
	if(builtinModules.indexOf(file) >= 0){
		return _require(file)
	}


	var uri = validateFileUrl(file)
	filename = this.filename || "current"
	var parts 
	var getBetter= function(){
		if(isVirtualFile(file)){
			file= Mod.resolveVirtual(file,{
				filename: (options.parent && options.parent.filename) || options.parent 
			})
			if(!file){
				throw new Error("Cannot resolve " + original + " from " + filename)
			}
			return Mod.require(file,options)
		}
		else{
			/*if(Os.platform() == "browser"){
				// cannot read on fs 
				throw new Error("Cannot resolve " + original + " from " + filename + " in browser")
			}*/
		}
		
		promise = new Promise(function (resolve, reject) {
			var ids = Object.keys(Mod.extensions)
			var i = -1
			var f = function (file, ext) {
				var cfile = file
				if (ext) {
					cfile = file + ext
				}

				fs.access(cfile, fs.constants.F_OK, function (err) {
					if (err) {
						// test next
						i++
						ext = ids[i]
						if (!ext)
							return reject(new Error("Cannot resolve " + original + " from " + filename))

						return f(file, ext)
					}

					return resolve(Mod.require(cfile, options))
				})
			}
			f(file)
		})
		return promise
	}

	if(uri.protocol || Path.isAbsolute(file)){
		if(uri.protocol && uri.protocol != "file:"){
			return Mod.require(file, options)
		}
		else{
			if(uri.protocol)
				file= Url.fileURLToPath(file)
			file= Path.normalize(file)
		}
		return getBetter()
	}
	else{

		if(!this.filename){
			// is good get from cwd? 
			this.filename= options.parent
			if(!this.filename)
				this.filename= "/default.js"
		}
		
		
		
		if (file.startsWith("./") || file.startsWith("../") || !file.startsWith("/")) {
			
			uri2 = Url.parse(this.filename)
			if (uri2.protocol) {
				if(file.startsWith("./"))
					file= file.substring(2)

				file = Url.resolve(this.filename, file)
				return Mod.require(file, options)
			}
			else{
				
				if(!file.startsWith(".")){
					parts = file.split(/\/|\\/)
					parts = Path.normalize("/virtual/" + parts[0])
					if (Mod._virtualfile[parts]) {
						file = Mod.resolveVirtual(Path.normalize("/virtual/" + file), parent)
						if (file) return Mod.require(file, options)
					}
				}

				// find this or with extensions
				file= Path.join(Path.dirname(this.filename), file)
				return getBetter()
			}
		}
		else {
			file= require.resolve(file)
			return Mod.require(file, options)
		}

	}

}










Mod.removeCached= function(file){
	var cached = Mod._cacherequire[file]
	if(cached){
		if (cached.__kawi_uid && cached.__kawi_uid.length){
			for (var i = 0; i < cached.__kawi_uid.length;i++){
				delete Module._cache[cached.__kawi_uid[i]]
			}
		}
		delete Module._cache[file]		
		delete Mod._cacherequire[file]
	}
	delete Mod._cache[file]
}


Mod.addVirtualFile= function(file, data){
	var path= Path.join("/virtual", file)
	Mod._virtualfile[path]= data
	data.time= Date.now()
}



/** require a module (file or url) */
Mod.require= function(file, options){
	options=options || {}
	var cached = Mod._cacherequire[file]	
	var promise, promise2 , generate, module
		
	var generate= function(ast, resolve, reject){
		module = new Module(file, options.parent)
		module.filename= file
		module.__kawi_time= Date.now()

		var nmod = getKModule(file)		
		module.KModule = nmod
		

		var p
		var continue1 = function () {

			//console.info("exports.__kawi= function(KModule){" + ast.code + "}")
			module._compile("exports.__kawi= function(KModule){\n" +
				"\trequire= KModule.replaceSyncRequire(require,module);\n"
				+ ast.code + "\n}", file)

			// custom mod for each file 
			Module._cache[file] = module
			Mod._cacherequire[file] = module
			module.__kawi_uid = {}
			if (options.uid)
				module.__kawi_uid[options.uid] = true


			var maybePromise = module.exports.__kawi(nmod,nmod.import.bind(nmod))
			
			
			if(module.exports && module.exports.then){
				module.exports.then(function(result){
					module.exports= result
					Module._cache[options.uid || "_internal_kawi_last.js"] = module			
					resolve(module.exports)
				}).catch(reject)
			}
			else if (module.exports && typeof module.exports.kawixPreload == "function") {
				
				var r0= module.exports.kawixPreload()
				if(r0 && r0.then){
					r0.then(function () {
						Module._cache[options.uid || "_internal_kawi_last.js"] = module
						resolve(module.exports)
					}).catch(reject)
				}else{
					Module._cache[options.uid || "_internal_kawi_last.js"] = module
					return resolve(module.exports)
				}
			}
			else{
				Module._cache[options.uid || "_internal_kawi_last.js"] = module			
				return resolve(module.exports)
			}
		}
		if (ast.injectCode && !ast.inject) {
			// inject the code 
			loadInjectImportFunc(ast)
		}

		if (ast.inject) {
			p=ast.inject(nmod)
			if(p && typeof p.then == "function"){
				p.then(function () {
					continue1()
				}).catch(reject)
			}else{
				continue1()
			}
		} else {
			continue1()
		}
	}
	var returnData= function(){
		
		Module._cache[file] = cached
		if (options.uid){
			cached.__kawi_uid = cached.__kawi_uid || {}
			cached.__kawi_uid[options.uid] = true
		}
		Module._cache[options.uid || "_internal_kawi_last.js"] = cached
		return cached.exports
	}

	if(cached){
		


		if (cached.exports.kawixDynamic && ((Date.now() - cached.__kawi_time) >
			(cached.exports.kawixDynamic.time || Mod.cachetime))){

			// exported as dynamicMethod 
			// get if changed ...
			options.ignoreonunchanged= true 
			if(!options.precompiled){
				promise = Mod.compile(file, options)
			}
			promise2 = new Promise(function (resolve, reject) {
				var nc=function(ast){
					
					if(!ast){
						return resolve(returnData()) 
					}else{
					
						if(ast.redirect){
							options.mask= getMask(file, ast)
							if(ast.from == "npm"){
								module = new Module(ast.redirect, options.parent)
								module.load(ast.redirect)
								cached= module 		
								return resolve(returnData())
							}
							return resolve(Mod.require(ast.redirect, options))
						}


						Mod.removeCached(file)
						return generate(ast, function(){
							// this allow hot reloading modules 
							if(module.exports.kawixDynamic && typeof module.exports.kawixDynamic.reload == "function"){
								return resolve(module.exports.kawixDynamic.reload(cached.exports, module.exports))
							}
							return resolve(module.exports)
						}, reject)
					}
				}
				if(options.precompiled){
					loadInjectImportFunc(options.precompiled)
					nc(options.precompiled)
				}
				else{
					promise.then(nc).catch(reject)
				}
			})
			return promise2
		}else{
			return returnData()
		}	

	}

	if (!options.precompiled) {
		promise = Mod.compile(file, options)
	}
	
	promise2= new Promise(function(resolve, reject){
		var nc = function (ast) {
			if (ast && ast.redirect) {
				options.mask = getMask(file, ast)
				if (ast.from == "npm") {
					module = new Module(ast.redirect, options.parent)
					module.load(ast.redirect)
					cached = module
					return resolve(returnData())
				}
				return resolve(Mod.require(ast.redirect, options))
			}
			return generate(ast, resolve, reject)
		}
		if(options.precompiled){
			loadInjectImportFunc(options.precompiled)
			nc(options.precompiled)
		}
		else{
			promise.then(nc).catch(reject)
		}
	})

	return promise2

}



Mod.transpile= transpile


/** Transpile modern es2017 code to old javascript */
Mod.compile= function(file, options){



	var source= ''	
	options= createDefault(options)
	source= options.source
	if(options.injectImport === undefined){
		options.injectImport= Mod.__injected
	}

	var uri= validateFileUrl(file)
	if(uri.protocol == "file:"){
		file= Url.fileURLToPath(Url.format(uri))
		file= Path.normalize(file)
	}

	var basename= uri.pathname
	var transpilerOptions, cached1, cached2, fromHttp
	if (uri.protocol && uri.protocol != "file:") {
		fromHttp= true // remote 
	}

	var json, stat, statc, str, ucached, isjson, vfile
	
	vfile= Mod._virtualfile[file]
	if(vfile){
		if(typeof vfile == "function")
			vfile= vfile()
		if(!(vfile.stat.mtime instanceof Date))
			vfile.stat.mtime= new Date(vfile.stat.mtime)
	}



	var readRemote= function(){
		
		if(uri.protocol == "http:" || uri.protocol== "https:"){
			return readHttp.apply(this, arguments)
		}else if(uri.protocol == "npm:"){
			return readNpm.apply(this, arguments)
		}
		else if(uri.protocol == "npmi:"){
			throw new Error("Not implemented")
		}
	}

	var getstat= function(file, callback){
		if(vfile){			
			return callback(null, vfile.stat)
		}else{
			return fs.stat(file, callback)
		}
	}

	var readfile= function(file, callback){
		
		
		if(vfile){
			return callback(null, vfile.content.toString())
		}
		else{
			return fs.readFile(file, 'utf8', callback)
		}
	}


	var promise= new Promise(function(resolv, reject){

		var resolve= function(value){
			if(value){
				value.time= Date.now() 
				Mod._cache[file]= value 
			}
			return resolv(value)
		}
		var action= ''
		var f 
		var ug = function (err, value) {
			
			if(!action){
				
				action= 'cached3'
				return getCachedFilename(uri, options).then(function(val){
					cached2= val 
					cached1= Path.dirname(val)
					return f()
				}).catch(reject)

			}

			else if(action == "cached"){
				
				action = "cached3"
				if (err) {					
					fs.mkdir(cached, f)
				}
				return f()

			}
			
			else if(action == "cached3"){
				action = "cached4"
				return fs.access(cached2, fs.constants.F_OK, f)
			}
			else if(action == "cached4"){
				if(!err){
					action= "stat"
				}
				else{
					action= "compile"
				}
			}			
			else if(action == "stat"){
				if(err)
					return reject(err)

				if(uri.protocol && uri.protocol.startsWith("npm")){
					action= "transpile"
					value=  readRemote(file)
					if(value.then){
						
						return value.then(function (value) {
							return f(null, value)
						}).catch(reject)
					}
					else{
						return f(null, value)
					}
				}

				ucached= Mod._cache[file]
				if(ucached &&  (Date.now() - ucached.time <= Mod.cachetime)){
					if(options.ignoreonunchanged)
						return resolv(null)
					return resolv(ucached)
				}

				action= 'stat2'				
				return fs.stat(cached2, f)
			}
			else if (action == "stat2") {
				if (err)
					return reject(err)
				
				action = 'compare'
				statc = value
				if(fromHttp && !options.force){
					return f(null, statc)
				}
				else if(fromHttp && options.force){
					return f(null, {
						mtime: new Date()
					})
				}

				if(options.force){
					return f(null, {
						mtime: new Date()
					})
				}
				return getstat(file, f)
			}

			else if (action == "compare") {
				if (err)
					if(!source)
						return reject(err)
					else 
						stat= {mtime:new Date(options.mtime)}

				stat = value
				if(stat.mtime.getTime() > statc.mtime.getTime()){
					action= "compile"
					return f()
				}
				else{

					if(options.ignoreonunchanged){
						if(!ucached || ucached.time < stat.mtime.getTime()){
							action = "json"
							return fs.readFile(cached2, 'utf8', f)
						}

						return resolve(null)
					}

					
					// good, return the cached
					action= "json"
					return fs.readFile(cached2, 'utf8', f)

				}
			}
			else if (action == "json") {
				if (err) {
					return reject(err)
				}
				try{
					json= JSON.parse(value)
				}catch(e){
					action= "compile"
					return f(null)
				}
				return resolve(json)
			}
			else if(action == "compile"){
				if (err) {
					return reject(err)
				}

				action= "transpile"
				if(source){
					return f(null, source)
				}else{
					
					if(fromHttp){
						if (!process.env.DISABLE_COMPILATION_INFO) {
							if(!file.startsWith("npm"))
								console.info("Downloading: " + file + " ...")
						}
						
						value=  readRemote(file)
						if(value.then){
							
							return value.then(function (value) {
								return f(null, value)
							}).catch(reject)
						}
						else{
							return f(null, value)
						}
					}
					return readfile(file, f)
				}
			}
			else if (action == "transpile") {
				if (err) {
					return reject(err)
				}
				if(!process.env.DISABLE_COMPILATION_INFO){
					if(!file.startsWith("npm"))
						console.info("Compiling file: " + file)
				}
				
				if(value.redirect){		
					// forget this and compile other URL
					return resolve(value)
				}
				else if(value.type){
					if(value.name)
						basename= value.name 
					isjson= value.type.startsWith("application/json")
					value= value.code 
				}
				else{
					isjson= file.endsWith(".json")
				}

				if(isjson){
					json={
						code: "module.exports= " + value
					}
				}
				else{
					
					if(vfile && vfile.transpiled){						
						
						options.transpile= false
					}
				 

					json= transpile(file, basename, value, options)
				}
				str= JSON.stringify(json,null,'\t')
				action= "writecache"
				fs.writeFile(cached2, str, f)
			}
			else if (action == "writecache") {
				if(err){
					return reject(err)
				}
				// good return result 
				return resolve(json)
			}
			return f()
		}
		f= function(err, data){
			try{
				ug(err,data)
			}catch(e){
				
				return reject(e)
			}
		}
		f()
	})
	return promise 
}



module.exports= Mod
Object.defineProperty(Mod,'Module',{
	enumerable:false,
	value: Mod 
})