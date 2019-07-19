import { Runtime } from './runtime'
import fs from 'fs'
import { Readable } from 'stream';
import http from 'http'
import https from 'https'
import * as async from '../../util/async'
import Url from 'url'
import crypto from 'crypto'
import Os from 'os'
import Path from 'path'
import uniqid from '../../util/uniqid'
var Https = {
	"http:": http,
	"https:": https
}

declare var kwcore: any;
if (typeof kwcore != "object" || !kwcore) {
	throw new Error("You need require @kawix/core")
}

var loader1 = async function (filename, uri, options, helper): Promise<any> {
	var stream: Readable
	var def = new async.Deferred<void>()
	if (Https[uri.protocol]) {

		var path = Path.join(Os.homedir(), ".kawi")
		if (!fs.existsSync(path))
			fs.mkdirSync(path)

		path = Path.join(path, "kwa.cache")
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path)
		}

		path = Path.join(path, crypto.createHash("md5").update(filename).digest('hex'))
		if(options.force){
			if(fs.existsSync(path)){
				fs.unlinkSync(path)
			}
		}
		if (!fs.existsSync(path)) {


			var httpinvoke = function (uri) {
				stream = Https[uri.protocol].get(uri, function (response) {
					//response.once("error", def.reject)
					try {
						if (response.headers.location) {
							let newuri = Url.parse(Url.resolve(uri.href, response.headers.location))
							return httpinvoke(newuri)
						} else {
							stream = response
							return def.resolve()
						}
					} catch (e) {
						return def.reject(e)
					}
				}).on("error", def.reject)
			}
			httpinvoke(uri)
			await def.promise

			// save as file 

			let path1 = path + "." + uniqid()
			try {
				let stout = fs.createWriteStream(path1)
				def = new async.Deferred<void>()
				stout.on("error", def.reject)
				stream.on("error", def.reject)
				stout.on("finish", def.resolve)
				stream.pipe(stout)
				await def.promise
			} catch (e) {
				if (fs.existsSync(path1))
					fs.unlinkSync(path1)
				throw e
			}

			fs.renameSync(path1, path)

		}
		stream = fs.createReadStream(path)

	} else {
		stream = fs.createReadStream(filename)
	}
	return await Runtime._internal_execute(stream, filename, uri, options, helper)
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
