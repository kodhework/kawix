// Copyright 2019 Kodhe
// registry.js
// require npm modules easily. code written in coffeescript
var Registry;


import Semver from './semver';
import uniqid from '../util/uniqid';
import tar from '../compression/tar';
import fs from '../fs/mod';
import Crypto from 'crypto';
import Path from 'path';
import Child from 'child_process';
import Os from 'os';
import https from 'https';

if (!global.kawix) {
	throw new Error("Need require @kawix/core");
}

Registry = (function() {
	class Registry {
		constructor(options1 = {}) {
			this.options = options1;
			this.url = this.options.url || "https://registry.npmjs.org";
			this.installed = [];
			this._locks = {};
		}

		async _removedir(path, retry = 0) {
			var e, file, files, j, len, stat, ufile;
			try {
				files = (await fs.readdirAsync(path));
				for (j = 0, len = files.length; j < len; j++) {
					file = files[j];
					ufile = Path.join(path, file);
					stat = (await fs.statAsync(ufile));
					if (stat.isDirectory()) {
						await this._removedir(ufile);
					} else {
						await fs.unlinkAsync(ufile);
					}
				}
				return (await fs.rmdirAsync(path));
			} catch (error) {
				e = error;
				if (retry > 15) {
					throw e;
				}
				await this._sleep(100);
				return (await this._removedir(path, retry + 1));
			}
		}

		_fileExists(file) {
			return new Promise(function(resolve, reject) {
				return fs.access(file, fs.constants.F_OK, function(err) {
					if (err) {
						resolve(false);
					}
					return resolve(true);
				});
			});
		}

		_fileExists_2(file) {
			return new Promise(function(resolve, reject) {
				return fs.stat(file, function(err, stat) {
					if (err) {
						return resolve(false);
					}
					if ((Date.now() - stat.mtimeMs) < 4000) {
						return resolve(true);
					} else {
						fs.rmdirSync(file);
						return resolve(false);
					}
				});
			});
		}

		async _getPackageCacheInstall(module, version) {
			var folder, folder1, i, j, kawi, len, lock, part, parts, securename;
			securename = module; //.replace /\//g, '%2F'
			if (this.options.versioncontrol !== false) {
				securename += `@${version}`;
			}
			if (this.options.output) {
				folder = this.options.output;
			} else {
				kawi = process.env.KAWIX_CACHE_DIR || (Path.join(Os.homedir(), ".kawi"));
				if (!(await this._fileExists(kawi))) {
					await fs.mkdirAsync(kawi);
				}
				//console.info("heeeee ...")
				folder = Path.join(kawi, 'npm-inst');
			}
			if (!(await this._fileExists(folder))) {
				await fs.mkdirAsync(folder);
			}
			parts = securename.split("/");
			if (parts.length > 1) {
				folder1 = folder;
				for (i = j = 0, len = parts.length; j < len; i = ++j) {
					part = parts[i];
					if (i === (parts.length - 1)) {
						break;
					}
					folder1 = Path.join(folder1, part);
					if (!(await this._fileExists(folder1))) {
						await fs.mkdirAsync(folder1);
					}
				}
			}
			folder = Path.join(folder, securename);
			lock = folder + ".lock";
			return {
				//if not await @_fileExists(folder)
				//    await fs.mkdirAsync(folder)
				folder: folder,
				lock: lock
			};
		}

		async _getPackageCacheConfig(pack, version) {
			var config, file, folder, kawi, pack1, securename, tarball, transform;
			securename = pack;
			transform = {
				"<": "_lt",
				">": "_gt",
				"|": "_b",
				"/": "%2F",
				"?": "_q",
				"*": "_all_"
			};
			securename = securename.replace(/\*|\>|\<|\||\/|\?/g, function(a, b) {
				return transform[a];
			});
			pack1 = securename;
			securename += `@${version}`;
			securename = securename.replace(/\*|\>|\<|\||\/|\?/g, function(a, b) {
				return transform[a];
			});
			//pack1= pack.replace(/\//g, "%2F")
			kawi = process.env.KAWIX_CACHE_DIR || (Path.join(Os.homedir(), ".kawi"));
			if (!(await this._fileExists(kawi))) {
				await fs.mkdirAsync(kawi);
			}
			folder = Path.join(kawi, 'npm-packages');
			if (!(await this._fileExists(folder))) {
				await fs.mkdirAsync(folder);
			}
			tarball = Path.join(folder, securename + ".tar.gz");
			file = Path.join(folder, securename + ".json");
			if ((await this._fileExists(file))) {
				try {
					config = (await fs.readFileAsync(file, 'utf8'));
					config = JSON.parse(config);
				} catch (error) {
					config = null;
				}
			}
			if (!config) {
				config = {
					file: file
				};
				await fs.writeFileAsync(file, JSON.stringify(config, null, '\t'));
			}
			return {
				folder: folder,
				tarball: tarball,
				file: file,
				moduleinfo: config
			};
		}

		_filerequest(url, file) {
			var buf, cont, er, rej;
			buf = [];
			cont = null;
			er = function(e) {
				return rej(e);
			};
			rej = null;
			https.get(url, function(resp) {
				var st;
				if (resp.statusCode !== 200) {
					return er(Error(`Invalid response from registry. Status code ${resp.statusCode}`));
				}
				st = fs.createWriteStream(file);
				st.on("error", er);
				resp.pipe(st);
				st.on("finish", cont);
				return resp.on("error", er);
			}).on("error", er);
			return new Promise(function(resolve, reject) {
				cont = resolve;
				return rej = reject;
			});
		}

		_jsonrequest(url) {
			var buf, cont, er, rej;
			buf = [];
			cont = null;
			er = function(e) {
				return rej(e);
			};
			rej = null;
			https.get(url, function(resp) {
				if (resp.statusCode !== 200) {
					return er(Error(`Invalid response from registry. Status code ${resp.statusCode}`));
				}
				resp.on("data", function(d) {
					return buf.push(d);
				});
				resp.on("end", cont);
				return resp.on("error", er);
			}).on("error", er);
			return new Promise(function(resolve, reject) {
				cont = function() {
					var e, text;
					try {
						text = Buffer.concat(buf).toString('utf8');
						text = JSON.parse(text);
					} catch (error) {
						e = error;
						return reject(new Error(`Invalid response. Cannot parse as JSON: ${text}`));
					}
					return resolve(text);
				};
				return rej = reject;
			});
		}

		async _lock(file, timeout = 30000) {
			var e, good, stat, time;
			if (!file) {
				return;
			}
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

		async _getNpmInfo(cachedInfo, module) {
			var ref, ref1, securename, time, url;
			time = (ref = (ref1 = cachedInfo.moduleinfo.data) != null ? ref1.time : void 0) != null ? ref : 0;
			if (Date.now() - time < (10 * 60 * 1000)) {
				return;
			}
			// download an appropiate version
			securename = module.replace(/\//g, '%2F');
			url = `${this.url}/${securename}`;
			cachedInfo.moduleinfo.data = (await this._jsonrequest(url));
			cachedInfo.moduleinfo.data.time = Date.now();
			return (await fs.writeFileAsync(cachedInfo.moduleinfo.file, JSON.stringify(cachedInfo.moduleinfo, null, '\t')));
		}

		async _checkPackageCache(module, version) {
			var arg, cache, cachedInfo, data, j, json, k, len, len1, ref, ref1, resolvedversion, time, ver, versions;
			cachedInfo = (await this._getPackageCacheConfig(module, version));
			if (!cachedInfo.moduleinfo) {
				json = (await fs.readFileAsync(cachedInfo.file));
				cachedInfo.moduleinfo = JSON.parse(json) || {};
			}
			if (cachedInfo.moduleinfo.versions) {
				versions = Object.keys(cachedInfo.moduleinfo.versions);
				versions.sort(function(a, b) {
					if (a < b) {
						return 1;
					}
					if (a > b) {
						return -1;
					}
					return 0;
				});
				for (j = 0, len = versions.length; j < len; j++) {
					ver = versions[j];
					if (Semver.satisfies(ver, version)) {
						resolvedversion = ver;
					}
				}
			}
			if (!resolvedversion) {
				await this._getNpmInfo(cachedInfo, module);
				resolvedversion = null;
				data = cachedInfo.moduleinfo.data;
				versions = Object.keys(data.versions);
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
				if ((ref = data["dist-tags"]) != null ? ref[version] : void 0) {
					resolvedversion = (ref1 = data["dist-tags"]) != null ? ref1[version].version : void 0;
				} else {
					for (k = 0, len1 = versions.length; k < len1; k++) {
						ver = versions[k];
						if (ver === version || (Semver.satisfies(ver, version))) {
							resolvedversion = ver;
							break;
						}
					}
				}
				if (!resolvedversion) {
					throw new Error(`Cannot resolve module: ${module}@${version}`);
				}
			}
			cachedInfo = (await this._getPackageCacheConfig(module, resolvedversion));
			cache = (await this._getPackageCacheInstall(module, resolvedversion));
			time = Date.now();
			while ((await this._fileExists_2(cache.lock))) {
				if (Date.now() - time > 40000) {
					throw new Error("Error waiting access");
				}
				await this._sleep(20);
			}
			arg = {
				cachedInfo: cachedInfo,
				proposedInstall: cache,
				module: module,
				originalversion: version,
				version: resolvedversion
			};
			if ((await this._fileExists(cache.folder))) {
				arg.cached = cache.folder;
				return arg;
			} else {
				return arg;
			}
		}

		async _resolveDependencies(moduledesc, pjson) {
			var dep, moduledep, nod, options, ref, ref1, reg, results, version;
			if (pjson.dependencies) {
				moduledesc.dependencies = pjson.dependencies;
				moduledesc.resolveddependencies = [];
				if (!this.options.parent) {
					nod = Path.join(moduledesc.folder, "node_modules");
					if (!(await this._fileExists(nod))) {
						try {
							await fs.mkdirAsync(nod);
						} catch (error) {}
					}
				} else {
					nod = this.options.output;
				}
				ref = pjson.dependencies;
				results = [];
				for (dep in ref) {
					version = ref[dep];
					if (((ref1 = pjson.bundleDependencies) != null ? typeof ref1.indexOf === "function" ? ref1.indexOf(dep) : void 0 : void 0) >= 0) {
						continue;
					}
					// resolve dep
					options = Object.assign({}, this.options);
					options.output = nod;
					options.parent = moduledesc;
					options.versioncontrol = false;
					reg = new Registry(options);
					// ignore cache, for force to reinstall
					moduledep = (await reg.resolve(dep, version, true));
					results.push(moduledesc.resolveddependencies.push(moduledep));
				}
				return results;
			}
		}

		async require(module, version) {
			var i, moduledesc;
			if (!version) {
				i = module.lastIndexOf("@");
				if (i > 0) {
					version = module.substring(i + 1);
					module = module.substring(0, i);
				} else {
					version = "*";
				}
			}
			moduledesc = (await this.resolve(module, version));
			return require(moduledesc.folder);
		}

		_getProposedFolder(module, version) {}

		async resolve(module, version, ignorecache) {
			var binding, binding_check, cacher, e, er, err, i, ignoredependencies, j, len, moduledesc, newr, npmfile, npmmodule, p, pjson, promise, ref, ver, versions;
			if (!version) {
				i = module.lastIndexOf("@");
				if (i > 0) {
					version = module.substring(i + 1);
					module = module.substring(0, i);
				} else {
					version = "*";
				}
			}
			cacher = Registry.cache[module];
			if (cacher) {
				versions = Object.keys(cacher);
				versions.sort(function(a, b) {
					if (a < b) {
						return 1;
					}
					if (a > b) {
						return -1;
					}
					return 0;
				});
				for (j = 0, len = versions.length; j < len; j++) {
					ver = versions[j];
					if (Semver.satisfies(ver, version)) {
						moduledesc = cacher[ver];
						break;
					}
				}
			}
			if (ignorecache && moduledesc) {
				// only use cache for explicit requested modules
				// but rewrite for dependencies
				moduledesc = null;
			}
			//if Path.basename(moduledesc.folder) isnt module
			// reinstall in options?.parent?.folder
			// make a symlink
			/*
			else if module.indexOf("request") >= 0
				console.info(moduledesc.folder, @options?.parent?.folder)
			*/
			if (!moduledesc) {
				try {
					moduledesc = (await this._resolve(module, version));
				} catch (error) {
					e = error;
					er = new Error(`Failed loading module: ${module}@{version}: ${e.message}`);
					er.innerException = e;
					throw e;
				}
				// save cache
				Registry.cache[moduledesc.name] = (ref = Registry.cache[moduledesc.name]) != null ? ref : {};
				if (!Registry.cache[moduledesc.name][moduledesc.version]) {
					Registry.cache[moduledesc.name][moduledesc.version] = moduledesc;
				}
			}
			ignoredependencies = this.options.ignoredependencies;
			if (!moduledesc.packageinfo) {
				if (this.options.nativeEnabled) {
					binding = Path.join(moduledesc.folder, "binding.gyp");
					binding_check = Path.join(moduledesc.folder, "binding-installed--.gyp");
					// is a native module?
					if ((await this._fileExists(binding)) && (!(await this._fileExists(binding_check)))) {
						// download NPM
						newr = new Registry({});
						npmmodule = (await newr.resolve("npm@6.9.0"));
						npmfile = Path.join(npmmodule.folder, "bin", "npm-cli.js");
						// execute npm install on folder
						p = Child.spawn(process.execPath, [npmfile, "install", "--unsafe-perm"], {
							env: Object.assign({
								ELECTRON_RUN_AS_NODE: 1
							}, process.env),
							cwd: moduledesc.folder
						});
						err = [];
						promise = new Promise(function(a, b) {
							p.stderr.on("data", function(data) {
								process.stderr.write(data);
								data = data.toString();
								if (data.indexOf("ERR!") >= 0) {
									return err.push(data);
								}
							});
							p.stdout.on("data", function(data) {
								process.stdout.write(data);
								data = data.toString();
								if (data.indexOf("ERR!") >= 0) {
									return err.push(data);
								}
							});
							return p.on("exit", function() {
								if (err.length) {
									return b(new Error(err.join("\n")));
								} else {
									return a();
								}
							});
						});
						await promise;
						await fs.mkdirAsync(binding_check);
					}
				}
				pjson = Path.join(moduledesc.folder, "package.json");
				pjson = (await fs.readFileAsync(pjson, 'utf8'));
				pjson = JSON.parse(pjson);
				moduledesc.packageinfo = pjson;
				if (pjson.main) {
					moduledesc.main = Path.normalize(Path.join(moduledesc.folder, pjson.main));
				} else {
					moduledesc.main = Path.join(moduledesc.folder, "index.js");
				}
			}
			if (!ignoredependencies) {
				try {
					if (!moduledesc.fullyloaded) {
						await this._resolveDependencies(moduledesc, moduledesc.packageinfo);
						moduledesc.fullyloaded = true;
					}
				} catch (error) {
					e = error;
					//await @_removedir folder
					throw e;
				}
			}
			return moduledesc;
		}

		async _resolve(module, version) {
			var result;
			result = (await this._checkPackageCache(module, version));
			if (result.cached) {
				return {
					folder: result.cached,
					name: module,
					version: result.version,
					localtarball: result.cachedInfo.tarball
				};
			} else {
				await this._downloadCache(result);
				return {
					folder: result.proposedInstall.folder,
					name: module,
					version: result.version,
					localtarball: result.cachedInfo.tarball
				};
			}
		}

		async _maybeRemoveProposed(folder, {module, originalversion, version}) {
			var e, nod, pjson;
			if (this.options.parent) {
				pjson = Path.join(folder, "package.json");
				try {
					pjson = (await fs.readFileAsync(pjson, 'utf8'));
				} catch (error) {
					e = error;
					if (e.code !== 'ENOENT') {
						throw e;
					}
				}
				try {
					pjson = JSON.parse(pjson);
				} catch (error) {
					e = error;
					return (await this._removedir(folder));
				}
				if (Semver.satisfies(pjson.version, originalversion)) {
					return {
						// no remove and no continue
						folder: folder,
						name: module,
						version: pjson.version
					};
				} else {
					// save inside node_modules
					nod = Path.join(this.options.parent.folder, "node_modules");
					if (!(await this._fileExists(nod))) {
						await fs.mkdirAsync(nod);
					}
					return {
						change: true,
						folder: Path.join(nod, Path.basename(folder))
					};
				}
			}
			return (await this._removedir(folder));
		}

		_verifyDownlaod(dist, tarball) {
			var hash;
			hash = Crypto.createHash('sha1');
			return new Promise(function(resolve, reject) {
				var inst;
				inst = fs.createReadStream(tarball);
				inst.on("error", reject);
				inst.on("data", function(d) {
					return hash.update(d);
				});
				return inst.on("end", function() {
					var sha1;
					sha1 = hash.digest('hex');
					if (sha1 !== dist.shasum) {
						return reject(new Error(`Shasum comprobation failed ${sha1}. Expected: ${dist.shasum}`));
					}
					return resolve();
				});
			});
		}

		async _downloadCache(result) {
			var cachedInfo, contents, dist, e, module, proposedInstall, ref, ref1, removeoptions, temppath, version;
			module = result.module;
			version = result.version;
			cachedInfo = result.cachedInfo;
			proposedInstall = result.proposedInstall;
			if (!(await this._fileExists(cachedInfo.tarball))) {
				// download
				await this._lock(cachedInfo.tarball + ".lock");
				try {
					if (!cachedInfo.moduleinfo.data) {
						await this._getNpmInfo(cachedInfo, module);
					}
					dist = (ref = cachedInfo.moduleinfo.data.versions[result.version]) != null ? ref.dist : void 0;
					if (!(dist != null ? dist.tarball : void 0)) {
						throw new Error(`Failed to get a tarball for module ${module}@${version}`);
					}
					// here now downloaded the tarball
					await this._filerequest(dist.tarball, cachedInfo.tarball);
					// verify download
					await this._verifyDownlaod(dist, cachedInfo.tarball);
					cachedInfo.moduleinfo.versions = (ref1 = cachedInfo.moduleinfo.versions) != null ? ref1 : {};
					cachedInfo.moduleinfo.versions[version] = {
						version: version,
						name: module,
						install: proposedInstall,
						dist: dist,
						tarball: cachedInfo.tarball
					};
					await fs.writeFileAsync(cachedInfo.file, JSON.stringify(cachedInfo.moduleinfo, null, '\t'));
				} catch (error) {
					e = error;
					// delete tarball
					if ((await this._fileExists(cachedInfo.tarball))) {
						await fs.unlinkAsync(cachedInfo.tarball);
					}
					throw e;
				} finally {
					await this._unlock(cachedInfo.tarball + ".lock");
				}
			}
			// with tarball now can extract
			temppath = proposedInstall.folder + ".temp-" + uniqid();
			await this._lock(proposedInstall.lock);
			try {
				await fs.mkdirAsync(temppath);
				// extract to this folder
				await tar.x({
					file: cachedInfo.tarball,
					C: temppath
				});
				contents = (await fs.readdirAsync(temppath));
				if (!contents.length) {
					throw new Error("Failed extracting tarball");
				}
				if ((await this._fileExists(proposedInstall.folder))) {
					removeoptions = (await this._maybeRemoveProposed(proposedInstall.folder, result));
					if (removeoptions) {
						if (removeoptions.changed) {
							proposedInstall.folder = removeoptions.folder;
						} else {
							return;
						}
					}
				}
				//console.info("changing proposed folder: ", proposedInstall.folder)
				return (await fs.renameAsync(Path.join(temppath, contents[0]), proposedInstall.folder));
			} catch (error) {
				e = error;
				if (e.message.indexOf("zlib") >= 0) {
					// retry
					await fs.unlinkAsync(cachedInfo.tarball);
					return (await this._downloadCache(result));
				}
				throw e;
			} finally {
				await this._removedir(temppath);
				await this._unlock(proposedInstall.lock);
			}
		}

		_sleep(timeout = 100) {
			return new Promise(function(resolve) {
				return setTimeout(resolve, timeout);
			});
		}

	};

	Registry.cache = {};

	return Registry;

}).call(this);

export default Registry;
