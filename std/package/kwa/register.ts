import {Runtime} from './runtime'
import fs from 'fs'

declare var kwcore : any;
if (typeof kwcore != "object" || !kwcore) {
	throw new Error("You need require @kawix/core")
}

var loader1 = function (filename, uri, options, helper) : Promise<any> {
	return Runtime._internal_execute(fs.createReadStream(filename),filename, uri, options, helper)	
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
