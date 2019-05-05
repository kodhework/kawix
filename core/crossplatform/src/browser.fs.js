var Buffer = global.___kmodule___basic.mod["buffer"].Buffer
var Path = require("path")
var fs = function(Mod){
	var f= {
		constants: {
			F_OK: 0
		},
		access: function (file, c, callback) {
			file = Path.normalize(file)
			var vfile = Mod._virtualfile[file]
			if (vfile) {
				return callback(null, true)
			} else {
				var er = new Error("File not found: " + file)
				er.code = 'ENOENT'
				return callback(er)
			}
		},

		existsSync: function (file) {
			file = Path.normalize(file)
			var vfile = Mod._virtualfile[file]
			if (!vfile) {
				return false
			}
			return true
		},

		accessSync: function(file){
			file = Path.normalize(file)
			var vfile = Mod._virtualfile[file]
			if(!vfile){
				var er = new Error("File not found: " + file)
				er.code = 'ENOENT'
				throw er
			}
			return true 
		},

		stat: function (file, callback) {
			try {
				var stat= this.statSync(path)
				callback(null, stat)
			} catch (e) {
				callback(e)
			}
		},

		statSync: function (file) {
			file = Path.normalize(file)
			var vfile = Mod._virtualfile[file]
			if (vfile) {
				if (typeof vfile == "function")
					vfile = vfile()
				return vfile.stat
			} else {
				var er = new Error("File not found: " + file)
				er.code = 'ENOENT'
				throw er 
			}
		},

		mkdir: function(path,callback){
			try{
				this.mkdirSync(path)
				callback(null,true)
			}catch(e){
				callback(e)
			}
		},
		mkdirSync: function(path){
			var vfile = Mod._virtualfile[path]
			if (!vfile) {
				vfile = {
					stat: {
						mtime: new Date,
						atime: new Date,
						isdirectory: true,
						mtimeMs: Date.now(),
						atimeMs: Date.now()
					}
				}
				Mod._virtualfile[path]= vfile 
			}else{
				throw new Error("File exists: " + path)
			}
		},

		writeFile: function (file, content,encoding, callback) {
			if (typeof encoding == "function") {
				callback = encoding
				encoding = undefined
			}
			
			try {
				this.writeFileSync(file, content)
				return callback(null)
			} catch (e) {
				callback(e)
			}
		},
		writeFileSync: function (file, content, encoding) {
			var vfile = Mod._virtualfile[file]
			if (!vfile) {
				vfile = {
					stat: {
						mtime: new Date,
						atime: new Date,
						isfile: true,
						mtimeMs: Date.now(),
						atimeMs: Date.now()
					}
				}
			}
			if (typeof vfile == "function") {
				vfile = vfile()
			}
			if (!Buffer.isBuffer(content))
				vfile.content = Buffer.from(content, encoding || 'utf8')
			else
				vfile.content = content
		},
		readFile: function (file, encoding, callback) {
			if (typeof encoding == "function") {
				callback = encoding
				encoding = undefined
			}
			try {
				var content = this.readFileSync(file, encoding)
				return callback(null, content)
			} catch (e) {
				callback(e)
			}
		},
		readFileSync: function (file, encoding) {
			

			var vfile= Mod._virtualfile[file]
			if(!vfile){
				var er = new Error("File not found: " + file)
				er.code = 'ENOENT'
				return callback(er)
			}
			if(typeof vfile == "function")
				vfile=vfile() 
			
			var content= vfile.content
			if(!Buffer.isBuffer(content)) content= Buffer.from(content)

			if(encoding){
				return content.toString(encoding)
			}else{
				return content
			}

		}
	}
	f.create = function (Mod) {
		return module.exports = fs(Mod)
	}
	if (!global.___kmodule___basic.mod.fs){
		global.___kmodule___basic.mod.fs= f 
		global.___kmodule___basic.mod.builtInModules.push("fs")
	}
	return f
}
fs.create = function (Mod) {
	return module.exports = fs(Mod)
}
module.exports= fs 
