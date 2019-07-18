// same as config.coffee but reading from IPC Master
var Config

import {
	EventEmitter
} from 'events'
import Path from 'path'
import Os from 'os'
import Url from 'url'

Config = (function() {
	class Config extends EventEmitter {
		private ipc 
		private _config 
		
		constructor(ipc) {
			super()
			this.ipc = ipc
		}

		async _changeConfig(config) {
			if (config.preload) {
				await this._preload(config);
			}
			/*
			if config.include 
				await @_loadIncludes(config)
			*/
			this._config = config;
			return this.emit("change", config);
		}

		_checkConfig(config) {
			return config;
		}

		parseEnvironment(obj) {
			var str;
			if (typeof obj === "object") {
				// detect os 
				str = obj[Os.platform()];
				if (!str) {
					str = obj.default;
				}
			} else {
				str = obj;
			}
			return str;
		}

		resolvePath(path, parent) {
			path = this.parseEnvironment(path);
			if (path.startsWith("./") || path.startsWith("../")) {
				path = Path.resolve(Path.dirname(parent.__defined), path);
			}
			return path;
		}

		pathJoin(path1, path2) {
			var pathr, uri;
			uri = Url.parse(path1);
			if (uri.protocol === "file:") {
				path1 = Url.fileURLToPath(path1);
				pathr = Path.join(path1, path2);
				return pathr;
			}
			if (!uri.protocol) {
				pathr = Path.join(path1, path2);
				if (path1.startsWith("./")) {
					return "./" + pathr;
				}
			} else {
				return Url.resolve(path1, path2);
			}
		}

		get sites() {
			return this.readCached().sites
		}
		get hosts() {
			return this.readCached().sites
		}

		async _preload(config) {
			var id, mod, ref, results;
			config.modules = {};
			ref = config.preload;
			results = [];
			for (id in ref) {
				mod = ref[id];
				mod = this.resolvePath(mod, config);
				results.push(config.modules[id] = (await import(mod)));
			}
			return results;
		}

		_loadIncludes(config) {
			// watcher disabled		
			return null;
		}

		sleep(time = 100) {
			var def;
			def = this.deferred();
			setTimeout(def.resolve, time);
			return def.promise;
		}

		async _load() {
			var _file, config, item, j, k, l, len, len1, len2, len3, m, nsites, old, ref, ref1, ref2, ref3, site, sitesbydef, sitesbydef2, val;
			config = (await this.ipc.send({
				action: 'call',
				name: "service",
				method: 'getConfig',
				args: []
			}));
			if (!config.sites) {
				return;
			}
			if (this._config) {
				sitesbydef = {};
				sitesbydef2 = {};
				nsites = [];
				ref = this._config.sites;
				for (j = 0, len = ref.length; j < len; j++) {
					site = ref[j];
					sitesbydef[site.__defined] = sitesbydef[site.__defined] || {
						items: [],
						time: site.__time
					};
					sitesbydef[site.__defined].items.push(site);
				}
				ref1 = config.sites;
				for (k = 0, len1 = ref1.length; k < len1; k++) {
					site = ref1[k];
					sitesbydef2[site.__defined] = sitesbydef2[site.__defined] || {
						items: [],
						time: site.__time
					};
					sitesbydef2[site.__defined].items.push(site);
				}
				for (_file in sitesbydef2) {
					val = sitesbydef2[_file];
					old = sitesbydef[_file];
					if ((old != null ? old.time : void 0) === val.time) {
						ref2 = old.items;
						for (l = 0, len2 = ref2.length; l < len2; l++) {
							item = ref2[l];
							nsites.push(item);
						}
					} else {
						ref3 = val.items;
						for (m = 0, len3 = ref3.length; m < len3; m++) {
							item = ref3[m];
							nsites.push(item);
						}
					}
				}
				config.sites = nsites;
				this._config = config;
			} else {
				this._config = config;
			}
			return this.emit("change", this._config);
		}

		async _include(config, path) {
			var e, newconfig;
			try {
				await this.sleep(200);
				this._removeinclude(config, path);
				newconfig = (await import(path));
				newconfig.__time = newconfig.__time || Date.now();
				if (!newconfig.kawixDynamic) {
					Object.defineProperty(newconfig, "kawixDynamic", {
						enumerable: false,
						value: {
							time: 5000
						}
					});
				}
				return this._process(config, newconfig, path);
			} catch (error) {
				e = error;
				return console.error("Failed including: ", path, e);
			}
		}

		_removeinclude(config, path) {
			var del, i, j, k, len, len1, offset, ref, ref1, results, site, todel;
			todel = [];
			config.sites = (ref = config.sites) != null ? ref : [];
			ref1 = config.sites;
			for (i = j = 0, len = ref1.length; j < len; i = ++j) {
				site = ref1[i];
				if (site.__defined === path) {
					todel.push(i);
				}
			}
			offset = 0;
			results = [];
			for (k = 0, len1 = todel.length; k < len1; k++) {
				del = todel[k];
				config.sites.splice(del - offset, 1);
				results.push(offset++);
			}
			return results;
		}

		_process(config, other, filename) {
			var edited, j, len, ref, site, sites;
			config.sites = (ref = config.sites) != null ? ref : [];
			edited = false;
			sites = other.host || other.site || other.app;
			if (sites) {
				if (sites instanceof Array) {
					for (j = 0, len = sites.length; j < len; j++) {
						site = sites[j];
						edited = true;
						config.sites.push(site);
						site.__defined = filename;
						this._loadSite(site);
					}
				} else {
					site = sites;
					edited = true;
					config.sites.push(site);
					site.__defined = filename;
					this._loadSite(site);
				}
			}
			if (edited) {
				this._config = config;
				this.emit("change", config);
			}
			return config;
		}

		async _loadSite(site) {
			if (site.preload) {
				await this._preload(site);
			}
			return site.loaded = true;
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

		async read() {
			while (!this._config) {
				await this.sleep(10);
			}
			return this._config;
		}

		readCached() {
			return this._config;
		}

	};



	return Config;

}).call(this);

export default Config;
