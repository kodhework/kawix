var Gui, GuiServer;

import {
	EventEmitter
} from 'events';

import Child from 'child_process';
import Path from 'path';
import Os from 'os';
import Url from 'url';
import fs from './lib/_fs';
import IPC from './ipc';
import Exception from './exception';

GuiServer = class GuiServer {
	constructor() {
		this._evs = [];
		this._f = {};
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

};

Gui = class Gui extends EventEmitter {
	constructor(id1) {
		super();
		this.id = id1;
		this.ipc = new IPC(this.id);
		this.api = {};
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
		fs.access(file, fs.F_OK, function(err) {
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

	async register(id, func) {
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

	hasSingleInstanceLock() {
		var ref;
		return (ref = this._locked) != null ? ref : false;
	}

	async requestSingleInstanceLock(noretry) {
		var er, val;
		try {
			val = (await this._check_secondinstance());
			if (val) {
				this.ipc = new IPC(this.id);
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

	async connect() {
		var Installer, def, dist, env, file1, file2, file3, id;
		if (process.env.GIX_ELECTRON_PATH) {
			dist = process.env.GIX_ELECTRON_PATH;
		// require electron
		} else if (!this.electron) {
			//reg= new Registry()
			//mod= await reg.resolve "electron@5.0.1"
			//install= Path.join(mod.folder,"install.js")
			dist = Path.join(Os.homedir(), "Kawix", "electron@5.0.1");
			if (Os.platform() === "win32") {
				dist = Path.join(dist, "electron.exe");
			} else if (Os.platform() === "darwin") {
				dist = Path.join(dist, "Electron.app", "Contents", "MacOS", "Electron");
			} else {
				dist = Path.join(dist, "electron");
			}
			console.info("DIST:", dist);
			if (!(await this._checkFileExists(dist))) {
				Installer = (await import("../electron-install.js"));
				await Installer.install();
				/*
				def= @deferred()
				console.log(" > Installing electron")
				p= Child.spawn process.execPath, ["--no-proxy-resolver", install],
					env: Object.assign({}, process.env, {NODE_REQUIRE: '1'})
				p.on "error", def.reject
				p.stderr.on "data", (er)->
					console.error er.toString()

				p.stdout.on "data", (d)->
					process.stdout.write d
				p.on "exit", def.resolve
				await def.promise
				*/
				if (!(await this._checkFileExists(dist))) {
					throw Exception.create("Failed to install electron").putCode("LOAD_FAILED");
				}
			}
			this.electron = {
				dist: dist
			};
		} else {
			dist = this.electron.dist;
		}
		// open electron
		file1 = Path.join(__dirname, "_electron_boot.js");
		file3 = Path.join(__dirname, "start");
		if (__filename.startsWith("http:") || __filename.startsWith("https:")) {
			file3 = Url.resolve(__filename, 'start');
			file1 = (await this._createBootFile());
		}
		file2 = kawix.__file;
		id = this.id;
		def = this.deferred();
		env = Object.assign({}, process.env);
		delete env.ELECTRON_RUN_AS_NODE;
		env.GIX_START = 1;
		this._p = Child.spawn(dist, [file1, file2, id, file3], {
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

	async attach() {
		await this.ipc.connect();
		this.connected = true;
		await this.ipc.send({
			"action": "import",
			"args": [__filename],
			"params": {}
		});
	}

	//@_start_read_events()
	startReadEvents() {
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

};

export var ipcCreate = function() {
	if (!Gui.s) {
		Gui.s = new GuiServer();
		global.Gix = Gui.s;
	}
	return Gui.s;
};

//else
//	return new GuiServer()
export default Gui;