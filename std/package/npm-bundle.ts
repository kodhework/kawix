import Registry from './registry'
import { Readable } from 'stream'
import { Deferred } from '../util/async'
import tar from '../compression/tar'
import fs from '../fs/mod'
export class Bundler{
    public name: string 
    private _content: Array<string>=[]

    secureName(module:string):string{
        var transform = {
            "<": "_lt",
            ">": "_gt",
            "|": "_b",
            "/": "%2F",
            "?": "_q",
            "*": "_all_"
        };
        return module.replace(/\*|\>|\<|\||\/|\?/g, function (a, b) {
            return transform[a];
        })
    }


    async generateCode(file?: string){
        var content = `

export var kawixPreload = async function(){
    await import('https://kwx.kodhe.com/x/v/0.5.4/std/package/kwa/register')
    var preloads = [
        ${this._content.join(",\n")}
    ]
    for(var i=0;i<preloads.length;i++){
        await preloads[i]()
    }
}
        `

        if(file){
            await fs.writeFileAsync(file, content)
        }
        return content 
    }

    async addNodeNPMDependency(module: string, native: boolean) {

        var reg = new Registry({
            nativeEnabled: true
        })
        var moduleinfo = await reg.resolve(module)

        // create a kwa file
        var modulex = this.secureName(module)
        var readStream: Readable = tar.c({
            gzip: true,
            C: moduleinfo.folder
        },['.'])
        var buffer: any = []
        var def = new Deferred<void>()
        readStream.on("data", function (bytes) {
            buffer.push(bytes)
        })
        readStream.on("end", def.resolve)
        readStream.on("error", def.reject)

        await def.promise
        buffer = Buffer.concat(buffer)

        var modparts = module.split("@")
        var modname = modparts.slice(0, Math.max(modparts.length-1, 1)).join("/")

        var content = `
		
		async function(){
			var _fs = require('fs')
			var _os = require('os')
			var Path = require('path')

			var kawi = Path.join(_os.homedir(), '.kawi')
			if(!_fs.existsSync(kawi)){
				_fs.mkdirSync(kawi)
			}
			kawi = Path.join(kawi, ${JSON.stringify(this.name)})
			if(!_fs.existsSync(kawi)){
				_fs.mkdirSync(kawi)
			}

            // MODULE 
            var mod = Path.join(kawi, ${JSON.stringify(modulex + ".kwa")})
            if(!_fs.existsSync(mod)){
                var content = Buffer.from(${JSON.stringify(buffer.toString('base64'))}, 'base64')
				_fs.writeFileSync(mod, content)
			}
            

            var Mod = await import(mod)
            var modulefolder = Mod['kawix.app'].resolved
            var rmod = kawix.KModule._npmcache[${JSON.stringify(module)}] = {
                folder: modulefolder ,
                name: ${JSON.stringify(modname)},
                main: ''
            }

            var pack = require(Path.join(modulefolder, "package.json"))
            if(pack.main){
                rmod.main = pack.main 
            }else{
                rmod.main = "index"
            }
            rmod.main = Path.join(modulefolder, rmod.main)

		}
		
        `
        
        this._content.push(content)
    }

}