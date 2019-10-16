
// this get a remote instance of electron
// capable of make anything like running a file in electron directly


import Registry from '../../std/package/registry.yarn'
import fs from '../../std/fs/mod'
import Exception from '../../std/util/exception'
import * as async from '../../std/util/async'
import { Channel as RPAChannel } from '../../std/rpa/channel'


import Path from 'path'
import Os from 'os'
import Url from 'url'
import Child, { ChildProcess } from 'child_process'
import {EventEmitter} from 'events'

export class Electron extends EventEmitter {

    electron: any 
    channel: RPAChannel 
    bridge: any 

    _electron: any 
    id: string 
    _p: ChildProcess

    main: any 


    constructor(id){
        super()
        this.id = "ELECTRON>" + id
    }

    async _createBootFile() {
        var file, path;
        path = Path.join(Os.homedir(), ".kawi")
        if (!(await fs.existsAsync(path))) {
            await fs.mkdirAsync(path)
        }
        file = Path.join(path, ".electron.boot.tmp.js")
        await fs.writeFileAsync(file, "\nvar arg, kawix, n, id, start\nvar Path = require(\"path\")\n\n\nfor (var i = 0; i < process.argv.length; i++) {\n	arg = process.argv[i]\n	if (n == 0) {\n		id = arg\n		n = 1\n	}\n	else if (n == 1) {\n		start = arg\n		break\n	}\n	else if (arg == process.argv[2]) {\n		// require kawix core\n		kawix = require(arg)\n		n = 0\n	}\n}\n\n\nvar init1= function(){\n	if(kawix){\n		kawix.KModule.injectImport()\n		if (!start) start = __dirname + Path.sep + \"start.js\"\n\n		kawix.KModule.import(start).then(function(response){\n			response.default(id).then(function(){\n			}).catch(function(e){\n				console.error(\"Failed execute: \", e)\n				process.exit(10)\n			})\n		}).catch(function(e){\n			console.error(\"Failed execute: \", e)\n			process.exit(10)\n		})\n	}\n}\nrequire(\"electron\").app.once(\"ready\", init1)\n");
        return file
    }



    async requestSingleInstanceLock(){
        
        try{
            let channel = await RPAChannel.connectLocal(this.id)
            try{
                let argv = JSON.stringify(process.argv)
                await channel.client._sendSecondInstance(argv, process.cwd())
            }catch(e){
                console.error("ERROR sending data of second instance. ", e)
            }
            channel.close() 
            return false 
        }catch(e){
        }

        await this.startInstance()
        await this.bridge.main(this)
        return true 


    }

    _sendSecondInstance(argv: string, cwd: string){
        if(this.main){
            try{
                let args = JSON.parse(argv) 
                args.rpa_plain = true 
                this.main.emit("second-instance", args, cwd)
            }catch(e){}
        }
    }


    async attachInstance(){
        
        this.channel = await RPAChannel.connectLocal(this.id)
        this.bridge = this.channel.client
        this.electron = await this.bridge.electron()

    }


    

    async startInstance(){

        let dist  = '', startfile

        if (process.env.GIX_ELECTRON_PATH) {
            dist = process.env.GIX_ELECTRON_PATH
        }
        else if(this._electron){
            
            dist = this._electron.dist 
            startfile = this._electron.startfile
        }
        else{

            
            
            let reg = new Registry()
            let wantedversion = "6.0.11"
            let mod = await reg.resolve("electron@" + wantedversion)
            dist = Path.join(mod.folder, "dist")


            let electronFolder = Path.join(Os.homedir(), "Kawix", "Electron-" + wantedversion)
            let gelectronFolder = Path.join(Os.homedir(), "Kawix", "Electron")
            let appFile = Path.join(Os.homedir(), "Kawix", "Electron", "app." + wantedversion)
            let versioning = Path.join(Os.homedir(), "Kawix", "gix.electron.version")

            if (!fs.existsSync(gelectronFolder)) {
                await fs.mkdirAsync(gelectronFolder)
            }

            if (process.env.KWCORE_APP_ID) {
                gelectronFolder = Path.join(gelectronFolder, process.env.KWCORE_APP_ID)
                if (!fs.existsSync(gelectronFolder)) {
                    await fs.mkdirAsync(gelectronFolder)
                }


                versioning = Path.join(gelectronFolder, "version")
                let currentVer = ""
                if (await fs.existsAsync(versioning)) {
                    currentVer = await fs.readFileAsync(versioning, 'utf8')
                    currentVer = currentVer.trim()
                }

                if (currentVer < wantedversion) {
                    let files = await fs.readdirAsync(gelectronFolder)
                    for (let i = 0; i < files.length; i++) {
                        await fs.unlinkAsync(Path.join(gelectronFolder, files[i]))
                    }

                    files = await fs.readdirAsync(Path.join(mod.folder, "dist"))
                    for (let i = 0; i < files.length; i++) {
                        if (files[i] == "electron") {
                            let outf = Path.join(gelectronFolder, files[i])
                            if (!fs.existsSync(appFile)) {
                                await fs.copyFileAsync(Path.join(mod.folder, "dist", files[i]), appFile)
                            }
                            await fs.linkAsync(appFile, outf)
                            await fs.chmodAsync(outf, "755")
                        } else {
                            await fs.symlinkAsync(Path.join(mod.folder, "dist", files[i]), Path.join(gelectronFolder, files[i]))
                        }
                    }
                    await fs.writeFileAsync(versioning, wantedversion)
                }

                dist = gelectronFolder
                startfile = Path.join(gelectronFolder, "start.js")

            }

            

            if (Os.platform() === "win32") {
                dist = Path.join(dist, "electron.exe");
            } else if (Os.platform() === "darwin") {
                dist = Path.join(dist, "Electron.app", "Contents", "MacOS", "Electron");
            } else {
                dist = Path.join(dist, "electron");
            }

            if (!(await fs.existsAsync(dist))) {
                throw Exception.create("Failed to install electron").putCode("LOAD_FAILED")
            }

            this._electron = {dist, startfile}

        }


        let file1 = Path.join(__dirname, "_electron_boot.js")
        let file3 = Path.join(__dirname, "start.electron")
        if (__filename.startsWith("http:") || __filename.startsWith("https:")) {
            file3 = Url.resolve(__filename, 'start.electron')
            file1 = (await this._createBootFile())
        }

        let mainkawix = kawix.__file
        let targs = [file1, mainkawix, this.id, file3]
        if (startfile) {
            

            let zargs = { name: '', args: [] }
            if (process.env.KWCORE_ORIGINAL_EXECUTABLE) {
                zargs.name = process.env.KWCORE_ORIGINAL_EXECUTABLE
                zargs.args = [process.argv[2]]
            } else {
                zargs.name = process.execPath
                zargs.args = process.argv.slice(1, 2)
            }
            let content = `
			if(process.env.GIX_START == 1){
				console.log('executing here')
				require(${JSON.stringify(kawix.__file)})	
				kawix.KModule.injectImport()
				var start = ${JSON.stringify(file3)}
				var id = ${JSON.stringify(this.id)}

				kawix.KModule.import(start).then(function (response) {
					response.default(id).then(function () {
					}).catch(function (e) {
						console.error("Failed execute: ", e)
						process.exit(10)
					})
				}).catch(function (e) {
					console.error("Failed execute: ", e)
					process.exit(10)
				})
			}		
			else{
				var Child = require("child_process")
				var child = Child.spawn(${JSON.stringify(zargs.name)}, ${JSON.stringify(zargs.args)}, {
					detached: true,
					stdio:'inherit',
					env: Object.assign({},process.env,{
						GIX_DONT_WRITE_STARTING: 1,
						KWCORE_APP_ID: ${JSON.stringify(process.env.KWCORE_APP_ID)}
					})
				})
				child.on("error",function(e){console.error("ERROR:",e)})
				child.unref()
				setTimeout(process.exit.bind(process),1000)
			}
			`
            if (process.env.GIX_DONT_WRITE_STARTING != "1")
                await fs.writeFileAsync(startfile, content)
            targs = [startfile]


        }



        let env = Object.assign({}, process.env, {
            GIX_START: 1
        })
        delete env.ELECTRON_RUN_AS_NODE

        let def= new async.Deferred<void>()
        this._p = Child.spawn(dist, targs, {
            env: env
        });
        this._p.on("error", def.reject)
        this._p.on("exit", () => {
            if (def) {
                def.reject(Exception.create("Failed start electron"))
                def = null 
            }
        })
        this._p.stdout.on("data", function (d) {
            var e
            try {
                if (def && d.toString().indexOf("ELECTRON PROCESS LISTENING") >= 0) {
                    def.resolve()
                    def = null 
                }else{
                    process.stdout.write(" [GIX Electron]: ")
                    process.stdout.write(d)
                }
            } catch (error) {
                e = error
                return console.error("error here?", e)
            }
        })
        await def.promise


        // connect to electron 
        this.channel = await RPAChannel.connectLocal(this.id)
        this.bridge = this.channel.client 
        this.electron =  await this.bridge.electron()
        return this 

    }

    async removeEventListener(target: EventEmitter, event: string, listener: Function) {

        if (!listener) return
        if (listener.rpa_id) {
            let realListener = target["rpa>" + listener.rpa_id]
            if (realListener) {
                target.removeListener(event, realListener)
            }
            delete target["rpa>" + listener.rpa_id]
            return
        }

        target.removeListener(event, listener)

    }

    async addEventListener(target: EventEmitter, event: string, listener: Function) {

        if (!listener) return

        if (listener.rpa_preserve) {
            listener.rpa_preserve()
            let realListener
            realListener = async function () {
                try {
                    return await listener.apply(this, arguments)
                } catch (e) {
                    if (e.code == "RPA_DESTROYED" || e.code == "RPC_NOT_FOUND") {
                        // silent pass the error
                        // and remove listener
                        target.removeListener(event, realListener)
                    } else {
                        throw e
                    }
                }
            }
            target["rpa>" + listener.rpa_id] = realListener
            target.addListener(event, realListener)
        } else {
            target.addListener(event, listener)
        }
    }

}