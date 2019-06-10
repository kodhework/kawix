#!/usr/bin/env node

var Os= require('os')
var Path= require('path')
var fs= require('fs')
var Zlib= require('zlib')
var home= Os.homedir()

var corefolder= "stdlib.0.4.5"
var coredefault= Path.join(home, "Kawix", "std")
var corevdefault= Path.join(home, "Kawix", "std", "verification.file")
var verification= Path.join(home, "Kawix", corefolder,  "std", "verification.file")
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
			out= Path.join(home,"Kawix", "std")
			out= Path.join(out,"mod")
			_export(out)
			return 
		}
	}*/


	if(fs.existsSync(verification)){
		out= Path.join(home,"Kawix", corefolder, "std")
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

	out= Path.join(out, "std")
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}


	if(!fs.existsSync(Path.join(out,"coffeescript"))) fs.mkdirSync(Path.join(out,"coffeescript"))
if(!fs.existsSync(Path.join(out,"coffeescript/cson"))) fs.mkdirSync(Path.join(out,"coffeescript/cson"))
if(!fs.existsSync(Path.join(out,"compression"))) fs.mkdirSync(Path.join(out,"compression"))
if(!fs.existsSync(Path.join(out,"compression/example"))) fs.mkdirSync(Path.join(out,"compression/example"))
if(!fs.existsSync(Path.join(out,"compression/example/bin"))) fs.mkdirSync(Path.join(out,"compression/example/bin"))
if(!fs.existsSync(Path.join(out,"compression/tar"))) fs.mkdirSync(Path.join(out,"compression/tar"))
if(!fs.existsSync(Path.join(out,"dist"))) fs.mkdirSync(Path.join(out,"dist"))
if(!fs.existsSync(Path.join(out,"fs"))) fs.mkdirSync(Path.join(out,"fs"))
if(!fs.existsSync(Path.join(out,"http"))) fs.mkdirSync(Path.join(out,"http"))
if(!fs.existsSync(Path.join(out,"http/benchmark"))) fs.mkdirSync(Path.join(out,"http/benchmark"))
if(!fs.existsSync(Path.join(out,"http/example"))) fs.mkdirSync(Path.join(out,"http/example"))
if(!fs.existsSync(Path.join(out,"http/fast-json-stringify"))) fs.mkdirSync(Path.join(out,"http/fast-json-stringify"))
if(!fs.existsSync(Path.join(out,"http/fastify"))) fs.mkdirSync(Path.join(out,"http/fastify"))
if(!fs.existsSync(Path.join(out,"http/find-my-way"))) fs.mkdirSync(Path.join(out,"http/find-my-way"))
if(!fs.existsSync(Path.join(out,"http/serve-static"))) fs.mkdirSync(Path.join(out,"http/serve-static"))
if(!fs.existsSync(Path.join(out,"install"))) fs.mkdirSync(Path.join(out,"install"))
if(!fs.existsSync(Path.join(out,"ipc"))) fs.mkdirSync(Path.join(out,"ipc"))
if(!fs.existsSync(Path.join(out,"package"))) fs.mkdirSync(Path.join(out,"package"))
if(!fs.existsSync(Path.join(out,"package/kwa"))) fs.mkdirSync(Path.join(out,"package/kwa"))
if(!fs.existsSync(Path.join(out,"package/production"))) fs.mkdirSync(Path.join(out,"package/production"))
if(!fs.existsSync(Path.join(out,"package/semver"))) fs.mkdirSync(Path.join(out,"package/semver"))
if(!fs.existsSync(Path.join(out,"util"))) fs.mkdirSync(Path.join(out,"util"))
if(!fs.existsSync(Path.join(out,"util/background"))) fs.mkdirSync(Path.join(out,"util/background"))
if(!fs.existsSync(Path.join(out,"util/crypto"))) fs.mkdirSync(Path.join(out,"util/crypto"))
if(!fs.existsSync(Path.join(out,"util/uniqid"))) fs.mkdirSync(Path.join(out,"util/uniqid"))

	var files= [".gitignore","README.md","coffeescript/bundle.js","coffeescript/cson/bundle.js","coffeescript/cson/example.cson","coffeescript/cson/register.js","coffeescript/cson/runtime.js","coffeescript/cson/test.js","coffeescript/example.coffee","coffeescript/register.js","coffeescript/runtime.js","coffeescript/test.js","compression/example/bin/basic-tar.js","compression/example/tar.js","compression/tar/.gitignore","compression/tar/README.md","compression/tar/_bundle.js","compression/tar/package-lock.json","compression/tar/package.json","compression/tar.js","core.generate.js","fs/example.js","fs/mod.js","http/.gitignore","http/benchmark/express.js","http/benchmark/fastify.js","http/benchmark/kawix.http.js","http/example/server.js","http/fast-json-stringify/bundle.js","http/fast-json-stringify/mod.js","http/fastify/bundle.js","http/fastify/mod.js","http/find-my-way/bundle.js","http/find-my-way/mod.js","http/mod.js","http/reply.js","http/router.js","http/serializer.js","http/serve-static/bundle.js","http/serve-static/mod.js","http/server.js","http/static.js","install/KawixCore.tar.gz","install/kwcore","install/kwcore.install.js","install/linux.sh","install/mac.sh","ipc/channel.coffee","ipc/channel.js","package/bundle.js","package/kwa/generate.coffee","package/kwa/generate.js","package/kwa/installer.cli.coffee","package/kwa/installer.cli.js","package/kwa/installer.coffee","package/kwa/installer.js","package/kwa/register.js","package/production/compiler.js","package/registry.coffee","package/registry.js","package/semver/.gitignore","package/semver/README.md","package/semver/bundle.js","package/semver/mod.js","package/semver.js","package.json","std.generate.js","util/background/pty.node.coffee","util/background/start.hidden.coffee","util/background/start.hidden.js","util/crypto/appendIv.js","util/crypto/cipherKey.js","util/crypto/mod.js","util/example.js","util/exception.js","util/promisify.js","util/uniqid/bundle.js","util/uniqid/mod.js","util/uniqid.js"]
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
		