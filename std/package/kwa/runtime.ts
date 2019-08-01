import Path from 'path'
import fs from '../../fs/mod'
import * as async from '../../util/async'
import tar from '../../compression/tar'
import Exception from '../../util/exception'
import Os from 'os'
import { Readable } from 'stream'
import Url from 'url'

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

export class Runtime{


    static async execute(filename: string, stream?: Readable, options?: any) : Promise<any>{

        if(!stream){
            stream = fs.createReadStream(filename)
        }

        var helper = kawix.KModule.helper
        var uri = this.filenameToUrl(filename)
        return await this._internal_execute(stream, filename, uri, options, helper)
    }



    static async _internal_execute(stream: Readable, filename: string, uri, options, helper){

        var cachedata = await helper.getCachedData(filename, uri, options)
        if (cachedata.unchanged) {
            return null
        }
        if (cachedata.data) {
            return cachedata.data
        }

        var stat = cachedata.stats[1] || { mtimeMs: Date.now() }

        // decompress
        // .kwa is a compressed format
        var folder = cachedata.file + ".folder"
        var sym = cachedata.file + "-" + Path.basename(filename) + ".sym"
        var ifolder = folder
        var creations = 0
        while (true) {

            if (await fs.existsAsync(ifolder)) {
                try {
                    await _removedir(ifolder)
                    Id0++
                }
                catch (e) {
                    ifolder = folder + "." + (creations)
                    creations++
                }

            } else {
                break
            }
        }

        folder = ifolder
        await fs.mkdirAsync(folder)


        //if (!options.fromremote) {

            let def = new async.Deferred<void>()
            let stout= tar.x({
                C: folder
            })
            stream.pipe(stout)
            stream.on("error", def.reject)
            stout.on("error", def.reject)
            stout.on("finish", def.resolve)
            await def.promise

        /*}
        else {
            throw Exception.create("Not implemented").putCode("NOT_IMPLEMENTED")
        }*/

        try {
            if (fs.existsSync(sym)) {
                await fs.unlinkAsync(sym)
            }

            try {
                await fs.symlinkAsync(folder, sym, Os.platform() == "win32" ? "junction" : "dir")
                folder = sym
            } catch (e) {

            }
        } catch (e) {
        }


        // tar uncompressed ...
        var source = {
            "code": `
		
		exports.kawixPreload= async function(){
			try{
				module.exports= await KModule.import(${JSON.stringify(Path.join(folder, 'mod'))})
			}catch(e){
				if(e.message.indexOf("Cannot resolve") < 0) throw e
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
