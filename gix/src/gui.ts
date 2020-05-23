
import '../base_import'

import {
	EventEmitter
} from 'events';

import Child from 'child_process'
import Path from 'path'
import Os from 'os'
import Url from 'url'
import fs from './lib/_fs'
import IPC from './ipc'
import Exception from './exception'
import Registry from '/virtual/@kawix/std/package/registry.yarn'

declare var kawix

export class GuiServer {
	_f: any
	_evs: any
	_electron: any
	_evdef: any
	store: any


	constructor() {
		this._evs = [];
		this._f = {};
		this.store = {}
	}

	___() {
		var var1;
		var1 = null;
		typeof var1;
		return var1 instanceof Array;
	}

	_eval(str) {
		return eval(`(${str})`);
	}

	deferred() {
		var def;
		def = {};
		def.promise = new Promise(function(a, b) {
			def.resolve = a;
			return def.reject = b;
		});
		return def;
	}

	electron() {
		if (!this._electron) {
			this._electron = require("electron");
		}
		return this._electron;
	}

	test() {
		var create, electron;
		electron = this.electron();
		create = function() {
			var BrowserWindow, mainWindow;
			BrowserWindow = electron.BrowserWindow;
			mainWindow = new BrowserWindow({
				width: 800,
				height: 600
			});
			mainWindow.loadURL(`file://${Path.join(__dirname, "..", "html", "hello.world.html")}`);
			return mainWindow.show();
		};
		return create();
	}

	registerFunction(name, str) {
		var func;
		func = this._eval(str);
		return this._f[name] = func;
	}

	callFunction(name, params) {
		var func;
		func = this._f[name];
		if (!func) {
			throw Exception.create(`Function ${name} not registered`).putCode("NOT_FOUND");
		}
		return func(this.electron(), this, params);
	}

	emit(event, ...args) {
		var evs;
		this._evs.push({
			event: event,
			args: args
		});
		if (this._evdef) {
			evs = this._evs;
			this._evs = [];
			return this._evdef.resolve(evs);
		}
	}

	_readEvents() {
		var evs;
		if (this._evs.length) {
			evs = this._evs;
			this._evs = [];
			return evs;
		} else {
			this._evdef = this.deferred();
			return this._evdef.promise;
		}
	}

}

export class Gui extends EventEmitter {
	id: string
	ipc: IPC
	api: any
	_locked: boolean
	electron: any
	_p: Child.ChildProcess
	store: any
	static s: any

	constructor(id: string) {
		super();
		this.id = id
		this.ipc = new IPC(this.id)
		this.ipc.autoconnect = false
		this.api = {}
		this.store = {}
	}

	deferred() {
		var def;
		def = {};
		def.promise = new Promise(function(a, b) {
			def.resolve = a;
			return def.reject = b;
		});
		return def;
	}

	_checkFileExists(file) {
		var def;
		def = this.deferred();
		fs.access(file, fs.constants.F_OK, function(err) {
			return def.resolve(err ? false : true);
		});
		return def.promise;
	}

	test() {
		return this.ipc.send({
			"action": "call",
			"args": [],
			"method": "test"
		});
	}

	async register(id: string, func: Function): Promise<void> {
		var ipc, str;
		str = func.toString();
		await this.ipc.send({
			"action": "call",
			"args": [id, str],
			"method": "registerFunction"
		});
		ipc = this.ipc;
		this.api[id] = function(params) {
			return ipc.send({
				"action": "call",
				"args": [id, params],
				"method": "callFunction"
			});
		};
		return this.api[id];
	}

	sleep(timeout) {
		var def;
		def = this.deferred();
		setTimeout(def.resolve, timeout);
		return def.promise;
	}

	async _start_read_events() {
		var e, ev, evs, i, len, results;
		results = [];
		while (this.ipc.connected) {
			try {
				evs = (await this.ipc.send({
					"action": "call",
					"args": [],
					"method": "_readEvents"
				}));
				for (i = 0, len = evs.length; i < len; i++) {
					ev = evs[i];
					this.emit(ev.event, ...ev.args);
				}
				results.push((await this.sleep(1)));
			} catch (error) {
				e = error;
				console.error("Error reading events:", e);
				results.push((await this.sleep(200)));
			}
		}
		return results;
	}

	async _check_secondinstance() {
		var e;
		try {
			// check if is second instance
			await this.ipc.connect();
		} catch (error) {
			e = error;
			return true;
		}
		await this.ipc.send({
			"action": "import",
			"args": [__filename],
			"params": {}
		});
		await this.ipc.send({
			"action": "call",
			"method": "emit",
			"args": ["second-instance", process.argv, process.cwd()]
		});
		return false;
	}

	hasSingleInstanceLock(): boolean {
		var ref;
		return (ref = this._locked) != null ? ref : false;
	}

	async requestSingleInstanceLock(noretry?: boolean) : Promise<boolean>{
		var er, val;
		try {
			val = (await this._check_secondinstance());
			if (val) {
				this.ipc = new IPC(this.id);
				this.ipc.autoconnect = false
				await this.connect();
				this._locked = true;
				return true;
			}
		} catch (error) {
			er = error;
			if (!noretry) {
				this.sleep(100);
				return (await this.requestSingleInstanceLock(true));
			}
			Exception.create(`Failed getting single instance lock. Message: ${er.message}`, er).putCode(er.code).raise();
		}
		return false;
	}

	async connect(): Promise<void> {
		var Installer, def, dist, env, file1, file2, file3, id;

		let startfile = ''
		if (process.env.GIX_ELECTRON_PATH) {
			dist = process.env.GIX_ELECTRON_PATH;
		// require electron
		} else if (!this.electron) {
			//reg= new Registry()
			//mod= await reg.resolve "electron@5.0.1"
			//install= Path.join(mod.folder,"install.js")
			//dist = Path.join(Os.homedir(), "Kawix", "electron@5.0.1");


			let reg = new Registry()
			let wantedversion = "6.0.11"
			let mod = await reg.resolve("electron@" + wantedversion)
			let dist = Path.join(mod.folder, "dist")

			let electronFolder = Path.join(Os.homedir(),"Kawix", "Electron-" + wantedversion)
			let gelectronFolder = Path.join(Os.homedir(),"Kawix", "Electron")
			let appFile = Path.join(Os.homedir(),"Kawix", "Electron", "app." + wantedversion)
			let versioning = Path.join(Os.homedir(),"Kawix","gix.electron.version")


			if(!fs.existsSync(gelectronFolder)){
				await fs.mkdirAsync(gelectronFolder)
			}

			if(process.env.KWCORE_APP_ID){
				gelectronFolder = Path.join(gelectronFolder, process.env.KWCORE_APP_ID)
				if(!fs.existsSync(gelectronFolder)){
					await fs.mkdirAsync(gelectronFolder)
				}


				versioning = Path.join(gelectronFolder,"version")
				let currentVer = ""
				if(await fs.existsAsync(versioning)){
					currentVer = await fs.readFileAsync(versioning, 'utf8')
					currentVer = currentVer.trim()
				}

				if(currentVer<wantedversion){
					let files = await fs.readdirAsync(gelectronFolder)
					for(let i=0;i<files.length;i++){
						await fs.unlinkAsync(Path.join(gelectronFolder, files[i]))
					}

					files = await fs.readdirAsync(Path.join(mod.folder,"dist"))
					for(let i=0;i<files.length;i++){
						if(files[i] == "electron"){
							let outf = Path.join(gelectronFolder, files[i])
							if(!fs.existsSync(appFile)){
								await fs.copyFileAsync(Path.join(mod.folder,"dist", files[i]), appFile)
							}
							await fs.linkAsync(appFile, outf)
							await fs.chmodAsync(outf, "755")
						}else{
							await fs.symlinkAsync(Path.join(mod.folder,"dist", files[i]), Path.join(gelectronFolder, files[i]))
						}
					}
					await fs.writeFileAsync(versioning, wantedversion)
				}

				dist = gelectronFolder
				startfile = Path.join(gelectronFolder, "start.js")
				this.startfile = startfile


			}



			/*
			if(!fs.existsSync(electronFolder)){
				if(Os.platform() == "win32")
					await fs.symlinkAsync(mod.folder, electronFolder,"junction")
				else
					await fs.symlinkAsync(mod.folder, electronFolder)
			}*/




			if (Os.platform() === "win32") {
				dist = Path.join(dist, "electron.exe");
			} else if (Os.platform() === "darwin") {
				dist = Path.join(dist, "Electron.app", "Contents", "MacOS", "Electron");
			} else {
				dist = Path.join(dist, "electron");
			}

			/*
			if(process.env.KWCORE_APP_ID){

				// create a hard link of electron
				if(Os.platform() == "linux"){

					// this is for allow customizable desktop files
					// for correct iconing on systems like plank for example
					let newdist = Path.join(Path.dirname(dist), "electron-" + process.env.KWCORE_APP_ID)
					if(!fs.existsSync(newdist)){
						await fs.linkAsync(dist, newdist)
						await fs.chmodAsync(newdist, "755")
					}
					dist = newdist

				}

			}
			*/

			//if (!(await this._checkFileExists(dist))) {
				//Installer = (await import("../electron-install"));
				//await Installer.install();


				if (!(await this._checkFileExists(dist))) {
					throw Exception.create("Failed to install electron").putCode("LOAD_FAILED");
				}
			//}
			this.electron = {
				dist: dist
			};
		} else {
			dist = this.electron.dist
			startfile = this.startfile
		}


		// open electron
		file1 = Path.join(__dirname, "_electron_boot.js");
		file3 = Path.join(__dirname, "start");
		if (__filename.startsWith("http:") || __filename.startsWith("https:")) {
			file3 = Url.resolve(__filename, 'start');
			file1 = (await this._createBootFile());
		}
		file2 = kawix.__file;
		id = this.id

		let targs = [file1, file2, id, file3]

		if(startfile){

			let zargs = {name:'',args:[]}
			if(process.env.KWCORE_ORIGINAL_EXECUTABLE){
				zargs.name = process.env.KWCORE_ORIGINAL_EXECUTABLE
				zargs.args = [process.argv[2]]
			}else{
				zargs.name = process.execPath
				zargs.args = process.argv.slice(1,2)
			}
			let content = `
			if(process.env.GIX_START == 1){
				console.log('executing here')
				require(${JSON.stringify(kawix.__file)})
				kawix.KModule.injectImport()
				var start = ${JSON.stringify(file3)}
				var id = ${JSON.stringify(id)}

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
			if(process.env.GIX_DONT_WRITE_STARTING != "1")
				await fs.writeFileAsync(startfile, content)
			targs = [startfile]
		}



		def = this.deferred();
		env = Object.assign({}, process.env);
		delete env.ELECTRON_RUN_AS_NODE;
		env.GIX_START = 1;
		console.info(targs)
		this._p = Child.spawn(dist, targs, {
			env: env
		});
		this._p.on("error", def.reject);
		this._p.on("exit", () => {
			this.emit("close");
			this.connected = false;
			if (!def.good) {
				return def.reject(Exception.create("Failed start electron"));
			}
		});
		this._p.stdout.on("data", function(d) {
			var e;
			try {
				process.stdout.write(" [GIX Electron]: ");
				process.stdout.write(d);
				if (!def.good && d.toString().indexOf("ELECTRON PROCESS LISTENING") >= 0) {
					def.good = true;
					return def.resolve();
				}
			} catch (error) {
				e = error;
				return console.error("error here?", e);
			}
		});
		await def.promise;
		return (await this.attach());
	}

	async attach(): Promise<void> {
		await this.ipc.connect();
		this.connected = true;
		await this.ipc.send({
			"action": "import",
			"args": [__filename],
			"params": {}
		});
	}

	//@_start_read_events()
	startReadEvents(): Promise<void> {
		return this._start_read_events();
	}

	async _createBootFile() {
		var file, path;
		path = Path.join(Os.homedir(), ".kawi");
		if (!(await this._checkFileExists(path))) {
			await fs.mkdirAsync(path);
		}
		file = Path.join(path, ".electron.boot.tmp.js");
		await fs.writeFileAsync(file, "\nvar arg, kawix, n, id, start\nvar Path = require(\"path\")\n\n\nfor (var i = 0; i < process.argv.length; i++) {\n	arg = process.argv[i]\n	if (n == 0) {\n		id = arg\n		n = 1\n	}\n	else if (n == 1) {\n		start = arg\n		break\n	}\n	else if (arg == process.argv[2]) {\n		// require kawix core\n		kawix = require(arg)\n		n = 0\n	}\n}\n\n\nvar init1= function(){\n	if(kawix){\n		kawix.KModule.injectImport()\n		if (!start) start = __dirname + Path.sep + \"start.js\"\n\n		kawix.KModule.import(start).then(function(response){\n			response.default(id).then(function(){\n			}).catch(function(e){\n				console.error(\"Failed execute: \", e)\n				process.exit(10)\n			})\n		}).catch(function(e){\n			console.error(\"Failed execute: \", e)\n			process.exit(10)\n		})\n	}\n}\nrequire(\"electron\").app.once(\"ready\", init1)\n");
		return file;
	}
}

export var ipcCreate = function() {
	if (!Gui.s) {
		Gui.s = new GuiServer();
		global.Gix = Gui.s;
	}
	return Gui.s;
}


export default Gui;
