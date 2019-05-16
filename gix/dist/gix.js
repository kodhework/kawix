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
		