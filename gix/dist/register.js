#!/usr/bin/env node
var Os= require('os')
var Path= require('path')
var fs= require('fs')
var Zlib= require('zlib')
var home= Os.homedir()

var corefolder= "Library.0.9.0"
var coredefault= Path.join(home, "Kawix", "gix")
var corevdefault= Path.join(home, "Kawix", "gix", "verification.file")
var verification= Path.join(home, "Kawix", corefolder,  "gix", "verification.file")
var out, installed

kawix.KModule.addVirtualFile("@kawix/gix", {
	redirect: Path.join(home, "Kawix", corefolder,  "gix"),
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
			out= Path.join(home,"Kawix", "gix")
			out= Path.join(out,"mod")
			_export(out)
			return
		}
	}*/


	if(fs.existsSync(verification)){
		out= Path.join(home,"Kawix", corefolder, "gix")
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

	out= Path.join(out, "gix")
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}


	if(!fs.existsSync(Path.join(out,"dist"))) fs.mkdirSync(Path.join(out,"dist"))
if(!fs.existsSync(Path.join(out,"html"))) fs.mkdirSync(Path.join(out,"html"))
if(!fs.existsSync(Path.join(out,"src"))) fs.mkdirSync(Path.join(out,"src"))
if(!fs.existsSync(Path.join(out,"src/lib"))) fs.mkdirSync(Path.join(out,"src/lib"))
if(!fs.existsSync(Path.join(out,"test"))) fs.mkdirSync(Path.join(out,"test"))

	var files= ["README.md","base_import.ts","bundle-electron-download.ts","bundle-extract-zip.ts","electron-download.js","electron-install.ts","extract-zip.js","html/hello.world.html","mod.ts","package.json","src/_electron_boot.js","src/electron.ts","src/exception.ts","src/gui.ts","src/ipc.ts","src/lib/_fs.ts","src/lib/_ipc.ts","src/lib/_registry.ts","src/lib/_uniqid.ts","src/mod.ts","src/start.electron.ts","src/start.ts","src/ui.install.ts"]
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
		