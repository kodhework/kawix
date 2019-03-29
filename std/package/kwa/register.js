// Copyright 2019 Kodhe @kawix/std

// kwa es básicamente un .tar.gz
Id0  = 0
import Url from 'url'
import Exception from '../../util/exception'
import Path from 'path'
import tar from '../../compression/tar.js'
import fs from '../../fs/mod.js'


if (typeof kwcore != "object" || !kwcore) {
	throw new Error("You need require @kawix/core")
}

var deferred= function(){
	var def={}
	def.promise= new Promise(function(a,b){
		def.resolve= a
		def.reject = b
	})
	return def
}

var _checkFileExists= function(file) {
	var def;
	def = deferred()
	fs.access(file, fs.constants.F_OK, function(err) {
		return def.resolve(err ? false : true)
	})
	return def.promise;
}




var loader1 = async function (filename, uri, options, helper) {


	var cachedata= await helper.getCachedData(filename, uri, options)
	if(cachedata.unchanged){
		return null
	}
	if(cachedata.data){
		return cachedata.data
	}

	var stat= cachedata.stats[1] || {mtimeMs: Date.now()}

	// decompress
	// .kwa is a compressed format
	var folder= cachedata.file + ".folder"
	if(await _checkFileExists(folder)){
		await fs.renameAsync(folder, folder + "." + Date.now().toString(32) + Id0)
		Id0++
	}
	await fs.mkdirAsync(folder)


	if(!options.fromremote){
		await tar.x({
			C: folder,
			file: filename
		})
	}
	else{
		throw Exception.create("Not implemented").putCode("NOT_IMPLEMENTED")
	}


	// tar uncompressed ...
	var source= {
		"code": `
		exports.kawixPreload= async function(){
			try{
				module.exports= await KModule.import("${Path.join(folder,'mod.js')}")
			}catch(e){
				if(e.message.indexOf("cannot resolve") < 0) throw e
			}
			module.exports["kawix.app"]= {
				original: ${JSON.stringify(filename)},
				resolved: ${JSON.stringify(folder)}
			}
		}
		`
	}
	options.language= "javascript"
	return await helper.compile(filename, filename + ".js", source, options, cachedata)
}



var register1 = function () {
	var extensions = kwcore.KModule.Module.extensionLoaders
	var languages = kwcore.KModule.Module.languages
	if (!extensions[".kwa"]) {
		extensions[".kwa"] = loader1
	}
	if (!languages["kawix.app"]) {
		languages["kawix.app"] = ".kwa"
	}
}

register1()
export default register1
export var register = register1
export var loader = loader1
