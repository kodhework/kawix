#!/usr/bin/env node

var Os= require('os')
var Path= require('path')
var fs= require('fs')
var Zlib= require('zlib')
var home= Os.homedir()

var corefolder= "stdlib.0.4.5"
var coredefault= Path.join(home, "Kawix", "dhs")
var corevdefault= Path.join(home, "Kawix", "dhs", "verification.file")
var verification= Path.join(home, "Kawix", corefolder,  "dhs", "verification.file")
var out, installed

main()

function _export(out){
	module.exports = {
		filename: out ,
		dirname: Path.dirname(out)
	}
}

function main(){
	
	/* this is commented, because the idea is load specific version

	if(fs.existsSync(corevdefault)){
		installed= fs.readFileSync(corevdefault,'utf8')
		if(installed >= "0.4.5"){
			out= Path.join(home,"Kawix", "dhs")
			out= Path.join(out,"mod")
			_export(out)
			return 
		}
	}*/


	if(fs.existsSync(verification)){
		out= Path.join(home,"Kawix", corefolder, "dhs")
		out= Path.join(out,"mod")
		_export(out)
		return 
	}

	out= Path.join(home, "Kawix")
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}

	out= Path.join(out, corefolder)
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}

	out= Path.join(out, "dhs")
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}


	if(!fs.existsSync(Path.join(out,"dist"))) fs.mkdirSync(Path.join(out,"dist"))
if(!fs.existsSync(Path.join(out,"examples"))) fs.mkdirSync(Path.join(out,"examples"))
if(!fs.existsSync(Path.join(out,"examples/sites"))) fs.mkdirSync(Path.join(out,"examples/sites"))
if(!fs.existsSync(Path.join(out,"examples/sites/test.01"))) fs.mkdirSync(Path.join(out,"examples/sites/test.01"))
if(!fs.existsSync(Path.join(out,"examples/sites/test.02"))) fs.mkdirSync(Path.join(out,"examples/sites/test.02"))
if(!fs.existsSync(Path.join(out,"glob"))) fs.mkdirSync(Path.join(out,"glob"))
if(!fs.existsSync(Path.join(out,"loaders"))) fs.mkdirSync(Path.join(out,"loaders"))
if(!fs.existsSync(Path.join(out,"loaders/kivi"))) fs.mkdirSync(Path.join(out,"loaders/kivi"))
if(!fs.existsSync(Path.join(out,"loaders/kwa"))) fs.mkdirSync(Path.join(out,"loaders/kwa"))
if(!fs.existsSync(Path.join(out,"loaders/pug"))) fs.mkdirSync(Path.join(out,"loaders/pug"))
if(!fs.existsSync(Path.join(out,"loaders/pug/test"))) fs.mkdirSync(Path.join(out,"loaders/pug/test"))
if(!fs.existsSync(Path.join(out,"loaders/sass"))) fs.mkdirSync(Path.join(out,"loaders/sass"))
if(!fs.existsSync(Path.join(out,"loaders/vue"))) fs.mkdirSync(Path.join(out,"loaders/vue"))
if(!fs.existsSync(Path.join(out,"loaders/vue/test"))) fs.mkdirSync(Path.join(out,"loaders/vue/test"))
if(!fs.existsSync(Path.join(out,"src"))) fs.mkdirSync(Path.join(out,"src"))
if(!fs.existsSync(Path.join(out,"src/channel"))) fs.mkdirSync(Path.join(out,"src/channel"))
if(!fs.existsSync(Path.join(out,"src/dynamic"))) fs.mkdirSync(Path.join(out,"src/dynamic"))
if(!fs.existsSync(Path.join(out,"src/lib"))) fs.mkdirSync(Path.join(out,"src/lib"))

	var files= ["README.md","examples/config.cson","examples/glob.js","examples/read.config.js","examples/sites/test.01/app.config.cson","examples/sites/test.02/app.config.cson","glob/bundle.js","glob/mod.js","loaders/kivi/register.js","loaders/kwa/register.js","loaders/pug/bundle.js","loaders/pug/register.js","loaders/pug/test/test.js","loaders/pug/test/test.pug","loaders/sass/bundle.js","loaders/sass/register.js","loaders/sass/runtime.js","loaders/vue/bundle.js","loaders/vue/register.js","loaders/vue/runtime.js","loaders/vue/server.renderer.js","loaders/vue/test/test.js","loaders/vue/test/test.vue","src/channel/ipc.coffee","src/config.coffee","src/config.ipc.coffee","src/default.clustered.cson","src/default.cson","src/dynamic/bundle.coffee","src/exception.coffee","src/lib/_fs.js","src/lib/_ipc.js","src/lib/_uniqid.js","src/mod.js","src/service.coffee","src/watcher.coffee","start.clustered.js","start.js","version.js"]
	var contents= contentData()

	var file, content
	for(var i=0;i<files.length;i++){
		file= files[i]
		content= contents[i]
		content= Buffer.from(content,'base64')
		content= Zlib.gunzipSync(content)
		fs.writeFileSync(Path.join(out, file), content)
	}
	fs.writeFileSync(verification, "0.4.5")


	/*
	// make a junction or symlink 
	if(fs.existsSync(coredefault)){
		fs.unlinkSync(coredefault)
	}
	if(Os.platform() == "win32")
		fs.symlinkSync(out, coredefault,"junction")
	else 
		fs.symlinkSync(out, coredefault)

	*/


	out= Path.join(out, "mod")
	_export(out)
}

function contentData(){
}
		