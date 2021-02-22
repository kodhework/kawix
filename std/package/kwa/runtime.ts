import Path from 'path'
import fs from '../../fs/mod'
import * as async from '../../util/async'
import tar from '../../compression/tar'
import Exception from '../../util/exception'
import Os from 'os'
import {
	Readable
} from 'stream'
import Url from 'url'
import {
	Unarchiver
} from '../../compression/kzt/Unarchiver'



var Id0 = 0
declare var kawix
var _removedir = async function (path, retry = 0) {
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
		await async.sleep(20)
		return (await _removedir(path, retry + 1));
	}
}

export class Runtime {


	static async execute(filename: string, stream ? : Readable, options ? : any): Promise < any > {

		if (!stream) {
			stream = fs.createReadStream(filename)
		}

		var helper = kawix.KModule.helper
		var uri = this.filenameToUrl(filename)
		return await this._internal_execute(stream, filename, uri, options, helper)
	}



	static async _internal_execute(stream: Readable, filename: string, uri, options, helper) {
		var cachedata = await helper.getCachedData(filename, uri, options)
		if (cachedata.unchanged) {
			return null
		}
		if (cachedata.data) {
			return cachedata.data
		}
		var stat = cachedata.stats[1] || {
			mtimeMs: Date.now()
		}

		// decompress
		// .kwa is a compressed format
		var folder = cachedata.file + ".pkg"
		if (!fs.existsSync(folder)) {
			fs.mkdirSync(folder)
		}

		var origin = Path.join(folder, "origin")
		if (!fs.existsSync(origin)) {
			await fs.writeFileAsync(origin, filename)
		}


		/*
		var creations = 0
		var sym = Path.join(folder, Path.basename(filename).substring(0, 60))
		var ifolder = Path.join(folder, creations.toString())


		// TRY REMOVE OLD FOLDERS?
		// maybe add this later
		let toremove = []
		while (true) {
			if (await fs.existsAsync(ifolder)) {
				toremove.push(ifolder)
				creations++
				ifolder = Path.join(folder, creations.toString())
			} else {
				break
			}
		}*/


		var sym = Path.join(folder, "S-" + Path.basename(filename).substring(0, 60))
		if(!sym.endsWith(".kwa")) sym += ".kwa"
		let files = await fs.readdirAsync(folder)
		files = files.filter((a)=> (!a.endsWith(".kwa")) && /^\d/.test(a))
		files.sort(function(a,b){
			let c = Number(a)
			let d = Number(b)
			return c - d 
		})
    	let lastfile = Number(files.pop() || 0)
    	let toremove = files.map((a)=> Path.join(folder,a))
		let ifolder = Path.join(folder, (lastfile+1).toString())




		folder = ifolder
		await fs.mkdirAsync(folder)

		//if (!options.fromremote) {
		if (options.compression == "kzt") {

			let unarchiver
			try {
				unarchiver = await Unarchiver.fromStream(stream)
				await unarchiver.extractAllTo(folder)
			} catch (e) {
				throw e
			} finally {
				if (unarchiver) await unarchiver.dispose()
			}

		} else {
			let def = new async.Deferred < void > ()
			let stout = tar.x({
				C: folder
			})
			stream.pipe(stout)
			stream.on("error", def.reject)
			stout.on("error", def.reject)
			stout.on("finish", def.resolve)
			await def.promise
		}
		/*}
		else {
				throw Exception.create("Not implemented").putCode("NOT_IMPLEMENTED")
		}*/

		
		try {
			// remove async and put sync functions
			// to avoid some sync problems
			if (fs.existsSync(sym)) {
				fs.unlinkSync(sym)
			}
			try {
				fs.symlinkSync(folder, sym, Os.platform() == "win32" ? "junction" : "dir")
				//folder = sym
			} catch (e) {}
		} catch (e) {}


		// DELETE PREVIOUS, NOT USED ANYMORE FOLDERS, except first
		setTimeout(async function(){
			if (toremove.length) {
				for (let i = 0; i < toremove.length; i++) {
					try {
						await _removedir(toremove[i])
					} catch (e) {}
				}
			}
		}, 500)
		


		// tar uncompressed ...
		var source = {
			"code": `
		var fs= require('fs')
		exports.kawixPreload= async function(){
						if(!fs.existsSync(${JSON.stringify(Path.join(folder))}))
								throw new Error('Cannot load this module. Empty or invalid content')
			try{
				module.exports= await KModule.import(${JSON.stringify(Path.join(folder, 'mod'))})
			}catch(e){

								if(e.message.indexOf("Cannot resolve") < 0){throw e}
								else {
										let files = fs.readdirSync(${JSON.stringify(Path.join(folder))})
										if(files.length == 0)
												throw e
								}
						}
						module.exports.kawixDynamic={
								time: 10000
						}
			module.exports["kawix.app"]= {
				original: ${JSON.stringify(filename)},
				resolved: ${JSON.stringify(folder)}
			}
		}
		`
		}
		options.language = "javascript"
		return await helper.compile(filename, filename + ".js", source, options, cachedata)

	}


	static filenameToUrl(file) {
		var uri: any = Url.parse(file)
		if (Os.platform() == "win32") {
			if (file[1] == ":")
				uri = Url.pathToFileURL(file)
		}
		if (uri.protocol) {
			if (uri.protocol != "http:" && uri.protocol != "npm:" && uri.protocol != "npmi:" && uri.protocol != "https:" && uri.protocol != "file:") {
				throw new Error("Protocol " + uri.protocol + " not supported")
			}
		}
		return uri
	}


}
export default Runtime