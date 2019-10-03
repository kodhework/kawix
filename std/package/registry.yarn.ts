import NormalRegistry from './registry'
import fs from '../fs/mod'
import Path from 'path'
import Os from 'os'
import crypto from 'crypto'
import Semver from './semver'
import Child from 'child_process'
import * as async from '../util/async'
import Exception from '../util/exception'

export interface ModuleInfo{
    name: string,
    version: string,
    main?: string,
    folder?: string,
    packageJson?: PackageJsonInfo,
    dependencies?: ModuleInfo[]
}

export interface PackageJsonInfo{
    name?: string,
    version?: string, 
    dependencies?: any,
    main?: string
}

export class Registry{
    static cache = {}
    static checked = {}

    _packagesfolder: string 
    constructor(){}


    async _modulePath(module: string, version: string){
        var modtext = module + "@" + version 
        var home = Path.join(Os.homedir(), ".kawi")
        var packages = Path.join(home, "packages")
        if(!await fs.existsAsync(packages)){
            await fs.mkdirAsync(packages)
        }
        this._packagesfolder  = packages
        
        var md5 = crypto.createHash("md5").update(modtext).digest('hex') // + "-" + module.replace(/[\@\?]/g,'')
        var pack = Path.join(packages, md5)
        if (!await fs.existsAsync(pack)) {
            await fs.mkdirAsync(pack)
        }
        var jsonPack = Path.join(pack, "package.json")
        if(!await fs.existsAsync(jsonPack)){
            let content  = {
                name : 'test-0',
                dependencies: {}
            }
            content.dependencies[module] = version 
            await fs.writeFileAsync(jsonPack, JSON.stringify(content, null, '\t'))
        }
        return pack 
    }


    async getModuleInfoFromFolder(folder: string): Promise<ModuleInfo>{
        var pjson = Path.join(folder, "package.json")
        if(!await fs.existsAsync(pjson)){
            return null
        }
        
        var moduleinfo: ModuleInfo = {
            folder: '',
            main: '',
            name: '',
            version: '',
            packageJson: {},
            dependencies: []
        }
        moduleinfo.folder = folder
        moduleinfo.packageJson = require(pjson)
        moduleinfo.name = moduleinfo.packageJson.name 
        if (moduleinfo.packageJson.dependencies) {
            for (var id in moduleinfo.packageJson.dependencies) {
                moduleinfo.dependencies.push({
                    name: id,
                    version: moduleinfo.packageJson.dependencies[id]
                })
            }
        }
        moduleinfo.version = moduleinfo.packageJson.version
        if (moduleinfo.packageJson.main) {
            moduleinfo.main = Path.join(moduleinfo.folder, moduleinfo.packageJson.main)
        } else {
            moduleinfo.main = Path.join(moduleinfo.folder, "index.js")
        }
        return moduleinfo
    }

    async getCacheFromFolder(folder: string, added?: ModuleInfo[]): Promise<ModuleInfo[]>{
        if(!added)
            added = []


        var files = await fs.readdirAsync(folder)
        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            let ufile = Path.join(folder, file)
            if (!file.startsWith(".")) {
                let stat = await fs.statAsync(ufile)
                if (stat.isDirectory()) {
                    if (file.startsWith("@")) {
                        await this.getCacheFromFolder(ufile, added)
                    } else {

                        let moduleinfo = await this.getModuleInfoFromFolder(ufile)
                        if (moduleinfo) {
                            if (!Registry.cache[moduleinfo.name]) {
                                Registry.cache[moduleinfo.name] = []
                            }
                            let search = Registry.cache[moduleinfo.name].filter(function (a) {
                                return a.version == moduleinfo.version
                            })
                            if (search.length == 0){
                                Registry.cache[moduleinfo.name].push(moduleinfo)
                                added.push(moduleinfo)
                            }
                        }

                        let nodemods = Path.join(ufile, "node_modules")
                        if(await fs.existsAsync(nodemods)){
                            await this.getCacheFromFolder(ufile, added)
                        }

                    }
                }
            }
        }
        return added   
    }

    async require(module, version?: string): Promise<any>{
        var moduleinfo = await this.resolve(module, version)
        if(moduleinfo){
            return require(moduleinfo.main)
        }else{
            throw Exception.create("Failed getting module: " + module + (version ? "@" + version : ""))
        }
    }

    async resolve(module, version?:string) : Promise<ModuleInfo>{
        if(!version){
            // extract from module 
            let i= module.lastIndexOf("@")
            if(i > 0){
                version = module.substring(i+1)
                module = module.substring(0,i)
            }else{
                version = "latest"
            }
        }
        var cache = [].concat(Registry.cache[module] || [])
        if(cache.length){
            cache.sort(function(a,b){
                return a.version > b.version ? -1 : (a.version < b.version ? 1 :0)
            })
            for(let i=0;i<cache.length;i++){
                let mod = cache[i]
                if(mod.version == version)
                    return mod 
                
                
                if(Semver.satisfies(mod.version, version))
                    return mod 
            }
        }


        // execute yarn
        var out = await this._modulePath(module, version)
        var verif = Path.join(out, "__kwcore_verification")
        if(await fs.existsAsync(verif)){
            if(!Registry.checked[Path.join(out, "node_modules")]){
                await this.getCacheFromFolder(Path.join(out, "node_modules"))
            }
            return await this.getModuleInfoFromFolder(Path.join(out, "node_modules", module))
        }


        var reg = new NormalRegistry({})
        var moduledesc= await reg.resolve("yarn", "1.17.3")
        var bin = Path.join(moduledesc.folder, "bin/yarn.js")
        var p = Child.spawn(process.execPath, [bin, "install", "--mutex", "file:" + Path.join(this._packagesfolder, "lock")], {
            env: Object.assign({}, process.env, {
                NODE_REQUIRE: "1",
                ELECTRON_RUN_AS_NODE: "1"
            }),
            cwd: out
        })

        var def = new async.Deferred<void>()
        var err = []
        var received = function(data){
            process.stdout.write(data)
            var str = data.toString()
            if(str.startsWith("error:")){
                err.push(str)
            }
        }

        p.stdout.on("data", received)
        p.stderr.on("data", received)
        p.on("error", def.reject)
        p.on("exit", def.resolve)
        await def.promise 


        if(err.length){
            throw Exception.create("Failed to install packages: "  + err.join(" ")).putCode("INSTALL_FAILED")
        }


        try{
            // get all cache 
            var mods = Path.join(out, "node_modules")
            if(!fs.existsSync(mods))
                throw Exception.create("Yarn install nothing").putCode("INSTALL_FAILED")
            await this.getCacheFromFolder(mods)
        }catch(e){
            throw Exception.create("Failed to install packages: " + e.message).putCode("INSTALL_FAILED")
        }

        await fs.writeFileAsync(verif, Date.now().toString())
        return await this.getModuleInfoFromFolder(Path.join(out, "node_modules", module))
    }
}


export default Registry