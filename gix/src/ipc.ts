

import Path from 'path';
import ipc from './lib/_ipc';
import Os from 'os';
import fs from './lib/_fs';

export class IPC extends ipc {
	private _address
	constructor(id) {
		super(id);
	}

	async listen() {
		if (!this._address) {
			this._address = (await this._getListenPath());
		}
		return (await super.listen(...arguments));
	}

	async connect() {
		if (!this._address) {
			this._address = (await this._getListenPath());
		}
		return (await super.connect(...arguments));
	}

	async _getListenPath() {
		var path1;
		if (process.env.KAWIX_GIX_CHANNEL_PATH) {
			path1 = process.env.KAWIX_GIX_CHANNEL_PATH;
		} else {
			path1 = Path.join(Os.homedir(), ".kawi");
			path1 = Path.join(path1, ".sockets");
			if (!(await this._checkFileExists(path1))) {
				await fs.mkdirAsync(path1);
			}
			if (process.env.KAWIX_GIX_CHANNEL_NAME) {
				path1 = Path.join(path1, process.env.KAWIX_GIX_CHANNEL_NAME);
			} else {
				path1 = Path.join(path1, "gix");
			}
			if (Os.platform() === "win32") {
				if (path1[1] === ":") {
					path1 = path1.substring(2).replace(/\\/g, '/');
				}
				if (this.id) {
					path1 += this.id;
				}
				return "//./pipe/" + path1;
			}
		}
		if (this.id) {
			path1 += "." + this.id;
		}
		return path1;
	}

	_getAddress() {
		if (!this._address) {

		}
	}

};

export default IPC;
