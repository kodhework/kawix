// Copyright 2019 Kodhe @kawix/std


var Id0  = 0
import Url from 'url'
import Exception from '../../util/exception'
import Path from 'path'
import {Deferred, sleep as _sleep} from '../../util/async'
import tar from '../../compression/tar'
import fs from '../../fs/mod'
import Os from 'os'

declare var kwcore : any;

if (typeof kwcore != "object" || !kwcore) {
	throw new Error("You need require @kawix/core")
}

var _checkFileExists= function(file: string) : Promise<boolean> {
	var def = new Deferred<boolean>()
	fs.access(file, fs.constants.F_OK, function(err : Error) {
		return def.resolve(err ? false : true)
	})
	return def.promise;
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
	var sym = cachedata.file + "-" + Path.basename(filename) + ".sym" 
	var ifolder = folder
	var creations =0 
	while(true){
		
		if(await _checkFileExists(ifolder)){
			try {
				await _removedir(ifolder)
				Id0++
			}
			catch(e){
				ifolder = folder + "." + (creations)
				creations++
			}
			
		}else{
			break 
		}
	}

	folder = ifolder 
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

	try{
		if(fs.existsSync(sym)){
			await fs.unlinkAsync(sym)
		}

		try {
			await fs.symlinkAsync(folder, sym, Os.platform() == "win32" ? "junction" : "dir")
			folder = sym
		} catch (e) {

		}
	}catch(e){
	}


	// tar uncompressed ...
	var source= {
		"code": `
		exports.kawixDynamic={
			time: 15000
		}
		exports.kawixPreload= async function(){
			try{
				module.exports= await KModule.import(${JSON.stringify(Path.join(folder,'mod'))})
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
