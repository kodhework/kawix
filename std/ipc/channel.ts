var IPC;

import Net from 'net';
import Os from 'os';
import Path from 'path';
import {
	EventEmitter
} from 'events';
import fs from '../fs/mod';
import uniqid from '../util/uniqid';
import Exception from '../util/exception';

IPC = (function() {
	class IPC extends EventEmitter {
		constructor(id1) {
			super();
			this.id = id1;
			this._deferred = {};
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

		_setAddress() {
			return this._address = value;
		}

		_getAddress() {
			return this._address;
		}

		async connect(address) {
			var def, listen, socket;
			if (address) {
				this._setAddress(address);
			}
			listen = this._address;
			this.socket = socket = new Net.Socket();
			socket.connect(listen);
			def = this.deferred();
			socket.once("connect", def.resolve);
			socket.once("error", def.reject);
			await def.promise;
			// attach responses
			this._type = 'client';
			return this._connection(this.socket);
		}

		async listen(address) {
			var def, e, listen, socket;
			if (address) {
				this._setAddress(address);
			}
			listen = this._address;
			try {
				// try a connect for see is being used
				socket = new Net.Socket();
				socket.connect(listen);
				def = this.deferred();
				socket.once("connect", def.resolve);
				socket.once("error", def.reject);
				await def.promise;
				Exception.create(`Cannot listen to ${listen}, address is in use.`).raise();
			} catch (error1) {
				e = error1;
				if (!(e.code === "ECONNREFUSED" || e.code === "ENOENT")) {
					throw e;
				}
			}
			if (Os.platform() !== "win32") {
				if ((await this._checkFileExists(listen))) {
					await fs.unlinkAsync(listen);
				}
			}
			this._net = Net.createServer(this._connection.bind(this));
			this._net.on("error", function(er) {
				return console.error("Channel error: ", er);
			});
			def = this.deferred();
			this._net.once("error", def.reject);
			this._net.once("listening", def.resolve);
			this._net.listen(listen);
			this._type = 'server';
			return (await def.promise);
		}

		_in_response(state, socket, response) {
			var e, res;
			if (!response) {
				return;
			}
			try {
				res = response;
				if (typeof response === "string") {
					res = JSON.parse(response);
				}
			} catch (error1) {
				e = error1;
				return console.error("Invalid response from server: " + response);
			}
			if (this._in_response_i(state, socket, res) === false) {
				//console.info "Not promise available for result"
				return this.emit("response", state, socket, res);
			}
		}

		_in_response_i(state, socket, res) {
			var def, excep;
			def = this._deferred[res.uid];
			if (def) {
				delete this._deferred[res.uid];
				if (res.status === 'error') {
					excep = Exception.create(res.error.message).putCode(res.error.code).putStack(res.error.stack);
					def.reject(excep);
				} else {
					def.resolve(res.value);
				}
			} else {
				return false;
			}
		}

		async _in_request(state, socket, request) {
			var e, error, mod, name, req, response, result, target;
			if (!request) {
				return;
			}
			try {
				req = JSON.parse(request);
			} catch (error1) {
				e = error1;
				return console.error("Invalid request from client: " + request);
			}
			if (req.type === 'response') {
				return this._in_response(state, socket, req);
			}
			result = null;
			error = null;
			try {
				if (req.action === "log") {
					console.log.apply(console, req.args);
				} else if (req.action === "log.error") {
					console.error.apply(console, req.args);
				} else if (req.action === "log.info") {
					console.info.apply(console, req.args);
				} else if (req.action === "log.warn") {
					console.warn.apply(console, req.args);
				} else if (req.action === "import") {
					// import a file
					mod = (await import(req.args[0]));
					result = true;
					if (mod.ipcInvoke) {
						result = (await mod.ipcInvoke(state, socket, req.params, this));
					} else if (mod.ipcCreate || mod.create) {
						state[req.name || "mod"] = (await (mod.ipcCreate || mod.create)(state, socket, req.params, this));
					} else {
						state[req.name || "mod"] = mod;
					}
				} else if (req.action === "assign") {
					state[req.name] = req.value;
					result = true;
				} else if (req.action === "call") {
					name = req.name || "mod";
					target = state[name];
					if (!target) {
						throw Exception.create(`Invalid identifier ${name}. You need make an import`);
					}
					if (!target[req.method]) {
						throw Exception.create(`${name}.${req.method} is not a function `);
					}
					result = (await target[req.method].apply(target, req.args));
				}
			} catch (error1) {
				e = error1;
				error = e;
			}
			if (error) {
				response = {
					status: 'error',
					uid: req.uid,
					type: 'response',
					error: {
						code: error.code,
						message: error.message,
						stack: error.stack
					}
				};
			} else {
				response = {
					type: 'response',
					status: 'ok',
					value: result,
					uid: req.uid
				};
			}
			return socket.write(JSON.stringify(response) + "\n");
		}

		async send(request, timeout = 0) {
			var def, int1, result, str;
			if (!request.uid) {
				request.uid = uniqid();
			}
			if (this._type === 'client') {
				str = JSON.stringify(request) + "\n";
				this.socket.write(str);
				if (request.nowait) {
					return;
				}
				// wait a response
				def = this.deferred();
				this._deferred[request.uid] = def;
				if (timeout) {
					int1 = setTimeout(() => {
						delete this._deferred[request.uid];
						return def.reject(Exception.create("Timedout waiting response").putCode("TIMEDOUT"));
					}, timeout);
					result = (await def.promise);
					clearTimeout(int1);
					return result;
				}
				return (await def.promise);
			}
		}

		close() {
			var ref, ref1;
			this._stopped = true;
			if ((ref = this.socket) != null) {
				if (typeof ref.close === "function") {
					ref.close();
				}
			}
			return (ref1 = this._net) != null ? typeof ref1.close === "function" ? ref1.close() : void 0 : void 0;
		}

		// functions
		_import(file, params) {
			return this.send({
				action: 'import',
				args: [file],
				params: params
			});
		}

		_call(target, method, args) {
			return this.send({
				action: 'call',
				args: args,
				method: method,
				name: target
			});
		}

		_connection(socket) {
			var analyzeRequest, buffer, self, state;
			buffer = [];
			self = this;
			state = {};
			analyzeRequest = function() {
				var buf, i, j, len, request, requests, results, str;
				buf = Buffer.concat(buffer);
				buffer = [];
				i = buf.lastIndexOf(10);
				str = buf.slice(0, i);
				buf = buf.slice(i);
				if (buf.length) {
					buffer.push(buf);
				}
				requests = str.toString().split("\n");
				if (requests.length) {
// process request
					results = [];
					for (j = 0, len = requests.length; j < len; j++) {
						request = requests[j];
						results.push(self._in_request(state, socket, request));
					}
					return results;
				}
			};
			socket.on("data", function(b) {
				var y;
				buffer.push(b);
				y = b.indexOf(10);
				if (y >= 0) {
					return analyzeRequest(y);
				}
			});
			socket.on("error", function(e) {
				return console.error("Socket underlying error: ", e);
			});
			if (this._type === 'client') {
				self.connected = true;
				return socket.on("close", function() {
					var id, ref, val;
					ref = self._deferred;
					for (id in ref) {
						val = ref[id];
						val.reject(Exception.create("IPC Channel disconnected").putCode("DISCONNECTED"));
					}
					self.connected = false;
					self._deferred = {};
					if (!self._stopped) {
						return self.connect();
					}
				});
			} else {
				return socket.on("close", function() {
					return console.info("A CLIENT WAS DISCONNECTED");
				});
			}
		}

	};

	Object.defineProperty(IPC.prototype, 'address', {
		get: IPC.prototype._getAddress,
		set: IPC.prototype._setAddress
	});

	return IPC;

}).call(this);

export default IPC;
