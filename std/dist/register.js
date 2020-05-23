#!/usr/bin/env node
var Os= require('os')
var Path= require('path')
var fs= require('fs')
var Zlib= require('zlib')
var home= Os.homedir()

var corefolder= "Library.0.9.0"
var coredefault= Path.join(home, "Kawix", "std")
var corevdefault= Path.join(home, "Kawix", "std", "verification.file")
var verification= Path.join(home, "Kawix", corefolder,  "std", "verification.file")
var out, installed

kawix.KModule.addVirtualFile("@kawix/std", {
	redirect: Path.join(home, "Kawix", corefolder,  "std"),
	isdirectory: true
})

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
		if(installed >= "0.9.0"){
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
if(!fs.existsSync(Path.join(out,"compression/_tar"))) fs.mkdirSync(Path.join(out,"compression/_tar"))
if(!fs.existsSync(Path.join(out,"compression/example"))) fs.mkdirSync(Path.join(out,"compression/example"))
if(!fs.existsSync(Path.join(out,"compression/example/bin"))) fs.mkdirSync(Path.join(out,"compression/example/bin"))
if(!fs.existsSync(Path.join(out,"compression/kzt"))) fs.mkdirSync(Path.join(out,"compression/kzt"))
if(!fs.existsSync(Path.join(out,"dist"))) fs.mkdirSync(Path.join(out,"dist"))
if(!fs.existsSync(Path.join(out,"fs"))) fs.mkdirSync(Path.join(out,"fs"))
if(!fs.existsSync(Path.join(out,"http"))) fs.mkdirSync(Path.join(out,"http"))
if(!fs.existsSync(Path.join(out,"http/benchmark"))) fs.mkdirSync(Path.join(out,"http/benchmark"))
if(!fs.existsSync(Path.join(out,"http/example"))) fs.mkdirSync(Path.join(out,"http/example"))
if(!fs.existsSync(Path.join(out,"http/fast-json-stringify"))) fs.mkdirSync(Path.join(out,"http/fast-json-stringify"))
if(!fs.existsSync(Path.join(out,"http/find-my-way"))) fs.mkdirSync(Path.join(out,"http/find-my-way"))
if(!fs.existsSync(Path.join(out,"http/serve-static"))) fs.mkdirSync(Path.join(out,"http/serve-static"))
if(!fs.existsSync(Path.join(out,"install"))) fs.mkdirSync(Path.join(out,"install"))
if(!fs.existsSync(Path.join(out,"ipc"))) fs.mkdirSync(Path.join(out,"ipc"))
if(!fs.existsSync(Path.join(out,"ipc/__old"))) fs.mkdirSync(Path.join(out,"ipc/__old"))
if(!fs.existsSync(Path.join(out,"package"))) fs.mkdirSync(Path.join(out,"package"))
if(!fs.existsSync(Path.join(out,"package/_semver"))) fs.mkdirSync(Path.join(out,"package/_semver"))
if(!fs.existsSync(Path.join(out,"package/kwa"))) fs.mkdirSync(Path.join(out,"package/kwa"))
if(!fs.existsSync(Path.join(out,"package/production"))) fs.mkdirSync(Path.join(out,"package/production"))
if(!fs.existsSync(Path.join(out,"package/test"))) fs.mkdirSync(Path.join(out,"package/test"))
if(!fs.existsSync(Path.join(out,"rpa"))) fs.mkdirSync(Path.join(out,"rpa"))
if(!fs.existsSync(Path.join(out,"rpa/test"))) fs.mkdirSync(Path.join(out,"rpa/test"))
if(!fs.existsSync(Path.join(out,"util"))) fs.mkdirSync(Path.join(out,"util"))
if(!fs.existsSync(Path.join(out,"util/_uniqid"))) fs.mkdirSync(Path.join(out,"util/_uniqid"))
if(!fs.existsSync(Path.join(out,"util/background"))) fs.mkdirSync(Path.join(out,"util/background"))
if(!fs.existsSync(Path.join(out,"util/crypto"))) fs.mkdirSync(Path.join(out,"util/crypto"))

	var files= [".gitignore","README.md","coffeescript/bundle.ts","coffeescript/cson/bundle.ts","coffeescript/cson/example.cson","coffeescript/cson/register.ts","coffeescript/cson/runtime.js","coffeescript/cson/test.js","coffeescript/example.coffee","coffeescript/register.ts","coffeescript/runtime.js","coffeescript/test.js","compression/_tar/.gitignore","compression/_tar/_bundle.ts","compression/example/bin/basic-tar.js","compression/example/tar.js","compression/kzt/Archiver.ts","compression/kzt/Unarchiver.ts","compression/kzt/types.ts","compression/tar.js","fs/example.js","fs/mod.ts","http/.gitignore","http/benchmark/express.js","http/benchmark/fastify.js","http/benchmark/kawix.http.js","http/example/server.js","http/fast-json-stringify/bundle.ts","http/fast-json-stringify/mod.js","http/find-my-way/bundle.ts","http/find-my-way/mod.js","http/mod.ts","http/reply.ts","http/router.ts","http/serializer.ts","http/serve-static/bundle.ts","http/serve-static/mod.js","http/server.ts","http/static.js","http/static.ts","install/KawixCore.tar.gz","install/android.sh","install/kwcore","install/kwcore.install.js","install/linux.sh","install/mac.sh","intellisense.ts","ipc/__old/channel.coffee","ipc/channel.ts","package/_semver/bundle.ts","package/_semver/mod.js","package/bundle.ts","package/kwa/_installer.cli.ts","package/kwa/generate.ts","package/kwa/installer.cli.ts","package/kwa/installer.ts","package/kwa/kweb.ts","package/kwa/register.ts","package/kwa/runtime.ts","package/npm-bundle.ts","package/production/compiler.ts","package/registry.ts","package/registry.yarn.ts","package/semver.ts","package/test/.gitignore","package/test/kzst.ts","package/test/npm-bundle.ts","package.json","rpa/.gitignore","rpa/channel.handler.ts","rpa/channel.ts","rpa/test/client.remote.ts","rpa/test/client.ts","rpa/test/server.remote.ts","rpa/test/server.ts","util/_uniqid/bundle.js","util/_uniqid/mod.js","util/async.ts","util/background/pty.node.coffee","util/background/start.hidden.coffee","util/background/start.hidden.js","util/crypto/appendIv.js","util/crypto/cipherKey.js","util/crypto/mod.js","util/example.js","util/exception.ts","util/promisify.ts","util/uniqid.ts"]
	var contents= contentData()

	var file, content
	for(var i=0;i<files.length;i++){
		file= files[i]
		content= contents[i]
		content= Buffer.from(content,'base64')
		content= Zlib.gunzipSync(content)
		fs.writeFileSync(Path.join(out, file), content)
	}
	fs.writeFileSync(verification, "0.9.0")


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
		