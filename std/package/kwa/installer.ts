var Installer;

import semver from '../semver.js';
import fs from '../../fs/mod.js';
import axios from 'npm://axios@0.18.0';
import Url from 'url';
import Path from 'path';
import Os from 'os';
import qs from 'querystring';
import Exception from '../../util/exception';
import Crypto from '../../util/crypto/mod.js';
import './register';

Installer = class Installer {
	constructor({module, version, url, key, password, machineid, projectName}) {
		var parts;
		if (url != null ? url.startsWith("gh/") : void 0) {
			parts = url.split("");
			url = `https://cdn.jsdelivr.net/${url}`;
		}
		this.url = url != null ? url : './';
		this.module = module != null ? module : '';
		this.key = key;
		this.machineid = machineid;
		this.version = version;
		this._locks = {};
		this.projectName = projectName != null ? projectName : "default";
		this.options = arguments[0];
	}

	_sleep(timeout = 100) {
		return new Promise(function(resolve) {
			return setTimeout(resolve, timeout);
		});
	}

	installInfo(dir) {
		return this._install(dir, true);
	}

	install(dir) {
		return this._install(dir, false);
	}

	async _install(dir, _getinfo, _nolock) {
		var Git, a, arg1, args, branches, clone, data, def, dep, depInstaller, deps, e, fileinfo, fname, fname1, fname2, fnamex, i, imodules, info0, len, modname, modules, needupdate, password, ref, ref1, ref10, ref11, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, res, response, st, u;
		if (!_nolock) {
			await this._lock();
		}
		try {
			info0 = (await this.get());
			data = info0.data;
			deps = [];
			// create a imodules if not found 
			if (!dir) {
				dir = Path.join(Os.homedir(), "Kawix");
				if (!fs.existsSync(dir)) {
					await fs.mkdirAsync(dir);
				}
			}
			imodules = Path.join(dir, "modules");
			modules = Path.join(dir, this.projectName);
			if (!fs.existsSync(imodules)) {
				fs.mkdirAsync(imodules);
			}
			if (!fs.existsSync(modules)) {
				fs.mkdirAsync(modules);
			}
			if (!data) {
				throw Exception.create(`Version ${this.version} not found`).putCode("VERSION_NOT_FOUND");
			}
			if (data.dependencies) {
				ref = data.dependencies;
				for (i = 0, len = ref.length; i < len; i++) {
					dep = ref[i];
					arg1 = Object.assign({}, dep, {
						key: this.key,
						machineid: this.machineid
					});
					depInstaller = new Installer(arg1);
					deps.push((await depInstaller._install(dir, _getinfo, true)));
				}
			}
			modname = info0.name || data.name;
			fileinfo = {};
			try {
				fileinfo = (await import(Path.join(imodules, modname + ".info.json")));
			} catch (error) {}
			if ((((ref1 = fileinfo.versions) != null ? (ref2 = ref1[info0.version]) != null ? ref2.uploadid : void 0 : void 0) !== data.uploadid) || (!data.ref && (data.type === "git"))) {
				if (data.url || data.filename) {
					if (data.type === "git") {
						Git = (await import("npm://isomorphic-git@0.54.2"));
						Git.plugins.set('fs', fs);
						fname = Path.join(imodules, modname + "." + info0.version);
						branches = null;
						clone = false;
						try {
							branches = (await Git.listBranches({
								dir: fname,
								remote: 'origin'
							}));
							if (branches.length === 0) {
								clone = true;
							}
						} catch (error) {
							clone = true;
						}
						if (clone) {
							if (_getinfo) {
								return {
									version: info0.version,
									id: data.uploadid,
									url: data.url,
									type: data.type,
									needupdate: true,
									name: info0.name || data.name
								};
							}
							
							// Clone		
							await Git.clone({
								dir: fname,
								url: data.url,
								username: (ref3 = data.credentials) != null ? ref3.username : void 0,
								password: (ref4 = data.credentials) != null ? ref4.password : void 0
							});
						} else {
							try {
								if (data.ref) {
									await Git.checkout({
										ref: data.ref,
										dir: fname
									});
								} else {
									throw 1;
								}
							} catch (error) {
								if (_getinfo) {
									return {
										version: info0.version,
										id: data.uploadid,
										url: data.url,
										type: data.type,
										needupdate: true,
										name: info0.name || data.name
									};
								}
							}
							// git pull 
							await Git.pull({
								dir: fname,
								username: (ref5 = data.credentials) != null ? ref5.username : void 0,
								password: (ref6 = data.credentials) != null ? ref6.password : void 0
							});
						}
						if (data.ref) {
							await Git.checkout({
								dir: fname,
								ref: data.ref
							});
						}
					} else {
						if (!this.url.startsWith("http")) {
							if (this.module) {
								a = Path.join(this.url, this.module);
							} else {
								a = this.url;
							}
						} else {
							a = Url.resolve(this.url, this.module);
						}
						a = Url.resolve(a + "/", data.filename);
						u = (ref7 = data.url) != null ? ref7 : a;
						args = {};
						if (this.key) {
							args.key = this.key;
						}
						if (this.machineid) {
							args.machineid = this.machineid;
						}
						if (a !== u) {
							args.original = a;
						}
						u += "?" + qs.stringify(args);
						if (_getinfo) {
							return {
								version: info0.version,
								id: data.uploadid,
								url: u,
								type: data.type,
								needupdate: true,
								name: info0.name || data.name
							};
						}
						try {
							response = (await axios({
								method: 'GET',
								url: u,
								responseType: 'stream'
							}));
						} catch (error) {
							e = error;
							throw e;
						}
						//throw Exception.create(e.message + ": " + JSON.stringify(e.response?.data)).putCode("FAILED")
						def = {};
						def.promise = new Promise(function(a, b) {
							def.resolve = a;
							return def.reject = b;
						});
						try {
							fname1 = Path.join(imodules, modname + "." + info0.version + ".kwa.0");
							fnamex = Path.join(imodules, modname + "." + info0.version + ".kwa.1");
							fname = Path.join(imodules, modname + "." + info0.version + ".kwa");
							st = fs.createWriteStream(fname1);
							st.on("error", def.reject);
							response.data.on("error", def.reject);
							st.on("finish", def.resolve);
							response.data.pipe(st);
							await def.promise;
							if (fs.existsSync(fname)) {
								await fs.unlinkAsync(fname);
							}
							if (data.crypt) {
								password = (ref8 = (ref9 = data.crypt) != null ? ref9.password : void 0) != null ? ref8 : (ref10 = this.options) != null ? ref10.password : void 0;
								if (!password) {
									throw Exception.create("Content is encrypted. You need provide a password").putCode("CONTENT_ENCRYPTED");
								}
								res = Crypto.decrypt({
									file: fname1,
									outfile: fnamex,
									password: password
								});
								def = {};
								def.promise = new Promise(function(a, b) {
									def.resolve = a;
									return def.reject = b;
								});
								res.readStream.on("error", def.reject);
								res.unzip.on("error", def.reject);
								res.writeStream.on("error", def.reject);
								res.writeStream.on("finish", def.resolve);
								await def.promise;
								await fs.unlinkAsync(fname1);
								await fs.renameAsync(fnamex, fname);
							} else {
								await fs.renameAsync(fname1, fname);
							}
						} catch (error) {
							e = error;
							if (fs.existsSync(fname1)) {
								await fs.unlinkAsync(fname1);
							}
							throw e;
						}
					}
					try {
						fileinfo = (await KModule.import(Path.join(imodules, modname + ".info.json"), {
							force: true
						}));
					} catch (error) {}
					if (data.type === "git") {
						fname2 = Path.join(modules, modname);
						if (fs.existsSync(fname2)) {
							await fs.unlinkAsync(fname2);
						}
						if (Os.platform() === "win32") {
							await fs.symlinkAsync(fname, fname2, "junction");
						} else {
							await fs.symlinkAsync(fname, fname2);
						}
						fileinfo.version = info0.version;
					} else {
						fname2 = Path.join(modules, modname + ".kwa");
						if (Os.platform() === "win32") {
							// windows es problemático con los enlaces simbólicos
							if (fs.existsSync(fname2)) {
								await fs.unlinkAsync(fname2);
							}
							await fs.copyFileAsync(fname, fname2);
							fileinfo.version = info0.version;
						} else {
							
							// make a symlink 
							if (fs.existsSync(fname2)) {
								await fs.unlinkAsync(fname2);
							}
							await fs.symlinkAsync(fname, fname2);
							fileinfo.version = info0.version;
						}
						try {
							await import(fname2);
						} catch (error) {}
					}
					fileinfo.versions = (ref11 = fileinfo.versions) != null ? ref11 : {};
					fileinfo.versions[info0.version] = data;
					
					// write the file 
					await fs.writeFileAsync(Path.join(imodules, modname + ".info.json"), JSON.stringify(fileinfo, null, '\t'));
				}
				return {
					deps: deps,
					type: data.type,
					installed: fname,
					name: info0.name || data.name,
					version: info0.version
				};
			} else {
				needupdate = false;
				if (deps != null ? deps.length : void 0) {
					needupdate = deps.filter(function(a) {
						return a.needupdate;
					});
					needupdate = needupdate.length > 0;
				}
				return {
					needupdate: needupdate,
					type: data.type,
					installed: null,
					version: info0.version,
					name: info0.name || data.name,
					localversion: fileinfo.version
				};
			}
		} catch (error) {
			e = error;
			throw e;
		} finally {
			if (!_nolock) {
				await this._unlock();
			}
		}
	}

	async get() {
		var e, i, info, len, m, resolved, u, version, versions;
		try {
			// get the best version available 
			u = this.url;
			m = `${u}${this.module}/info.json`;
			info = (await KModule.import(m, {
				force: true
			}));
			versions = Object.keys(info.versions);
		} catch (error) {
			e = error;
			throw new Error(`Module ${u}${this.module} not found: ${e.message}`);
		}
		versions.sort(function(a, b) {
			if (a > b) {
				return -1;
			} else {
				if (a < b) {
					return 1;
				} else {
					return 0;
				}
			}
		});
		resolved = '';
		for (i = 0, len = versions.length; i < len; i++) {
			version = versions[i];
			if (this.version === "latest" || (this.version === "*")) {
				resolved = version;
				break;
			}
			if (semver.satisfies(version, this.version || "*")) {
				resolved = version;
				break;
			}
		}
		return {
			version: resolved,
			data: info.versions[resolved],
			name: info.name
		};
	}

	async _lock(timeout = 30000) {
		var dir, e, file, good, stat, time;
		dir = Path.join(Os.homedir(), "Kawix");
		if (!fs.existsSync(dir)) {
			await fs.mkdirAsync(dir);
		}
		file = Path.join(dir, "install.lock");
		time = Date.now();
		if (this._locks[file]) {
			throw new Error("Failed getting exclusive access for requiring");
		}
		try {
			while (true) {
				if (Date.now() - time > timeout) {
					throw new Error("Timedout getting exclusive access for requiring");
				}
				try {
					await fs.mkdirAsync(file);
					good = true;
				} catch (error) {
					e = error;
					try {
						stat = (await fs.statAsync(file));
						if (stat) {
							if (Date.now() - stat.mtimeMs > 10000) {
								try {
									await fs.rmdirAsync(file);
								} catch (error) {}
							} else {
								await this._sleep(1000);
							}
						} else {
							await this._sleep(1000);
						}
					} catch (error) {}
				}
				if (good) {
					break;
				}
			}
			if (this._locks[file]) {
				throw new Error("Failed getting exclusive access for requiring");
			}
			return this._locks[file] = setInterval(async function() {
				try {
					return (await fs.utimesAsync(file, Date.now(), Date.now()));
				} catch (error) {}
			}, 1500);
		} catch (error) {
			e = error;
			throw e;
		}
	}

	async _unlock(file) {
		var timer;
		file = Path.join(Os.homedir(), "Kawix", "install.lock");
		// unlock
		if (file) {
			timer = this._locks[file];
			if (timer) {
				clearInterval(timer);
				delete this._locks[file];
				try {
					return (await fs.rmdirAsync(file));
				} catch (error) {}
			}
		}
	}

};

export default Installer;
