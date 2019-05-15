#!/usr/bin/env node

var Os= require('os')
var Path= require('path')
var fs= require('fs')
var Zlib= require('zlib')
var home= Os.homedir()

var corefolder= "stdlib.0.4.0"
var coredefault= Path.join(home, "Kawix", "gix")
var corevdefault= Path.join(home, "Kawix", "gix", "verification.file")
var verification= Path.join(home, "Kawix", corefolder,  "gix", "verification.file")
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
		if(installed >= "0.4.0"){
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

	var files= ["README.md","html/hello.world.html","mod.js","src/_electron_boot.js","src/exception.coffee","src/gui.coffee","src/ipc.coffee","src/lib/_fs.js","src/lib/_ipc.js","src/lib/_registry.js","src/lib/_uniqid.js","src/mod.js","src/start.js"]
	var contents= contentData()

	var file, content
	for(var i=0;i<files.length;i++){
		file= files[i]
		content= contents[i]
		content= Buffer.from(content,'base64')
		content= Zlib.gunzipSync(content)
		fs.writeFileSync(Path.join(out, file), content)
	}
	fs.writeFileSync(verification, "0.4.0")


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
	return ["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","H4sIAAAAAAAAA8vMLcgvKlFISU1TSCvKz1VQ19PTh6DikhT9tGL93PwUvaxida7UCpjCxNIcMA0T0sKvEwArrs5XYgAAAA==","H4sIAAAAAAAAA8vMLcgvKlFISU1TSCvKz1VQ19PTh6DikhT9zIJk/eSMxLy81By9rGJ1rtQKmOrE0hwwDRPSIkI7AKX2kC9sAAAA","H4sIAAAAAAAAA8vMLcgvKlFISU1TSCvKz1VQ19PTh6DikhT9gsTk7MT0VP2i1PTM4pKiSr2sYnWu1AqYlsTSHDANE9Ii1gwAwYI8xnYAAAA=","H4sIAAAAAAAAA8vMLcgvKlFISU1TSCvKz1VQ19PTh6DikhT90pLMHP3SvMzCzBT93PwUvaxida7UCpiOxNIcMA0T0iLSCACRMpHodAAAAA==","H4sIAAAAAAAAA4WMMQ6AIAwAd17RjY2+CUsxNUJJ2/9H3XQyufHuEIFn3U4G0t6ZnUxWQJ0NyHUmGUstIJeCNx4N3x4a7+LBVg7Pf+7z+wYpXSGNuMF/AAAA","H4sIAAAAAAAAAzXMQQqDMBQE0LU5xceNCkVP0JVIEURFvUAaf0pKzJck1pbSu9cUuhp4M0xRABp+1QiCpER0wqrVn4QjA25bV7KeqSUEJHmx0JzfXfKXui9BWlpCpVaRMIbPXzGj5Jv2wN3LCJCbEV6RSdWcvVn04BaO9RkM7uEiMIv4zpUPnmvlPJr0MEHGkcZc0y2Nq6Yqp6FroR+6shpHaOpxqtq6vcQZ+3wBoEOup8gAAAA="]
}
		