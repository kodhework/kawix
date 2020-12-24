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

export interface ModName{
    name: string
    version?: string 
}

export class Registry{
    static cache = {}
    static checked = {}

    _packagesfolder: string 
    constructor(){}


    async $modulePath(modules: ModName[], uid?: string, force = false){
        if(!uid)
            uid = modules.map((a)=> a.name + "@" + (a.version||"latest")).join(",") 

        var home = Path.join(Os.homedir(), ".kawi")
        var packages = Path.join(home, "packages")
        if(!await fs.existsAsync(packages)){
            await fs.mkdirAsync(packages)
        }
        this._packagesfolder  = packages
        var md5 = crypto.createHash("md5").update(uid).digest('hex') // + "-" + module.replace(/[\@\?]/g,'')
        var pack = Path.join(packages, md5)
        if (!await fs.existsAsync(pack)) {
            await fs.mkdirAsync(pack)
        }
        var jsonPack = Path.join(pack, "package.json")
        if(force || (!await fs.existsAsync(jsonPack))){
            let content  = {
                name : 'test-0',
                dependencies: {}
            }
            for(let i=0;i<modules.length;i++){
                let mod = modules[i]
                content.dependencies[mod.name] = mod.version || "latest"
            }
            //content.dependencies[module] = version 
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

    async require(mod: ModName | ModName[] | string, versionOrUid?: string): Promise<any>{
        let info = await this.resolve(mod, versionOrUid)
        if(info instanceof Array){
            info = info[0]
        }
        if(info) return require(info.main)
        throw Exception.create("Failed getting module: " + String(mod) + " -- " + String(versionOrUid))
    }


    async resolve(mod: ModName | ModName[] | string, versionOrUid?: string): Promise<any>{


        let uid = ''
        let modname = (mod as ModName).name || (mod as string)
        let version = (mod as ModName).version || versionOrUid
        if(modname.indexOf("|")>=0){
            if(modname.indexOf(">") >= 0){
                let parts = modname.split(">")
                modname = parts[0]
                uid = parts[1]            
            }
        }
        mod = modname.split("|").map((a)=> {
            let i = a.lastIndexOf("@")
            return {
                name: a.substring(0, i),
                version: a.substring(i+1)
            }
        })
        if(!uid) uid = versionOrUid
        if(mod.length > 1){
            return await this.resolveMany(mod as ModName[], uid)
        }
        else{
            return await this.resolveSingle(mod[0])
        }

        
    }

    async $yarnBin(){
        var bin = ''
        bin = Path.join(Os.homedir(), ".kawi", "npm-inst", "yarn@1.22.10", "package.json")
        if(fs.existsSync(bin)){
            // this avoid need internet for check project
            bin = Path.join(Os.homedir(), ".kawi", "npm-inst", "yarn@1.22.10", "bin", "yarn.js")
        }else{
            var reg = new NormalRegistry({})
            var moduledesc= await reg.resolve("yarn", "1.22.10")
            bin = Path.join(moduledesc.folder, "bin/yarn.js")
        }
        return bin
    }

    async $yarnExecute(folder: string){
        let bin = await this.$yarnBin()
        var p = Child.spawn(process.execPath, [bin, "--mutex", "network"], {
            env: Object.assign({}, process.env, {
                NODE_REQUIRE: "1",
                ELECTRON_RUN_AS_NODE: "1"
            }),
            cwd: folder
        })

        var def = new async.Deferred<void>()
        var err = []
        var received = function(data){
            process.stdout.write(data)
            var str = data.toString()
            if(str.startsWith("ERR:")){
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


    }

    async resolveMany(modules: ModName[], uid?: string, force = false): Promise<ModuleInfo[]>{
        let text = modules.map((a)=> a.name + "@" + a.version).join(",")
        if(!uid)
            uid = text

        let ruid = uid + "." + text
        if(Registry.cache[ruid])
            return Registry.cache[ruid]

        var out = await this.$modulePath(modules, uid, force)
        var verif = Path.join(out, "__kwcore_verification")
        if(await fs.existsAsync(verif)){

            let content = await fs.readFileAsync(verif,'utf8')
            if(content.indexOf(text+".") < 0){
                await fs.unlinkAsync(verif)
                return await this.resolveMany(modules,uid, true)
            }

            let mods = []
            for(let i=0;i<modules.length;i++){
                let modInfo = await this.getModuleInfoFromFolder(Path.join(out, "node_modules", modules[i].name))
                mods.push(modInfo)
            }   
            return mods
        }
        await this.$yarnExecute(out)
        try{
            // get all cache 
            let modfolder = Path.join(out, "node_modules")
            if(!fs.existsSync(modfolder))
                throw Exception.create("Yarn install nothing").putCode("INSTALL_FAILED")
            //await this.getCacheFromFolder(mods)

        }catch(e){
            throw Exception.create("Failed to install packages: " + e.message).putCode("INSTALL_FAILED")
        }
        await fs.writeFileAsync(verif, text + "." + Date.now())
        
        let mods = []
        for(let i=0;i<modules.length;i++){
            let modInfo = await this.getModuleInfoFromFolder(Path.join(out, "node_modules", modules[i].name))
            mods.push(modInfo)
        }   

        Registry.cache[ruid] = mods 
        return mods 
    }

    async resolveSingle(module: ModName) : Promise<ModuleInfo>{
        
        var cache = [].concat(Registry.cache[module] || [])
        if(cache.length){
            cache.sort(function(a,b){
                return a.version > b.version ? -1 : (a.version < b.version ? 1 :0)
            })
            for(let i=0;i<cache.length;i++){
                let mod = cache[i]
                if(mod.version == module.version)
                    return mod                 
                if(Semver.satisfies(mod.version, module.version))
                    return mod 
            }
        }
        // execute yarn
        var out = await this.$modulePath([module])
        var verif = Path.join(out, "__kwcore_verification")
        if(await fs.existsAsync(verif)){
            if(!Registry.checked[Path.join(out, "node_modules")]){
                await this.getCacheFromFolder(Path.join(out, "node_modules"))
            }
            return await this.getModuleInfoFromFolder(Path.join(out, "node_modules", module.name))
        }

        
        await this.$yarnExecute(out)
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
        return await this.getModuleInfoFromFolder(Path.join(out, "node_modules", module.name))
    }
}


export default Registry