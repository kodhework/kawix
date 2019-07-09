var Program;

import Path from 'path';
import Os from 'os';
import fs from 'fs';
import './register';

import colors from 'npm://colors@1.3.3/safe';
import {
	machineId
} from 'npm://node-machine-id@1.1.10';


Program = class Program {
	private _str= '';
	static main() {
		var program;
		program = new Program();
		return program.main();
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

	readLineAsync(char) {
		var def, read, ref, str;
		if (char && this._str) {
			return this._str[0];
		}
		str = (ref = this._str) != null ? ref : '';
		def = this.deferred();
		read = (d) => {
			var i;
			d = str + d.toString();
			if (char) {
				this._str = d.substring(1);
				return def.resolve(d[0]);
			}
			i = d.indexOf("\n");
			if (i >= 0) {
				this._str = d.substring(i + 1);
				d = d.substring(0, i);
				if (d.endsWith("\r")) {
					d = d.substring(0, d.length - 1);
				}
				return def.resolve(d);
			} else {
				this._str = d;
				return process.stdin.once("data", read);
			}
		};
		process.stdin.once("data", read);
		return def.promise;
	}

	async main() {
		var Installer, code1, code2, e, installer, mid, path, props, ref, ref1, ref2, result;
		try {
			Installer = (await KModule.import("./installer", {
				force: true
			}));
			Installer = (ref = Installer.default) != null ? ref : Installer;
			props = {};
			console.info("");
			/*
			process.stdout.write " Write the type of download (kwa/git): "
			props.type = (await @readLineAsync()).trim()
			*/
			process.stdout.write('\x1B[2J\x1B[0f');
			console.info("");
			console.info(" " + colors.yellow("1") + " > Install a package");
			console.info(" " + colors.yellow("2") + " > Create a DHS start script");
			console.info(" ");
			process.stdout.write(" Please select an option: ");
			props.action = ((await this.readLineAsync())).trim();
			if (props.action === "2") {
				process.stdout.write(" Write the main adress (Default: 0.0.0.0:33016): ");
				props.address = ((await this.readLineAsync())).trim();
				process.stdout.write(" Write the project folder name (Leave empty for default): ");
				props.projectName = ((await this.readLineAsync())).trim();
				process.stdout.write(" Write the folder to generate the start files (default: current directory): ");
				props.folder = ((await this.readLineAsync())).trim() || "default";
				props.nginxfile = Path.join(props.folder, "nginx");
				props.startjs = Path.join(props.folder, "start.js");
				props.startcjs = Path.join(props.folder, "start.cluster.js");
				props.socket = Path.join(props.folder, "socket");
				props.modules = Path.join(props.folder, "modules");
				props.startBackground = Path.join(props.folder, "start.background");
				props.connectBackground = Path.join(props.folder, "connect.background");
				props.startcBackground = Path.join(props.folder, "start.cluster.background");
				//props.connectcBackground= Path.join(props.folder, "connect.cluster.background")
				process.stdout.write(" Enable NGINX? (y/n): ");
				props.nginx = ((await this.readLineAsync())).trim();
				//# create the file 
				path = Path.join(Os.homedir(), "Kawix", props.projectName || "default", "kowix");
				code1 = `import fs from 'fs'\nimport reg from 'https://kwx.kodhe.com/x/v/0.4.0/std/package/kwa/register.js'\nimport Path from 'path'\ninit()\nasync function init(){\n		var address= ${JSON.stringify(props.address)}\n		if(address){\n			process.env.DHS_ADDRESS= address\n		}\n		if(fs.existsSync(__dirname + '/nginx')){\n			process.env.DHS_NGINX_ENABLED= 1\n		}\n		var mod, kwa_file, f\n		f= ${JSON.stringify(path)}\n		if (fs.existsSync(f+ ".kwa")){\n			mod = await import(f+ ".kwa")\n			kwa_file = Path.dirname(mod["kawix.app"].original)\n		}\n		else{\n			kwa_file= f\n		}\n\n		process.env.PROJECTS_DIR= kwa_file\n		mod.startStandalone()\n}`;
				code2 = `import fs from 'fs'\nimport reg from 'https://kwx.kodhe.com/x/v/0.4.0/std/package/kwa/register.js'\nimport Path from 'path'\ninit()\nasync function init(){\n		var address= ${JSON.stringify(props.address)}\n		if(address){\n			process.env.DHS_ADDRESS= address\n		}\n		if(fs.existsSync(__dirname + '/nginx')){\n			process.env.DHS_NGINX_ENABLED= 1\n		}\n		var mod, kwa_file, f\n		f= ${JSON.stringify(path)}\n		if (fs.existsSync(f+ ".kwa")){\n			mod = await import(f + ".kwa")\n			kwa_file = Path.dirname(mod["kawix.app"].original)\n		}\n		else{\n			kwa_file= f\n		}\n		process.env.PROJECTS_DIR= kwa_file\n		mod.start()\n}`;
				if (!fs.existsSync(props.folder)) {
					fs.mkdirSync(props.folder);
				}
				fs.writeFileSync(props.startjs, code1);
				fs.writeFileSync(props.startcjs, code2);
				code1 = "#!/usr/bin/env bash\nSOURCE=\"${BASH_SOURCE[0]}\"\nwhile [ -h \"$SOURCE\" ]; do # resolve $SOURCE until the file is no longer a symlink\n  DIR=\"$( cd -P \"$( dirname \"$SOURCE\" )\" >/dev/null 2>&1 && pwd )\"\n  SOURCE=\"$(readlink \"$SOURCE\")\"\n  [[ $SOURCE != /* ]] && SOURCE=\"$DIR/$SOURCE\" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located\ndone\nDIR=\"$( cd -P \"$( dirname \"$SOURCE\" )\" >/dev/null 2>&1 && pwd )\"\n\nkwcore https://kwx.kodhe.com/x/v/0.4.0/std/util/background/start.hidden listen \"$DIR/socket\" kwcore \"$DIR/start.js\" &";
				code2 = "#!/usr/bin/env bash\nSOURCE=\"${BASH_SOURCE[0]}\"\nwhile [ -h \"$SOURCE\" ]; do # resolve $SOURCE until the file is no longer a symlink\n  DIR=\"$( cd -P \"$( dirname \"$SOURCE\" )\" >/dev/null 2>&1 && pwd )\"\n  SOURCE=\"$(readlink \"$SOURCE\")\"\n  [[ $SOURCE != /* ]] && SOURCE=\"$DIR/$SOURCE\" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located\ndone\nDIR=\"$( cd -P \"$( dirname \"$SOURCE\" )\" >/dev/null 2>&1 && pwd )\"\n\nkwcore https://kwx.kodhe.com/x/v/0.4.0/std/util/background/start.hidden listen \"$DIR/socket\" kwcore \"$DIR/start.cluster.js\" &";
				fs.writeFileSync(props.startBackground, code1);
				fs.writeFileSync(props.startcBackground, code2);
				code1 = "#!/usr/bin/env bash\nSOURCE=\"${BASH_SOURCE[0]}\"\nwhile [ -h \"$SOURCE\" ]; do # resolve $SOURCE until the file is no longer a symlink\n  DIR=\"$( cd -P \"$( dirname \"$SOURCE\" )\" >/dev/null 2>&1 && pwd )\"\n  SOURCE=\"$(readlink \"$SOURCE\")\"\n  [[ $SOURCE != /* ]] && SOURCE=\"$DIR/$SOURCE\" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located\ndone\nDIR=\"$( cd -P \"$( dirname \"$SOURCE\" )\" >/dev/null 2>&1 && pwd )\"\n\nkwcore https://kwx.kodhe.com/x/v/0.4.0/std/util/background/start.hidden connect \"$DIR/socket\"";
				fs.writeFileSync(props.connectBackground, code1);
				//fs.writeFileSync(props.connectcBackground, code2)
				fs.chmodSync(props.connectBackground, '0755');
				//fs.chmodSync(props.connectcBackground, '0755')
				fs.chmodSync(props.startBackground, '0755');
				fs.chmodSync(props.startcBackground, '0755');
				if (((ref1 = props.nginx) != null ? (ref2 = ref1[0]) != null ? ref2.toUpperCase() : void 0 : void 0) === 'Y') {
					fs.writeFileSync(props.nginxfile, "y");
				} else {
					fs.unlinkSync(props.nginxfile);
				}
				if (!fs.existsSync(props.modules)) {
					if (Os.platform() === "win32") {
						fs.symlinkSync(Path.join(Os.homedir(), "Kawix", props.projectName || "default"), props.modules, "junction");
					} else {
						fs.symlinkSync(Path.join(Os.homedir(), "Kawix", props.projectName || "default"), props.modules);
					}
				}
			} else if (props.action === "1") {
				process.stdout.write(" Write the URL of package: ");
				props.url = ((await this.readLineAsync())).trim();
				process.stdout.write(" Write the version of package: ");
				props.version = ((await this.readLineAsync())).trim();
				if (props.type === "git") {
					if (!props.version) {
						props.version = "master";
					}
				} else {
					if (!props.version) {
						props.version = "*";
					}
				}
				process.stdout.write(" Write the password. (only for encrypted): ");
				props.password = ((await this.readLineAsync())).trim();
				process.stdout.write(" Write the key (only if required): ");
				props.key = ((await this.readLineAsync())).trim();
				//process.stdout.write " Write the destination folder (Leave empty for default): "
				//props.folder = (await @readLineAsync()).trim()
				process.stdout.write(" Write the project folder name (Leave empty for default): ");
				props.projectName = ((await this.readLineAsync())).trim();
				mid = (await machineId());
				mid = Buffer.from(mid, 'hex').toString('base64');
				installer = new Installer({
					url: props.url,
					version: props.version,
					password: props.password,
					key: props.key,
					machineid: mid
				});
				result = (await installer.installInfo());
				if (result.localversion) {
					console.info(" The module is up to date");
				} else {
					console.info(" Installing module");
					result = (await installer.install(props.folder));
					console.info(" Installed");
					path = Path.join(Os.homedir(), "Kawix", props.projectName || "default", result.name + ".kwa");
					try {
						console.info(` Trying loading file: ${path}`);
						await import(path);
					} catch (error) {}
				}
			}
		} catch (error) {
			e = error;
			console.error("[ERROR] ", e);
		}
		return process.exit();
	}

}

Program.main()
export default Program
