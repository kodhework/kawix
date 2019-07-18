// pure js basic watcher

import {
	EventEmitter
} from 'events'
import Glob from '../glob/mod'
import fs from '../../std/fs/mod'
import Path from 'path'
import * as async from '../../std/util/async'
export class Watcher extends EventEmitter {
	private options 
	private paths 
	private _stats 
	private _started 

	constructor(options = {}) {
		super();
		this.options = options
		this.paths = {}
		this._stats = {}
	}

	watch(paths) {
		var i, len, path;
		if (typeof paths === "string") {
			paths = [paths];
		}
		for (i = 0, len = paths.length; i < len; i++) {
			path = paths[i];
			path = this.parseEnvironment(path);
			this.paths[path] = true;
		}
		return this._start();
	}

	sleep(timeout) {
		var def;
		def = this.deferred();
		setTimeout(def.resolve, timeout);
		return def.promise;
	}

	async _start() {
		var results;
		if (this._started) {
			return;
		}
		this._started = true;
		results = [];
		while (this._started) {
			try {
				await this._analyze();
			} catch (error) {}
			results.push((await this.sleep(15000)));
		}
		return results;
	}

	close() {
		return this._started = false;
	}

	unwatch(path) {
		path = this.parseEnvironment(path);
		return delete this.paths[path];
	}

	async _analyze() {
		var _path, _paths, i, len, path, processing, results, stat;
		processing = Object.assign({}, this._stats);
		for (path in this.paths) {
			_paths = (await this._getpaths(path));
			for (i = 0, len = _paths.length; i < len; i++) {
				_path = _paths[i];
				await this._emit(_path, processing);
			}
		}
		results = [];
		for (path in processing) {
			stat = processing[path];
			this.emit("remove", path, stat);
			results.push(delete this._stats[path]);
		}
		return results;
	}

	async _emit(path, processing? ) {
		var e, f, files, i, len, old, results, stat, ufile;
		old = this._stats[path];
		try {
			stat = (await fs.lstatAsync(path));
			if (!old) {
				this.emit("add", path, stat);
			} else if (old.mtimeMs !== stat.mtimeMs) {

				// THIS portions helps to determine if file still being written, 
				// example when is downloading 
				let nstat = await fs.statAsync(path)
				while(true){
					await async.sleep(100)
					let newstat = await fs.statAsync(path)
					if(newstat.size == nstat.size){
						break 
					}
				}

				this.emit("change", path, stat, old);
			}
			this._stats[path] = stat;
		} catch (error) {
			e = error;
			if (e.code === "ENOENT" && old) {
				this.emit("remove", path, old);
				delete this._stats[path];
			}
		}
		if (processing) {
			delete processing[path];
		}
		if (stat.isDirectory()) {
			if (this.options.recursive) {
				files = (await fs.readdirAsync(path));
				results = [];
				for (i = 0, len = files.length; i < len; i++) {
					f = files[i];
					if ((!f.startsWith("./")) && (!f.startsWith("../"))) {
						ufile = Path.join(path, f);
						results.push((await this._emit(ufile)));
					} else {
						results.push(void 0);
					}
				}
				return results;
			}
		}
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

	_getpaths(path) {
		var def;
		def = this.deferred();
		Glob(path, function(er, files) {
			if (er) {
				return def.reject(er);
			}
			return def.resolve(files);
		});
		return def.promise;
	}

	parseEnvironment(path) {
		var reg;
		path = Path.normalize(path);
		reg = /\$(\w[\w|\_|\-|\d]+)/g;
		return path.replace(reg, function(a, b) {
			var ref;
			return (ref = process.env[b]) != null ? ref : a;
		});
	}

}

export default Watcher
