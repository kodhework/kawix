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

var _sleep= function(timeout){
	return new Promise(function(a,b){
		setTimeout(a,timeout)
	})
}

var _removedir = async function(path, retry = 0) {
	var e, file, files, i, len, stat, ufile;
	try {
		files = (await fs.readdirAsync(path));
		for (i = 0, len = files.length; i < len; i++) {
			file = files[i];
			ufile = Path.join(path, file);
			stat = (await fs.statAsync(ufile));
			if (stat.isDirectory()) {
				await _removedir(ufile);
			} else {
				await fs.unlinkAsync(ufile);
			}
		}
		return (await fs.rmdirAsync(path));
	} catch (error) {
		e = error;
		if (retry > 15) {
			throw e;
		}
		await _sleep(20);
		return (await _removedir(path, retry + 1));
	}
};


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
		try {
			await _removedir(folder)
		}
		catch(e){
			await fs.renameAsync(folder, folder + "." + Date.now().toString(32) + Id0)
		}
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
		exports.kawixDynamic={
			time: 15000
		}
		exports.kawixPreload= async function(){
			try{
				module.exports= await KModule.import(${JSON.stringify(Path.join(folder,'mod.js'))})
			}catch(e){
				if(e.message.indexOf("Cannot resolve") < 0) throw e
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
