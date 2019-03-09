(function(){
	var fileData=[]
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 12,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135004,
		"size": 12,
		"blocks": 3,
		"atimeMs": 1551500646008.6226,
		"mtimeMs": 1551490330812.8418,
		"ctimeMs": 1551490330812.8418,
		"birthtimeMs": 1551490330812.8418,
		"atime": "2019-03-02T04:24:06.009Z",
		"mtime": "2019-03-02T01:32:10.813Z",
		"ctime": "2019-03-02T01:32:10.813Z",
		"birthtime": "2019-03-02T01:32:10.813Z",
		"isdirectory": true
	},
	"filename": ""
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135131,
		"size": 6,
		"blocks": 1,
		"atimeMs": 1551500646012.6226,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:24:06.013Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isdirectory": true
	},
	"filename": "chownr"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2560,
		"ino": 135019,
		"size": 2488,
		"blocks": 4,
		"atimeMs": 1551500530962.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330696.8394,
		"birthtimeMs": 1551490330696.8394,
		"atime": "2019-03-02T04:22:10.962Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.697Z",
		"birthtime": "2019-03-02T01:32:10.697Z",
		"isfile": true
	},
	"filename": "chownr/chownr.js",
	"content": "'use strict'\nconst fs = require('fs')\nconst path = require('path')\n\n/* istanbul ignore next */\nconst LCHOWN = fs.lchown ? 'lchown' : 'chown'\n/* istanbul ignore next */\nconst LCHOWNSYNC = fs.lchownSync ? 'lchownSync' : 'chownSync'\n\n// fs.readdir could only accept an options object as of node v6\nconst nodeVersion = process.version\nlet readdir = (path, options, cb) => fs.readdir(path, options, cb)\nlet readdirSync = (path, options) => fs.readdirSync(path, options)\n/* istanbul ignore next */\nif (/^v4\\./.test(nodeVersion))\n  readdir = (path, options, cb) => fs.readdir(path, cb)\n\nconst chownrKid = (p, child, uid, gid, cb) => {\n  if (typeof child === 'string')\n    return fs.lstat(path.resolve(p, child), (er, stats) => {\n      if (er)\n        return cb(er)\n      stats.name = child\n      chownrKid(p, stats, uid, gid, cb)\n    })\n\n  if (child.isDirectory()) {\n    chownr(path.resolve(p, child.name), uid, gid, er => {\n      if (er)\n        return cb(er)\n      fs[LCHOWN](path.resolve(p, child.name), uid, gid, cb)\n    })\n  } else\n    fs[LCHOWN](path.resolve(p, child.name), uid, gid, cb)\n}\n\n\nconst chownr = (p, uid, gid, cb) => {\n  readdir(p, { withFileTypes: true }, (er, children) => {\n    // any error other than ENOTDIR or ENOTSUP means it's not readable,\n    // or doesn't exist.  give up.\n    if (er && er.code !== 'ENOTDIR' && er.code !== 'ENOTSUP')\n      return cb(er)\n    if (er || !children.length) return fs[LCHOWN](p, uid, gid, cb)\n\n    let len = children.length\n    let errState = null\n    const then = er => {\n      if (errState) return\n      if (er) return cb(errState = er)\n      if (-- len === 0) return fs[LCHOWN](p, uid, gid, cb)\n    }\n\n    children.forEach(child => chownrKid(p, child, uid, gid, then))\n  })\n}\n\nconst chownrKidSync = (p, child, uid, gid) => {\n  if (typeof child === 'string') {\n    const stats = fs.lstatSync(path.resolve(p, child))\n    stats.name = child\n    child = stats\n  }\n\n  if (child.isDirectory())\n    chownrSync(path.resolve(p, child.name), uid, gid)\n\n  fs[LCHOWNSYNC](path.resolve(p, child.name), uid, gid)\n}\n\nconst chownrSync = (p, uid, gid) => {\n  let children\n  try {\n    children = readdirSync(p, { withFileTypes: true })\n  } catch (er) {\n    if (er && er.code === 'ENOTDIR' && er.code !== 'ENOTSUP')\n      return fs[LCHOWNSYNC](p, uid, gid)\n    throw er\n  }\n\n  if (children.length)\n    children.forEach(child => chownrKidSync(p, child, uid, gid))\n\n  return fs[LCHOWNSYNC](p, uid, gid)\n}\n\nmodule.exports = chownr\nchownr.sync = chownrSync\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2048,
		"ino": 135383,
		"size": 1540,
		"blocks": 4,
		"atimeMs": 1551500604731.8352,
		"mtimeMs": 1551490330780.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:23:24.732Z",
		"mtime": "2019-03-02T01:32:10.781Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isfile": true
	},
	"filename": "chownr/package.json",
	"content": "{\n  \"_from\": \"chownr@^1.1.1\",\n  \"_id\": \"chownr@1.1.1\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha512-j38EvO5+LHX84jlo6h4UzmOwi0UgW61WRyPtJz4qaadK5eY3BTS5TY/S1Stc3Uk2lIM6TPevAlULiEJwie860g==\",\n  \"_location\": \"/chownr\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"range\",\n    \"registry\": true,\n    \"raw\": \"chownr@^1.1.1\",\n    \"name\": \"chownr\",\n    \"escapedName\": \"chownr\",\n    \"rawSpec\": \"^1.1.1\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"^1.1.1\"\n  },\n  \"_requiredBy\": [\n    \"/tar\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/chownr/-/chownr-1.1.1.tgz\",\n  \"_shasum\": \"54726b8b8fff4df053c42187e801fb4412df1494\",\n  \"_spec\": \"chownr@^1.1.1\",\n  \"_where\": \"/disk1/projects/@kawix/std/compression/tar/node_modules/tar\",\n  \"author\": {\n    \"name\": \"Isaac Z. Schlueter\",\n    \"email\": \"i@izs.me\",\n    \"url\": \"http://blog.izs.me/\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/isaacs/chownr/issues\"\n  },\n  \"bundleDependencies\": false,\n  \"deprecated\": false,\n  \"description\": \"like `chown -R`\",\n  \"devDependencies\": {\n    \"mkdirp\": \"0.3\",\n    \"rimraf\": \"\",\n    \"tap\": \"^12.0.1\"\n  },\n  \"files\": [\n    \"chownr.js\"\n  ],\n  \"homepage\": \"https://github.com/isaacs/chownr#readme\",\n  \"license\": \"ISC\",\n  \"main\": \"chownr.js\",\n  \"name\": \"chownr\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git://github.com/isaacs/chownr.git\"\n  },\n  \"scripts\": {\n    \"postpublish\": \"git push origin --all; git push origin --tags\",\n    \"postversion\": \"npm publish\",\n    \"preversion\": \"npm test\",\n    \"test\": \"tap test/*.js --cov\"\n  },\n  \"version\": \"1.1.1\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135272,
		"size": 6,
		"blocks": 1,
		"atimeMs": 1551500646012.6226,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:24:06.013Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isdirectory": true
	},
	"filename": "fs-minipass"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 9216,
		"ino": 135341,
		"size": 8967,
		"blocks": 9,
		"atimeMs": 1551500530978.4263,
		"mtimeMs": 1551490330696.8394,
		"ctimeMs": 1551490330696.8394,
		"birthtimeMs": 1551490330696.8394,
		"atime": "2019-03-02T04:22:10.978Z",
		"mtime": "2019-03-02T01:32:10.697Z",
		"ctime": "2019-03-02T01:32:10.697Z",
		"birthtime": "2019-03-02T01:32:10.697Z",
		"isfile": true
	},
	"filename": "fs-minipass/index.js",
	"content": "'use strict'\nconst MiniPass = require('minipass')\nconst EE = require('events').EventEmitter\nconst fs = require('fs')\n\n// for writev\nconst binding = process.binding('fs')\nconst writeBuffers = binding.writeBuffers\nconst FSReqWrap = binding.FSReqWrap\n\nconst _autoClose = Symbol('_autoClose')\nconst _close = Symbol('_close')\nconst _ended = Symbol('_ended')\nconst _fd = Symbol('_fd')\nconst _finished = Symbol('_finished')\nconst _flags = Symbol('_flags')\nconst _flush = Symbol('_flush')\nconst _handleChunk = Symbol('_handleChunk')\nconst _makeBuf = Symbol('_makeBuf')\nconst _mode = Symbol('_mode')\nconst _needDrain = Symbol('_needDrain')\nconst _onerror = Symbol('_onerror')\nconst _onopen = Symbol('_onopen')\nconst _onread = Symbol('_onread')\nconst _onwrite = Symbol('_onwrite')\nconst _open = Symbol('_open')\nconst _path = Symbol('_path')\nconst _pos = Symbol('_pos')\nconst _queue = Symbol('_queue')\nconst _read = Symbol('_read')\nconst _readSize = Symbol('_readSize')\nconst _reading = Symbol('_reading')\nconst _remain = Symbol('_remain')\nconst _size = Symbol('_size')\nconst _write = Symbol('_write')\nconst _writing = Symbol('_writing')\nconst _defaultFlag = Symbol('_defaultFlag')\n\nclass ReadStream extends MiniPass {\n  constructor (path, opt) {\n    opt = opt || {}\n    super(opt)\n\n    this.writable = false\n\n    if (typeof path !== 'string')\n      throw new TypeError('path must be a string')\n\n    this[_fd] = typeof opt.fd === 'number' ? opt.fd : null\n    this[_path] = path\n    this[_readSize] = opt.readSize || 16*1024*1024\n    this[_reading] = false\n    this[_size] = typeof opt.size === 'number' ? opt.size : Infinity\n    this[_remain] = this[_size]\n    this[_autoClose] = typeof opt.autoClose === 'boolean' ?\n      opt.autoClose : true\n\n    if (typeof this[_fd] === 'number')\n      this[_read]()\n    else\n      this[_open]()\n  }\n\n  get fd () { return this[_fd] }\n  get path () { return this[_path] }\n\n  write () {\n    throw new TypeError('this is a readable stream')\n  }\n\n  end () {\n    throw new TypeError('this is a readable stream')\n  }\n\n  [_open] () {\n    fs.open(this[_path], 'r', (er, fd) => this[_onopen](er, fd))\n  }\n\n  [_onopen] (er, fd) {\n    if (er)\n      this[_onerror](er)\n    else {\n      this[_fd] = fd\n      this.emit('open', fd)\n      this[_read]()\n    }\n  }\n\n  [_makeBuf] () {\n    return Buffer.allocUnsafe(Math.min(this[_readSize], this[_remain]))\n  }\n\n  [_read] () {\n    if (!this[_reading]) {\n      this[_reading] = true\n      const buf = this[_makeBuf]()\n      /* istanbul ignore if */\n      if (buf.length === 0) return process.nextTick(() => this[_onread](null, 0, buf))\n      fs.read(this[_fd], buf, 0, buf.length, null, (er, br, buf) =>\n        this[_onread](er, br, buf))\n    }\n  }\n\n  [_onread] (er, br, buf) {\n    this[_reading] = false\n    if (er)\n      this[_onerror](er)\n    else if (this[_handleChunk](br, buf))\n      this[_read]()\n  }\n\n  [_close] () {\n    if (this[_autoClose] && typeof this[_fd] === 'number') {\n      fs.close(this[_fd], _ => this.emit('close'))\n      this[_fd] = null\n    }\n  }\n\n  [_onerror] (er) {\n    this[_reading] = true\n    this[_close]()\n    this.emit('error', er)\n  }\n\n  [_handleChunk] (br, buf) {\n    let ret = false\n    // no effect if infinite\n    this[_remain] -= br\n    if (br > 0)\n      ret = super.write(br < buf.length ? buf.slice(0, br) : buf)\n\n    if (br === 0 || this[_remain] <= 0) {\n      ret = false\n      this[_close]()\n      super.end()\n    }\n\n    return ret\n  }\n\n  emit (ev, data) {\n    switch (ev) {\n      case 'prefinish':\n      case 'finish':\n        break\n\n      case 'drain':\n        if (typeof this[_fd] === 'number')\n          this[_read]()\n        break\n\n      default:\n        return super.emit(ev, data)\n    }\n  }\n}\n\nclass ReadStreamSync extends ReadStream {\n  [_open] () {\n    let threw = true\n    try {\n      this[_onopen](null, fs.openSync(this[_path], 'r'))\n      threw = false\n    } finally {\n      if (threw)\n        this[_close]()\n    }\n  }\n\n  [_read] () {\n    let threw = true\n    try {\n      if (!this[_reading]) {\n        this[_reading] = true\n        do {\n          const buf = this[_makeBuf]()\n          /* istanbul ignore next */\n          const br = buf.length === 0 ? 0 : fs.readSync(this[_fd], buf, 0, buf.length, null)\n          if (!this[_handleChunk](br, buf))\n            break\n        } while (true)\n        this[_reading] = false\n      }\n      threw = false\n    } finally {\n      if (threw)\n        this[_close]()\n    }\n  }\n\n  [_close] () {\n    if (this[_autoClose] && typeof this[_fd] === 'number') {\n      try {\n        fs.closeSync(this[_fd])\n      } catch (er) {}\n      this[_fd] = null\n      this.emit('close')\n    }\n  }\n}\n\nclass WriteStream extends EE {\n  constructor (path, opt) {\n    opt = opt || {}\n    super(opt)\n    this.readable = false\n    this[_writing] = false\n    this[_ended] = false\n    this[_needDrain] = false\n    this[_queue] = []\n    this[_path] = path\n    this[_fd] = typeof opt.fd === 'number' ? opt.fd : null\n    this[_mode] = opt.mode === undefined ? 0o666 : opt.mode\n    this[_pos] = typeof opt.start === 'number' ? opt.start : null\n    this[_autoClose] = typeof opt.autoClose === 'boolean' ?\n      opt.autoClose : true\n\n    // truncating makes no sense when writing into the middle\n    const defaultFlag = this[_pos] !== null ? 'r+' : 'w'\n    this[_defaultFlag] = opt.flags === undefined\n    this[_flags] = this[_defaultFlag] ? defaultFlag : opt.flags\n\n    if (this[_fd] === null)\n      this[_open]()\n  }\n\n  get fd () { return this[_fd] }\n  get path () { return this[_path] }\n\n  [_onerror] (er) {\n    this[_close]()\n    this[_writing] = true\n    this.emit('error', er)\n  }\n\n  [_open] () {\n    fs.open(this[_path], this[_flags], this[_mode],\n      (er, fd) => this[_onopen](er, fd))\n  }\n\n  [_onopen] (er, fd) {\n    if (this[_defaultFlag] &&\n        this[_flags] === 'r+' &&\n        er && er.code === 'ENOENT') {\n      this[_flags] = 'w'\n      this[_open]()\n    } else if (er)\n      this[_onerror](er)\n    else {\n      this[_fd] = fd\n      this.emit('open', fd)\n      this[_flush]()\n    }\n  }\n\n  end (buf, enc) {\n    if (buf)\n      this.write(buf, enc)\n\n    this[_ended] = true\n\n    // synthetic after-write logic, where drain/finish live\n    if (!this[_writing] && !this[_queue].length &&\n        typeof this[_fd] === 'number')\n      this[_onwrite](null, 0)\n  }\n\n  write (buf, enc) {\n    if (typeof buf === 'string')\n      buf = new Buffer(buf, enc)\n\n    if (this[_ended]) {\n      this.emit('error', new Error('write() after end()'))\n      return false\n    }\n\n    if (this[_fd] === null || this[_writing] || this[_queue].length) {\n      this[_queue].push(buf)\n      this[_needDrain] = true\n      return false\n    }\n\n    this[_writing] = true\n    this[_write](buf)\n    return true\n  }\n\n  [_write] (buf) {\n    fs.write(this[_fd], buf, 0, buf.length, this[_pos], (er, bw) =>\n      this[_onwrite](er, bw))\n  }\n\n  [_onwrite] (er, bw) {\n    if (er)\n      this[_onerror](er)\n    else {\n      if (this[_pos] !== null)\n        this[_pos] += bw\n      if (this[_queue].length)\n        this[_flush]()\n      else {\n        this[_writing] = false\n\n        if (this[_ended] && !this[_finished]) {\n          this[_finished] = true\n          this[_close]()\n          this.emit('finish')\n        } else if (this[_needDrain]) {\n          this[_needDrain] = false\n          this.emit('drain')\n        }\n      }\n    }\n  }\n\n  [_flush] () {\n    if (this[_queue].length === 0) {\n      if (this[_ended])\n        this[_onwrite](null, 0)\n    } else if (this[_queue].length === 1)\n      this[_write](this[_queue].pop())\n    else {\n      const iovec = this[_queue]\n      this[_queue] = []\n      writev(this[_fd], iovec, this[_pos],\n        (er, bw) => this[_onwrite](er, bw))\n    }\n  }\n\n  [_close] () {\n    if (this[_autoClose] && typeof this[_fd] === 'number') {\n      fs.close(this[_fd], _ => this.emit('close'))\n      this[_fd] = null\n    }\n  }\n}\n\nclass WriteStreamSync extends WriteStream {\n  [_open] () {\n    let fd\n    try {\n      fd = fs.openSync(this[_path], this[_flags], this[_mode])\n    } catch (er) {\n      if (this[_defaultFlag] &&\n          this[_flags] === 'r+' &&\n          er && er.code === 'ENOENT') {\n        this[_flags] = 'w'\n        return this[_open]()\n      } else\n        throw er\n    }\n    this[_onopen](null, fd)\n  }\n\n  [_close] () {\n    if (this[_autoClose] && typeof this[_fd] === 'number') {\n      try {\n        fs.closeSync(this[_fd])\n      } catch (er) {}\n      this[_fd] = null\n      this.emit('close')\n    }\n  }\n\n  [_write] (buf) {\n    try {\n      this[_onwrite](null,\n        fs.writeSync(this[_fd], buf, 0, buf.length, this[_pos]))\n    } catch (er) {\n      this[_onwrite](er, 0)\n    }\n  }\n}\n\nconst writev = (fd, iovec, pos, cb) => {\n  const done = (er, bw) => cb(er, bw, iovec)\n  const req = new FSReqWrap()\n  req.oncomplete = done\n  binding.writeBuffers(fd, iovec, pos, req)\n}\n\nexports.ReadStream = ReadStream\nexports.ReadStreamSync = ReadStreamSync\n\nexports.WriteStream = WriteStream\nexports.WriteStreamSync = WriteStreamSync\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2048,
		"ino": 135153,
		"size": 1687,
		"blocks": 4,
		"atimeMs": 1551500604731.8352,
		"mtimeMs": 1551490330780.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:23:24.732Z",
		"mtime": "2019-03-02T01:32:10.781Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isfile": true
	},
	"filename": "fs-minipass/package.json",
	"content": "{\n  \"_from\": \"fs-minipass@^1.2.5\",\n  \"_id\": \"fs-minipass@1.2.5\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha512-JhBl0skXjUPCFH7x6x61gQxrKyXsxB5gcgePLZCwfyCGGsTISMoIeObbrvVeP6Xmyaudw4TT43qV2Gz+iyd2oQ==\",\n  \"_location\": \"/fs-minipass\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"range\",\n    \"registry\": true,\n    \"raw\": \"fs-minipass@^1.2.5\",\n    \"name\": \"fs-minipass\",\n    \"escapedName\": \"fs-minipass\",\n    \"rawSpec\": \"^1.2.5\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"^1.2.5\"\n  },\n  \"_requiredBy\": [\n    \"/tar\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/fs-minipass/-/fs-minipass-1.2.5.tgz\",\n  \"_shasum\": \"06c277218454ec288df77ada54a03b8702aacb9d\",\n  \"_spec\": \"fs-minipass@^1.2.5\",\n  \"_where\": \"/disk1/projects/@kawix/std/compression/tar/node_modules/tar\",\n  \"author\": {\n    \"name\": \"Isaac Z. Schlueter\",\n    \"email\": \"i@izs.me\",\n    \"url\": \"http://blog.izs.me/\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/npm/fs-minipass/issues\"\n  },\n  \"bundleDependencies\": false,\n  \"dependencies\": {\n    \"minipass\": \"^2.2.1\"\n  },\n  \"deprecated\": false,\n  \"description\": \"fs read and write streams based on minipass\",\n  \"devDependencies\": {\n    \"mutate-fs\": \"^2.0.1\",\n    \"tap\": \"^10.7.2\"\n  },\n  \"files\": [\n    \"index.js\"\n  ],\n  \"homepage\": \"https://github.com/npm/fs-minipass#readme\",\n  \"keywords\": [],\n  \"license\": \"ISC\",\n  \"main\": \"index.js\",\n  \"name\": \"fs-minipass\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/npm/fs-minipass.git\"\n  },\n  \"scripts\": {\n    \"postpublish\": \"git push origin --all; git push origin --tags\",\n    \"postversion\": \"npm publish\",\n    \"preversion\": \"npm test\",\n    \"test\": \"tap test/*.js --100 -J\"\n  },\n  \"version\": \"1.2.5\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 4,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135008,
		"size": 9,
		"blocks": 3,
		"atimeMs": 1551500646012.6226,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:24:06.013Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isdirectory": true
	},
	"filename": "minimist"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135360,
		"size": 3,
		"blocks": 1,
		"atimeMs": 1551500530958.426,
		"mtimeMs": 1551490330700.8396,
		"ctimeMs": 1551490330700.8396,
		"birthtimeMs": 1551490330700.8396,
		"atime": "2019-03-02T04:22:10.958Z",
		"mtime": "2019-03-02T01:32:10.701Z",
		"ctime": "2019-03-02T01:32:10.701Z",
		"birthtime": "2019-03-02T01:32:10.701Z",
		"isdirectory": true
	},
	"filename": "minimist/example"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 512,
		"ino": 135135,
		"size": 69,
		"blocks": 1,
		"atimeMs": 1551500530958.426,
		"mtimeMs": 1372147306000,
		"ctimeMs": 1551490330704.8396,
		"birthtimeMs": 1551490330704.8396,
		"atime": "2019-03-02T04:22:10.958Z",
		"mtime": "2013-06-25T08:01:46.000Z",
		"ctime": "2019-03-02T01:32:10.705Z",
		"birthtime": "2019-03-02T01:32:10.705Z",
		"isfile": true
	},
	"filename": "minimist/example/parse.js",
	"content": "var argv = require('../')(process.argv.slice(2));\nconsole.dir(argv);\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 5632,
		"ino": 135350,
		"size": 5589,
		"blocks": 6,
		"atimeMs": 1551500530958.426,
		"mtimeMs": 1392957961000,
		"ctimeMs": 1551490330700.8396,
		"birthtimeMs": 1551490330700.8396,
		"atime": "2019-03-02T04:22:10.958Z",
		"mtime": "2014-02-21T04:46:01.000Z",
		"ctime": "2019-03-02T01:32:10.701Z",
		"birthtime": "2019-03-02T01:32:10.701Z",
		"isfile": true
	},
	"filename": "minimist/index.js",
	"content": "module.exports = function (args, opts) {\n    if (!opts) opts = {};\n    \n    var flags = { bools : {}, strings : {} };\n    \n    [].concat(opts['boolean']).filter(Boolean).forEach(function (key) {\n        flags.bools[key] = true;\n    });\n    \n    [].concat(opts.string).filter(Boolean).forEach(function (key) {\n        flags.strings[key] = true;\n    });\n    \n    var aliases = {};\n    Object.keys(opts.alias || {}).forEach(function (key) {\n        aliases[key] = [].concat(opts.alias[key]);\n        aliases[key].forEach(function (x) {\n            aliases[x] = [key].concat(aliases[key].filter(function (y) {\n                return x !== y;\n            }));\n        });\n    });\n    \n    var defaults = opts['default'] || {};\n    \n    var argv = { _ : [] };\n    Object.keys(flags.bools).forEach(function (key) {\n        setArg(key, defaults[key] === undefined ? false : defaults[key]);\n    });\n    \n    var notFlags = [];\n\n    if (args.indexOf('--') !== -1) {\n        notFlags = args.slice(args.indexOf('--')+1);\n        args = args.slice(0, args.indexOf('--'));\n    }\n\n    function setArg (key, val) {\n        var value = !flags.strings[key] && isNumber(val)\n            ? Number(val) : val\n        ;\n        setKey(argv, key.split('.'), value);\n        \n        (aliases[key] || []).forEach(function (x) {\n            setKey(argv, x.split('.'), value);\n        });\n    }\n    \n    for (var i = 0; i < args.length; i++) {\n        var arg = args[i];\n        \n        if (/^--.+=/.test(arg)) {\n            // Using [\\s\\S] instead of . because js doesn't support the\n            // 'dotall' regex modifier. See:\n            // http://stackoverflow.com/a/1068308/13216\n            var m = arg.match(/^--([^=]+)=([\\s\\S]*)$/);\n            setArg(m[1], m[2]);\n        }\n        else if (/^--no-.+/.test(arg)) {\n            var key = arg.match(/^--no-(.+)/)[1];\n            setArg(key, false);\n        }\n        else if (/^--.+/.test(arg)) {\n            var key = arg.match(/^--(.+)/)[1];\n            var next = args[i + 1];\n            if (next !== undefined && !/^-/.test(next)\n            && !flags.bools[key]\n            && (aliases[key] ? !flags.bools[aliases[key]] : true)) {\n                setArg(key, next);\n                i++;\n            }\n            else if (/^(true|false)$/.test(next)) {\n                setArg(key, next === 'true');\n                i++;\n            }\n            else {\n                setArg(key, flags.strings[key] ? '' : true);\n            }\n        }\n        else if (/^-[^-]+/.test(arg)) {\n            var letters = arg.slice(1,-1).split('');\n            \n            var broken = false;\n            for (var j = 0; j < letters.length; j++) {\n                var next = arg.slice(j+2);\n                \n                if (next === '-') {\n                    setArg(letters[j], next)\n                    continue;\n                }\n                \n                if (/[A-Za-z]/.test(letters[j])\n                && /-?\\d+(\\.\\d*)?(e-?\\d+)?$/.test(next)) {\n                    setArg(letters[j], next);\n                    broken = true;\n                    break;\n                }\n                \n                if (letters[j+1] && letters[j+1].match(/\\W/)) {\n                    setArg(letters[j], arg.slice(j+2));\n                    broken = true;\n                    break;\n                }\n                else {\n                    setArg(letters[j], flags.strings[letters[j]] ? '' : true);\n                }\n            }\n            \n            var key = arg.slice(-1)[0];\n            if (!broken && key !== '-') {\n                if (args[i+1] && !/^(-|--)[^-]/.test(args[i+1])\n                && !flags.bools[key]\n                && (aliases[key] ? !flags.bools[aliases[key]] : true)) {\n                    setArg(key, args[i+1]);\n                    i++;\n                }\n                else if (args[i+1] && /true|false/.test(args[i+1])) {\n                    setArg(key, args[i+1] === 'true');\n                    i++;\n                }\n                else {\n                    setArg(key, flags.strings[key] ? '' : true);\n                }\n            }\n        }\n        else {\n            argv._.push(\n                flags.strings['_'] || !isNumber(arg) ? arg : Number(arg)\n            );\n        }\n    }\n    \n    Object.keys(defaults).forEach(function (key) {\n        if (!hasKey(argv, key.split('.'))) {\n            setKey(argv, key.split('.'), defaults[key]);\n            \n            (aliases[key] || []).forEach(function (x) {\n                setKey(argv, x.split('.'), defaults[key]);\n            });\n        }\n    });\n    \n    notFlags.forEach(function(key) {\n        argv._.push(key);\n    });\n\n    return argv;\n};\n\nfunction hasKey (obj, keys) {\n    var o = obj;\n    keys.slice(0,-1).forEach(function (key) {\n        o = (o[key] || {});\n    });\n\n    var key = keys[keys.length - 1];\n    return key in o;\n}\n\nfunction setKey (obj, keys, value) {\n    var o = obj;\n    keys.slice(0,-1).forEach(function (key) {\n        if (o[key] === undefined) o[key] = {};\n        o = o[key];\n    });\n    \n    var key = keys[keys.length - 1];\n    if (o[key] === undefined || typeof o[key] === 'boolean') {\n        o[key] = value;\n    }\n    else if (Array.isArray(o[key])) {\n        o[key].push(value);\n    }\n    else {\n        o[key] = [ o[key], value ];\n    }\n}\n\nfunction isNumber (x) {\n    if (typeof x === 'number') return true;\n    if (/^0x[0-9a-f]+$/i.test(x)) return true;\n    return /^[-+]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(e[-+]?\\d+)?$/.test(x);\n}\n\nfunction longest (xs) {\n    return Math.max.apply(null, xs.map(function (x) { return x.length }));\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2048,
		"ino": 135381,
		"size": 1636,
		"blocks": 4,
		"atimeMs": 1551500604731.8352,
		"mtimeMs": 1551490330780.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:23:24.732Z",
		"mtime": "2019-03-02T01:32:10.781Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isfile": true
	},
	"filename": "minimist/package.json",
	"content": "{\n  \"_from\": \"minimist@0.0.8\",\n  \"_id\": \"minimist@0.0.8\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha1-hX/Kv8M5fSYluCKCYuhqp6ARsF0=\",\n  \"_location\": \"/minimist\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"version\",\n    \"registry\": true,\n    \"raw\": \"minimist@0.0.8\",\n    \"name\": \"minimist\",\n    \"escapedName\": \"minimist\",\n    \"rawSpec\": \"0.0.8\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"0.0.8\"\n  },\n  \"_requiredBy\": [\n    \"/mkdirp\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/minimist/-/minimist-0.0.8.tgz\",\n  \"_shasum\": \"857fcabfc3397d2625b8228262e86aa7a011b05d\",\n  \"_spec\": \"minimist@0.0.8\",\n  \"_where\": \"/disk1/projects/@kawix/std/compression/tar/node_modules/mkdirp\",\n  \"author\": {\n    \"name\": \"James Halliday\",\n    \"email\": \"mail@substack.net\",\n    \"url\": \"http://substack.net\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/substack/minimist/issues\"\n  },\n  \"bundleDependencies\": false,\n  \"deprecated\": false,\n  \"description\": \"parse argument options\",\n  \"devDependencies\": {\n    \"tap\": \"~0.4.0\",\n    \"tape\": \"~1.0.4\"\n  },\n  \"homepage\": \"https://github.com/substack/minimist\",\n  \"keywords\": [\n    \"argv\",\n    \"getopt\",\n    \"parser\",\n    \"optimist\"\n  ],\n  \"license\": \"MIT\",\n  \"main\": \"index.js\",\n  \"name\": \"minimist\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git://github.com/substack/minimist.git\"\n  },\n  \"scripts\": {\n    \"test\": \"tap test/*.js\"\n  },\n  \"testling\": {\n    \"files\": \"test/*.js\",\n    \"browsers\": [\n      \"ie/6..latest\",\n      \"ff/5\",\n      \"firefox/latest\",\n      \"chrome/10\",\n      \"chrome/latest\",\n      \"safari/5.1\",\n      \"safari/latest\",\n      \"opera/12\"\n    ]\n  },\n  \"version\": \"0.0.8\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2048,
		"ino": 135139,
		"size": 1639,
		"blocks": 4,
		"atimeMs": 1551500530958.426,
		"mtimeMs": 1372148196000,
		"ctimeMs": 1551490330708.8396,
		"birthtimeMs": 1551490330708.8396,
		"atime": "2019-03-02T04:22:10.958Z",
		"mtime": "2013-06-25T08:16:36.000Z",
		"ctime": "2019-03-02T01:32:10.709Z",
		"birthtime": "2019-03-02T01:32:10.709Z",
		"isfile": true
	},
	"filename": "minimist/readme.markdown",
	"content": "# minimist\n\nparse argument options\n\nThis module is the guts of optimist's argument parser without all the\nfanciful decoration.\n\n[![browser support](https://ci.testling.com/substack/minimist.png)](http://ci.testling.com/substack/minimist)\n\n[![build status](https://secure.travis-ci.org/substack/minimist.png)](http://travis-ci.org/substack/minimist)\n\n# example\n\n``` js\nvar argv = require('minimist')(process.argv.slice(2));\nconsole.dir(argv);\n```\n\n```\n$ node example/parse.js -a beep -b boop\n{ _: [], a: 'beep', b: 'boop' }\n```\n\n```\n$ node example/parse.js -x 3 -y 4 -n5 -abc --beep=boop foo bar baz\n{ _: [ 'foo', 'bar', 'baz' ],\n  x: 3,\n  y: 4,\n  n: 5,\n  a: true,\n  b: true,\n  c: true,\n  beep: 'boop' }\n```\n\n# methods\n\n``` js\nvar parseArgs = require('minimist')\n```\n\n## var argv = parseArgs(args, opts={})\n\nReturn an argument object `argv` populated with the array arguments from `args`.\n\n`argv._` contains all the arguments that didn't have an option associated with\nthem.\n\nNumeric-looking arguments will be returned as numbers unless `opts.string` or\n`opts.boolean` is set for that argument name.\n\nAny arguments after `'--'` will not be parsed and will end up in `argv._`.\n\noptions can be:\n\n* `opts.string` - a string or array of strings argument names to always treat as\nstrings\n* `opts.boolean` - a string or array of strings to always treat as booleans\n* `opts.alias` - an object mapping string names to strings or arrays of string\nargument names to use as aliases\n* `opts.default` - an object mapping string argument names to default values\n\n# install\n\nWith [npm](https://npmjs.org) do:\n\n```\nnpm install minimist\n```\n\n# license\n\nMIT\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135271,
		"size": 6,
		"blocks": 3,
		"atimeMs": 1551500646012.6226,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:24:06.013Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isdirectory": true
	},
	"filename": "minipass"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 9728,
		"ino": 135277,
		"size": 9314,
		"blocks": 10,
		"atimeMs": 1551500530978.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330696.8394,
		"birthtimeMs": 1551490330696.8394,
		"atime": "2019-03-02T04:22:10.978Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.697Z",
		"birthtime": "2019-03-02T01:32:10.697Z",
		"isfile": true
	},
	"filename": "minipass/index.js",
	"content": "'use strict'\nconst EE = require('events')\nconst Yallist = require('yallist')\nconst EOF = Symbol('EOF')\nconst MAYBE_EMIT_END = Symbol('maybeEmitEnd')\nconst EMITTED_END = Symbol('emittedEnd')\nconst CLOSED = Symbol('closed')\nconst READ = Symbol('read')\nconst FLUSH = Symbol('flush')\nconst doIter = process.env._MP_NO_ITERATOR_SYMBOLS_  !== '1'\nconst ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol('asyncIterator not implemented')\nconst ITERATOR = doIter && Symbol.iterator || Symbol('iterator not implemented')\nconst FLUSHCHUNK = Symbol('flushChunk')\nconst SD = require('string_decoder').StringDecoder\nconst ENCODING = Symbol('encoding')\nconst DECODER = Symbol('decoder')\nconst FLOWING = Symbol('flowing')\nconst RESUME = Symbol('resume')\nconst BUFFERLENGTH = Symbol('bufferLength')\nconst BUFFERPUSH = Symbol('bufferPush')\nconst BUFFERSHIFT = Symbol('bufferShift')\nconst OBJECTMODE = Symbol('objectMode')\n\n// Buffer in node 4.x < 4.5.0 doesn't have working Buffer.from\n// or Buffer.alloc, and Buffer in node 10 deprecated the ctor.\n// .M, this is fine .\\^/M..\nlet B = Buffer\n/* istanbul ignore next */\nif (!B.alloc) {\n  B = require('safe-buffer').Buffer\n}\n\nmodule.exports = class MiniPass extends EE {\n  constructor (options) {\n    super()\n    this[FLOWING] = false\n    this.pipes = new Yallist()\n    this.buffer = new Yallist()\n    this[OBJECTMODE] = options && options.objectMode || false\n    if (this[OBJECTMODE])\n      this[ENCODING] = null\n    else\n      this[ENCODING] = options && options.encoding || null\n    if (this[ENCODING] === 'buffer')\n      this[ENCODING] = null\n    this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null\n    this[EOF] = false\n    this[EMITTED_END] = false\n    this[CLOSED] = false\n    this.writable = true\n    this.readable = true\n    this[BUFFERLENGTH] = 0\n  }\n\n  get bufferLength () { return this[BUFFERLENGTH] }\n\n  get encoding () { return this[ENCODING] }\n  set encoding (enc) {\n    if (this[OBJECTMODE])\n      throw new Error('cannot set encoding in objectMode')\n\n    if (this[ENCODING] && enc !== this[ENCODING] &&\n        (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH]))\n      throw new Error('cannot change encoding')\n\n    if (this[ENCODING] !== enc) {\n      this[DECODER] = enc ? new SD(enc) : null\n      if (this.buffer.length)\n        this.buffer = this.buffer.map(chunk => this[DECODER].write(chunk))\n    }\n\n    this[ENCODING] = enc\n  }\n\n  setEncoding (enc) {\n    this.encoding = enc\n  }\n\n  write (chunk, encoding, cb) {\n    if (this[EOF])\n      throw new Error('write after end')\n\n    if (typeof encoding === 'function')\n      cb = encoding, encoding = 'utf8'\n\n    if (!encoding)\n      encoding = 'utf8'\n\n    // fast-path writing strings of same encoding to a stream with\n    // an empty buffer, skipping the buffer/decoder dance\n    if (typeof chunk === 'string' && !this[OBJECTMODE] &&\n        // unless it is a string already ready for us to use\n        !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {\n      chunk = B.from(chunk, encoding)\n    }\n\n    if (B.isBuffer(chunk) && this[ENCODING])\n      chunk = this[DECODER].write(chunk)\n\n    try {\n      return this.flowing\n        ? (this.emit('data', chunk), this.flowing)\n        : (this[BUFFERPUSH](chunk), false)\n    } finally {\n      this.emit('readable')\n      if (cb)\n        cb()\n    }\n  }\n\n  read (n) {\n    try {\n      if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH])\n        return null\n\n      if (this[OBJECTMODE])\n        n = null\n\n      if (this.buffer.length > 1 && !this[OBJECTMODE]) {\n        if (this.encoding)\n          this.buffer = new Yallist([\n            Array.from(this.buffer).join('')\n          ])\n        else\n          this.buffer = new Yallist([\n            B.concat(Array.from(this.buffer), this[BUFFERLENGTH])\n          ])\n      }\n\n      return this[READ](n || null, this.buffer.head.value)\n    } finally {\n      this[MAYBE_EMIT_END]()\n    }\n  }\n\n  [READ] (n, chunk) {\n    if (n === chunk.length || n === null)\n      this[BUFFERSHIFT]()\n    else {\n      this.buffer.head.value = chunk.slice(n)\n      chunk = chunk.slice(0, n)\n      this[BUFFERLENGTH] -= n\n    }\n\n    this.emit('data', chunk)\n\n    if (!this.buffer.length && !this[EOF])\n      this.emit('drain')\n\n    return chunk\n  }\n\n  end (chunk, encoding, cb) {\n    if (typeof chunk === 'function')\n      cb = chunk, chunk = null\n    if (typeof encoding === 'function')\n      cb = encoding, encoding = 'utf8'\n    if (chunk)\n      this.write(chunk, encoding)\n    if (cb)\n      this.once('end', cb)\n    this[EOF] = true\n    this.writable = false\n    if (this.flowing)\n      this[MAYBE_EMIT_END]()\n  }\n\n  // don't let the internal resume be overwritten\n  [RESUME] () {\n    this[FLOWING] = true\n    this.emit('resume')\n    if (this.buffer.length)\n      this[FLUSH]()\n    else if (this[EOF])\n      this[MAYBE_EMIT_END]()\n    else\n      this.emit('drain')\n  }\n\n  resume () {\n    return this[RESUME]()\n  }\n\n  pause () {\n    this[FLOWING] = false\n  }\n\n  get flowing () {\n    return this[FLOWING]\n  }\n\n  [BUFFERPUSH] (chunk) {\n    if (this[OBJECTMODE])\n      this[BUFFERLENGTH] += 1\n    else\n      this[BUFFERLENGTH] += chunk.length\n    return this.buffer.push(chunk)\n  }\n\n  [BUFFERSHIFT] () {\n    if (this.buffer.length) {\n      if (this[OBJECTMODE])\n        this[BUFFERLENGTH] -= 1\n      else\n        this[BUFFERLENGTH] -= this.buffer.head.value.length\n    }\n    return this.buffer.shift()\n  }\n\n  [FLUSH] () {\n    do {} while (this[FLUSHCHUNK](this[BUFFERSHIFT]()))\n\n    if (!this.buffer.length && !this[EOF])\n      this.emit('drain')\n  }\n\n  [FLUSHCHUNK] (chunk) {\n    return chunk ? (this.emit('data', chunk), this.flowing) : false\n  }\n\n  pipe (dest, opts) {\n    if (dest === process.stdout || dest === process.stderr)\n      (opts = opts || {}).end = false\n    const p = { dest: dest, opts: opts, ondrain: _ => this[RESUME]() }\n    this.pipes.push(p)\n\n    dest.on('drain', p.ondrain)\n    this[RESUME]()\n    return dest\n  }\n\n  addListener (ev, fn) {\n    return this.on(ev, fn)\n  }\n\n  on (ev, fn) {\n    try {\n      return super.on(ev, fn)\n    } finally {\n      if (ev === 'data' && !this.pipes.length && !this.flowing)\n        this[RESUME]()\n      else if (ev === 'end' && this[EMITTED_END]) {\n        super.emit('end')\n        this.removeAllListeners('end')\n      }\n    }\n  }\n\n  get emittedEnd () {\n    return this[EMITTED_END]\n  }\n\n  [MAYBE_EMIT_END] () {\n    if (!this[EMITTED_END] && this.buffer.length === 0 && this[EOF]) {\n      this.emit('end')\n      this.emit('prefinish')\n      this.emit('finish')\n      if (this[CLOSED])\n        this.emit('close')\n    }\n  }\n\n  emit (ev, data) {\n    if (ev === 'data') {\n      if (!data)\n        return\n\n      if (this.pipes.length)\n        this.pipes.forEach(p => p.dest.write(data) || this.pause())\n    } else if (ev === 'end') {\n      if (this[EMITTED_END] === true)\n        return\n\n      this[EMITTED_END] = true\n      this.readable = false\n\n      if (this[DECODER]) {\n        data = this[DECODER].end()\n        if (data) {\n          this.pipes.forEach(p => p.dest.write(data))\n          super.emit('data', data)\n        }\n      }\n\n      this.pipes.forEach(p => {\n        p.dest.removeListener('drain', p.ondrain)\n        if (!p.opts || p.opts.end !== false)\n          p.dest.end()\n      })\n    } else if (ev === 'close') {\n      this[CLOSED] = true\n      // don't emit close before 'end' and 'finish'\n      if (!this[EMITTED_END])\n        return\n    }\n\n    const args = new Array(arguments.length)\n    args[0] = ev\n    args[1] = data\n    if (arguments.length > 2) {\n      for (let i = 2; i < arguments.length; i++) {\n        args[i] = arguments[i]\n      }\n    }\n\n    try {\n      return super.emit.apply(this, args)\n    } finally {\n      if (ev !== 'end')\n        this[MAYBE_EMIT_END]()\n      else\n        this.removeAllListeners('end')\n    }\n  }\n\n  // const all = await stream.collect()\n  collect () {\n    return new Promise((resolve, reject) => {\n      const buf = []\n      this.on('data', c => buf.push(c))\n      this.on('end', () => resolve(buf))\n      this.on('error', reject)\n    })\n  }\n\n  // for await (let chunk of stream)\n  [ASYNCITERATOR] () {\n    const next = () => {\n      const res = this.read()\n      if (res !== null)\n        return Promise.resolve({ done: false, value: res })\n\n      if (this[EOF])\n        return Promise.resolve({ done: true })\n\n      let resolve = null\n      let reject = null\n      const onerr = er => {\n        this.removeListener('data', ondata)\n        this.removeListener('end', onend)\n        reject(er)\n      }\n      const ondata = value => {\n        this.removeListener('error', onerr)\n        this.removeListener('end', onend)\n        this.pause()\n        resolve({ value: value, done: !!this[EOF] })\n      }\n      const onend = () => {\n        this.removeListener('error', onerr)\n        this.removeListener('data', ondata)\n        resolve({ done: true })\n      }\n      return new Promise((res, rej) => {\n        reject = rej\n        resolve = res\n        this.once('error', onerr)\n        this.once('end', onend)\n        this.once('data', ondata)\n      })\n    }\n\n    return { next }\n  }\n\n  // for (let chunk of stream)\n  [ITERATOR] () {\n    const next = () => {\n      const value = this.read()\n      const done = value === null\n      return { value, done }\n    }\n    return { next }\n  }\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2048,
		"ino": 135152,
		"size": 1787,
		"blocks": 4,
		"atimeMs": 1551500604731.8352,
		"mtimeMs": 1551490330780.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:23:24.732Z",
		"mtime": "2019-03-02T01:32:10.781Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isfile": true
	},
	"filename": "minipass/package.json",
	"content": "{\n  \"_from\": \"minipass@^2.3.4\",\n  \"_id\": \"minipass@2.3.5\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha512-Gi1W4k059gyRbyVUZQ4mEqLm0YIUiGYfvxhF6SIlk3ui1WVxMTGfGdQ2SInh3PDrRTVvPKgULkpJtT4RH10+VA==\",\n  \"_location\": \"/minipass\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"range\",\n    \"registry\": true,\n    \"raw\": \"minipass@^2.3.4\",\n    \"name\": \"minipass\",\n    \"escapedName\": \"minipass\",\n    \"rawSpec\": \"^2.3.4\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"^2.3.4\"\n  },\n  \"_requiredBy\": [\n    \"/fs-minipass\",\n    \"/minizlib\",\n    \"/tar\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/minipass/-/minipass-2.3.5.tgz\",\n  \"_shasum\": \"cacebe492022497f656b0f0f51e2682a9ed2d848\",\n  \"_spec\": \"minipass@^2.3.4\",\n  \"_where\": \"/disk1/projects/@kawix/std/compression/tar/node_modules/tar\",\n  \"author\": {\n    \"name\": \"Isaac Z. Schlueter\",\n    \"email\": \"i@izs.me\",\n    \"url\": \"http://blog.izs.me/\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/isaacs/minipass/issues\"\n  },\n  \"bundleDependencies\": false,\n  \"dependencies\": {\n    \"safe-buffer\": \"^5.1.2\",\n    \"yallist\": \"^3.0.0\"\n  },\n  \"deprecated\": false,\n  \"description\": \"minimal implementation of a PassThrough stream\",\n  \"devDependencies\": {\n    \"end-of-stream\": \"^1.4.0\",\n    \"tap\": \"^12.0.1\",\n    \"through2\": \"^2.0.3\"\n  },\n  \"files\": [\n    \"index.js\"\n  ],\n  \"homepage\": \"https://github.com/isaacs/minipass#readme\",\n  \"keywords\": [\n    \"passthrough\",\n    \"stream\"\n  ],\n  \"license\": \"ISC\",\n  \"main\": \"index.js\",\n  \"name\": \"minipass\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/isaacs/minipass.git\"\n  },\n  \"scripts\": {\n    \"postpublish\": \"git push origin --all; git push origin --tags\",\n    \"postversion\": \"npm publish\",\n    \"preversion\": \"npm test\",\n    \"test\": \"tap test/*.js --100\"\n  },\n  \"version\": \"2.3.5\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135132,
		"size": 7,
		"blocks": 3,
		"atimeMs": 1551500646012.6226,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:24:06.013Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isdirectory": true
	},
	"filename": "minizlib"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1024,
		"ino": 135020,
		"size": 883,
		"blocks": 3,
		"atimeMs": 1551500530966.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330696.8394,
		"birthtimeMs": 1551490330696.8394,
		"atime": "2019-03-02T04:22:10.966Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.697Z",
		"birthtime": "2019-03-02T01:32:10.697Z",
		"isfile": true
	},
	"filename": "minizlib/constants.js",
	"content": "module.exports = Object.freeze({\n  Z_NO_FLUSH: 0,\n  Z_PARTIAL_FLUSH: 1,\n  Z_SYNC_FLUSH: 2,\n  Z_FULL_FLUSH: 3,\n  Z_FINISH: 4,\n  Z_BLOCK: 5,\n  Z_OK: 0,\n  Z_STREAM_END: 1,\n  Z_NEED_DICT: 2,\n  Z_ERRNO: -1,\n  Z_STREAM_ERROR: -2,\n  Z_DATA_ERROR: -3,\n  Z_MEM_ERROR: -4,\n  Z_BUF_ERROR: -5,\n  Z_VERSION_ERROR: -6,\n  Z_NO_COMPRESSION: 0,\n  Z_BEST_SPEED: 1,\n  Z_BEST_COMPRESSION: 9,\n  Z_DEFAULT_COMPRESSION: -1,\n  Z_FILTERED: 1,\n  Z_HUFFMAN_ONLY: 2,\n  Z_RLE: 3,\n  Z_FIXED: 4,\n  Z_DEFAULT_STRATEGY: 0,\n  ZLIB_VERNUM: 4736,\n  DEFLATE: 1,\n  INFLATE: 2,\n  GZIP: 3,\n  GUNZIP: 4,\n  DEFLATERAW: 5,\n  INFLATERAW: 6,\n  UNZIP: 7,\n  Z_MIN_WINDOWBITS: 8,\n  Z_MAX_WINDOWBITS: 15,\n  Z_DEFAULT_WINDOWBITS: 15,\n  Z_MIN_CHUNK: 64,\n  Z_MAX_CHUNK: Infinity,\n  Z_DEFAULT_CHUNK: 16384,\n  Z_MIN_MEMLEVEL: 1,\n  Z_MAX_MEMLEVEL: 9,\n  Z_DEFAULT_MEMLEVEL: 8,\n  Z_MIN_LEVEL: -1,\n  Z_MAX_LEVEL: 9,\n  Z_DEFAULT_LEVEL: -1\n})\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 9216,
		"ino": 135347,
		"size": 9190,
		"blocks": 10,
		"atimeMs": 1551500530966.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330700.8396,
		"birthtimeMs": 1551490330700.8396,
		"atime": "2019-03-02T04:22:10.966Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.701Z",
		"birthtime": "2019-03-02T01:32:10.701Z",
		"isfile": true
	},
	"filename": "minizlib/index.js",
	"content": "'use strict'\n\nconst assert = require('assert')\nconst Buffer = require('buffer').Buffer\nconst realZlib = require('zlib')\n\nconst constants = exports.constants = require('./constants.js')\nconst MiniPass = require('minipass')\n\nconst OriginalBufferConcat = Buffer.concat\n\nclass ZlibError extends Error {\n  constructor (msg, errno) {\n    super('zlib: ' + msg)\n    this.errno = errno\n    this.code = codes.get(errno)\n  }\n\n  get name () {\n    return 'ZlibError'\n  }\n}\n\n// translation table for return codes.\nconst codes = new Map([\n  [constants.Z_OK, 'Z_OK'],\n  [constants.Z_STREAM_END, 'Z_STREAM_END'],\n  [constants.Z_NEED_DICT, 'Z_NEED_DICT'],\n  [constants.Z_ERRNO, 'Z_ERRNO'],\n  [constants.Z_STREAM_ERROR, 'Z_STREAM_ERROR'],\n  [constants.Z_DATA_ERROR, 'Z_DATA_ERROR'],\n  [constants.Z_MEM_ERROR, 'Z_MEM_ERROR'],\n  [constants.Z_BUF_ERROR, 'Z_BUF_ERROR'],\n  [constants.Z_VERSION_ERROR, 'Z_VERSION_ERROR']\n])\n\nconst validFlushFlags = new Set([\n  constants.Z_NO_FLUSH,\n  constants.Z_PARTIAL_FLUSH,\n  constants.Z_SYNC_FLUSH,\n  constants.Z_FULL_FLUSH,\n  constants.Z_FINISH,\n  constants.Z_BLOCK\n])\n\nconst strategies = new Set([\n  constants.Z_FILTERED,\n  constants.Z_HUFFMAN_ONLY,\n  constants.Z_RLE,\n  constants.Z_FIXED,\n  constants.Z_DEFAULT_STRATEGY\n])\n\n// the Zlib class they all inherit from\n// This thing manages the queue of requests, and returns\n// true or false if there is anything in the queue when\n// you call the .write() method.\nconst _opts = Symbol('opts')\nconst _flushFlag = Symbol('flushFlag')\nconst _finishFlush = Symbol('finishFlush')\nconst _handle = Symbol('handle')\nconst _onError = Symbol('onError')\nconst _level = Symbol('level')\nconst _strategy = Symbol('strategy')\nconst _ended = Symbol('ended')\n\nclass Zlib extends MiniPass {\n  constructor (opts, mode) {\n    super(opts)\n    this[_ended] = false\n    this[_opts] = opts = opts || {}\n    if (opts.flush && !validFlushFlags.has(opts.flush)) {\n      throw new TypeError('Invalid flush flag: ' + opts.flush)\n    }\n    if (opts.finishFlush && !validFlushFlags.has(opts.finishFlush)) {\n      throw new TypeError('Invalid flush flag: ' + opts.finishFlush)\n    }\n\n    this[_flushFlag] = opts.flush || constants.Z_NO_FLUSH\n    this[_finishFlush] = typeof opts.finishFlush !== 'undefined' ?\n      opts.finishFlush : constants.Z_FINISH\n\n    if (opts.chunkSize) {\n      if (opts.chunkSize < constants.Z_MIN_CHUNK) {\n        throw new RangeError('Invalid chunk size: ' + opts.chunkSize)\n      }\n    }\n\n    if (opts.windowBits) {\n      if (opts.windowBits < constants.Z_MIN_WINDOWBITS ||\n          opts.windowBits > constants.Z_MAX_WINDOWBITS) {\n        throw new RangeError('Invalid windowBits: ' + opts.windowBits)\n      }\n    }\n\n    if (opts.level) {\n      if (opts.level < constants.Z_MIN_LEVEL ||\n          opts.level > constants.Z_MAX_LEVEL) {\n        throw new RangeError('Invalid compression level: ' + opts.level)\n      }\n    }\n\n    if (opts.memLevel) {\n      if (opts.memLevel < constants.Z_MIN_MEMLEVEL ||\n          opts.memLevel > constants.Z_MAX_MEMLEVEL) {\n        throw new RangeError('Invalid memLevel: ' + opts.memLevel)\n      }\n    }\n\n    if (opts.strategy && !(strategies.has(opts.strategy)))\n      throw new TypeError('Invalid strategy: ' + opts.strategy)\n\n    if (opts.dictionary) {\n      if (!(opts.dictionary instanceof Buffer)) {\n        throw new TypeError('Invalid dictionary: it should be a Buffer instance')\n      }\n    }\n\n    this[_handle] = new realZlib[mode](opts)\n\n    this[_onError] = (err) => {\n      // there is no way to cleanly recover.\n      // continuing only obscures problems.\n      this.close()\n\n      const error = new ZlibError(err.message, err.errno)\n      this.emit('error', error)\n    }\n    this[_handle].on('error', this[_onError])\n\n    const level = typeof opts.level === 'number' ? opts.level\n                : constants.Z_DEFAULT_COMPRESSION\n\n    var strategy = typeof opts.strategy === 'number' ? opts.strategy\n                 : constants.Z_DEFAULT_STRATEGY\n\n    // API changed in node v9\n    /* istanbul ignore next */\n\n    this[_level] = level\n    this[_strategy] = strategy\n\n    this.once('end', this.close)\n  }\n\n  close () {\n    if (this[_handle]) {\n      this[_handle].close()\n      this[_handle] = null\n      this.emit('close')\n    }\n  }\n\n  params (level, strategy) {\n    if (!this[_handle])\n      throw new Error('cannot switch params when binding is closed')\n\n    // no way to test this without also not supporting params at all\n    /* istanbul ignore if */\n    if (!this[_handle].params)\n      throw new Error('not supported in this implementation')\n\n    if (level < constants.Z_MIN_LEVEL ||\n        level > constants.Z_MAX_LEVEL) {\n      throw new RangeError('Invalid compression level: ' + level)\n    }\n\n    if (!(strategies.has(strategy)))\n      throw new TypeError('Invalid strategy: ' + strategy)\n\n    if (this[_level] !== level || this[_strategy] !== strategy) {\n      this.flush(constants.Z_SYNC_FLUSH)\n      assert(this[_handle], 'zlib binding closed')\n      // .params() calls .flush(), but the latter is always async in the\n      // core zlib. We override .flush() temporarily to intercept that and\n      // flush synchronously.\n      const origFlush = this[_handle].flush\n      this[_handle].flush = (flushFlag, cb) => {\n        this[_handle].flush = origFlush\n        this.flush(flushFlag)\n        cb()\n      }\n      this[_handle].params(level, strategy)\n      /* istanbul ignore else */\n      if (this[_handle]) {\n        this[_level] = level\n        this[_strategy] = strategy\n      }\n    }\n  }\n\n  reset () {\n    assert(this[_handle], 'zlib binding closed')\n    return this[_handle].reset()\n  }\n\n  flush (kind) {\n    if (kind === undefined)\n      kind = constants.Z_FULL_FLUSH\n\n    if (this.ended)\n      return\n\n    const flushFlag = this[_flushFlag]\n    this[_flushFlag] = kind\n    this.write(Buffer.alloc(0))\n    this[_flushFlag] = flushFlag\n  }\n\n  end (chunk, encoding, cb) {\n    if (chunk)\n      this.write(chunk, encoding)\n    this.flush(this[_finishFlush])\n    this[_ended] = true\n    return super.end(null, null, cb)\n  }\n\n  get ended () {\n    return this[_ended]\n  }\n\n  write (chunk, encoding, cb) {\n    // process the chunk using the sync process\n    // then super.write() all the outputted chunks\n    if (typeof encoding === 'function')\n      cb = encoding, encoding = 'utf8'\n\n    if (typeof chunk === 'string')\n      chunk = Buffer.from(chunk, encoding)\n\n    assert(this[_handle], 'zlib binding closed')\n\n    // _processChunk tries to .close() the native handle after it's done, so we\n    // intercept that by temporarily making it a no-op.\n    const nativeHandle = this[_handle]._handle\n    const originalNativeClose = nativeHandle.close\n    nativeHandle.close = () => {}\n    const originalClose = this[_handle].close\n    this[_handle].close = () => {}\n    // It also calls `Buffer.concat()` at the end, which may be convenient\n    // for some, but which we are not interested in as it slows us down.\n    Buffer.concat = (args) => args\n    let result\n    try {\n      result = this[_handle]._processChunk(chunk, this[_flushFlag])\n    } catch (err) {\n      this[_onError](err)\n    } finally {\n      Buffer.concat = OriginalBufferConcat\n      if (this[_handle]) {\n        // Core zlib resets `_handle` to null after attempting to close the\n        // native handle. Our no-op handler prevented actual closure, but we\n        // need to restore the `._handle` property.\n        this[_handle]._handle = nativeHandle\n        nativeHandle.close = originalNativeClose\n        this[_handle].close = originalClose\n        // `_processChunk()` adds an 'error' listener. If we don't remove it\n        // after each call, these handlers start piling up.\n        this[_handle].removeAllListeners('error')\n      }\n    }\n\n    let writeReturn\n    if (result) {\n      if (Array.isArray(result) && result.length > 0) {\n        // The first buffer is always `handle._outBuffer`, which would be\n        // re-used for later invocations; so, we always have to copy that one.\n        writeReturn = super.write(Buffer.from(result[0]))\n        for (let i = 1; i < result.length; i++) {\n          writeReturn = super.write(result[i])\n        }\n      } else {\n        writeReturn = super.write(Buffer.from(result))\n      }\n    }\n\n    if (cb)\n      cb()\n    return writeReturn\n  }\n}\n\n// minimal 2-byte header\nclass Deflate extends Zlib {\n  constructor (opts) {\n    super(opts, 'Deflate')\n  }\n}\n\nclass Inflate extends Zlib {\n  constructor (opts) {\n    super(opts, 'Inflate')\n  }\n}\n\n// gzip - bigger header, same deflate compression\nclass Gzip extends Zlib {\n  constructor (opts) {\n    super(opts, 'Gzip')\n  }\n}\n\nclass Gunzip extends Zlib {\n  constructor (opts) {\n    super(opts, 'Gunzip')\n  }\n}\n\n// raw - no header\nclass DeflateRaw extends Zlib {\n  constructor (opts) {\n    super(opts, 'DeflateRaw')\n  }\n}\n\nclass InflateRaw extends Zlib {\n  constructor (opts) {\n    super(opts, 'InflateRaw')\n  }\n}\n\n// auto-detect header.\nclass Unzip extends Zlib {\n  constructor (opts) {\n    super(opts, 'Unzip')\n  }\n}\n\nexports.Deflate = Deflate\nexports.Inflate = Inflate\nexports.Gzip = Gzip\nexports.Gunzip = Gunzip\nexports.DeflateRaw = DeflateRaw\nexports.InflateRaw = InflateRaw\nexports.Unzip = Unzip\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2048,
		"ino": 135154,
		"size": 1816,
		"blocks": 4,
		"atimeMs": 1551500604735.8352,
		"mtimeMs": 1551490330780.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:23:24.736Z",
		"mtime": "2019-03-02T01:32:10.781Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isfile": true
	},
	"filename": "minizlib/package.json",
	"content": "{\n  \"_from\": \"minizlib@^1.1.1\",\n  \"_id\": \"minizlib@1.2.1\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha512-7+4oTUOWKg7AuL3vloEWekXY2/D20cevzsrNT2kGWm+39J9hGTCBv8VI5Pm5lXZ/o3/mdR4f8rflAPhnQb8mPA==\",\n  \"_location\": \"/minizlib\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"range\",\n    \"registry\": true,\n    \"raw\": \"minizlib@^1.1.1\",\n    \"name\": \"minizlib\",\n    \"escapedName\": \"minizlib\",\n    \"rawSpec\": \"^1.1.1\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"^1.1.1\"\n  },\n  \"_requiredBy\": [\n    \"/tar\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/minizlib/-/minizlib-1.2.1.tgz\",\n  \"_shasum\": \"dd27ea6136243c7c880684e8672bb3a45fd9b614\",\n  \"_spec\": \"minizlib@^1.1.1\",\n  \"_where\": \"/disk1/projects/@kawix/std/compression/tar/node_modules/tar\",\n  \"author\": {\n    \"name\": \"Isaac Z. Schlueter\",\n    \"email\": \"i@izs.me\",\n    \"url\": \"http://blog.izs.me/\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/isaacs/minizlib/issues\"\n  },\n  \"bundleDependencies\": false,\n  \"dependencies\": {\n    \"minipass\": \"^2.2.1\"\n  },\n  \"deprecated\": false,\n  \"description\": \"A small fast zlib stream built on [minipass](http://npm.im/minipass) and Node.js's zlib binding.\",\n  \"devDependencies\": {\n    \"tap\": \"^12.0.1\"\n  },\n  \"files\": [\n    \"index.js\",\n    \"constants.js\"\n  ],\n  \"homepage\": \"https://github.com/isaacs/minizlib#readme\",\n  \"keywords\": [\n    \"zlib\",\n    \"gzip\",\n    \"gunzip\",\n    \"deflate\",\n    \"inflate\",\n    \"compression\",\n    \"zip\",\n    \"unzip\"\n  ],\n  \"license\": \"MIT\",\n  \"main\": \"index.js\",\n  \"name\": \"minizlib\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/isaacs/minizlib.git\"\n  },\n  \"scripts\": {\n    \"postpublish\": \"git push origin --all; git push origin --tags\",\n    \"postversion\": \"npm publish\",\n    \"preversion\": \"npm test\",\n    \"test\": \"tap test/*.js --100 -J\"\n  },\n  \"version\": \"1.2.1\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 5,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135009,
		"size": 10,
		"blocks": 3,
		"atimeMs": 1551500646012.6226,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:24:06.013Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isdirectory": true
	},
	"filename": "mkdirp"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135357,
		"size": 4,
		"blocks": 1,
		"atimeMs": 1551500530962.426,
		"mtimeMs": 1551490330704.8396,
		"ctimeMs": 1551490330704.8396,
		"birthtimeMs": 1551490330704.8396,
		"atime": "2019-03-02T04:22:10.962Z",
		"mtime": "2019-03-02T01:32:10.705Z",
		"ctime": "2019-03-02T01:32:10.705Z",
		"birthtime": "2019-03-02T01:32:10.705Z",
		"isdirectory": true
	},
	"filename": "mkdirp/bin"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33277,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1024,
		"ino": 135363,
		"size": 731,
		"blocks": 3,
		"atimeMs": 1551500530962.426,
		"mtimeMs": 1419626841000,
		"ctimeMs": 1551490330800.8416,
		"birthtimeMs": 1551490330800.8416,
		"atime": "2019-03-02T04:22:10.962Z",
		"mtime": "2014-12-26T20:47:21.000Z",
		"ctime": "2019-03-02T01:32:10.801Z",
		"birthtime": "2019-03-02T01:32:10.801Z",
		"isfile": true
	},
	"filename": "mkdirp/bin/cmd.js",
	"content": "#!/usr/bin/env node\n\nvar mkdirp = require('../');\nvar minimist = require('minimist');\nvar fs = require('fs');\n\nvar argv = minimist(process.argv.slice(2), {\n    alias: { m: 'mode', h: 'help' },\n    string: [ 'mode' ]\n});\nif (argv.help) {\n    fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);\n    return;\n}\n\nvar paths = argv._.slice();\nvar mode = argv.mode ? parseInt(argv.mode, 8) : undefined;\n\n(function next () {\n    if (paths.length === 0) return;\n    var p = paths.shift();\n    \n    if (mode === undefined) mkdirp(p, cb)\n    else mkdirp(p, mode, cb)\n    \n    function cb (err) {\n        if (err) {\n            console.error(err.message);\n            process.exit(1);\n        }\n        else next();\n    }\n})();\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 512,
		"ino": 135137,
		"size": 315,
		"blocks": 2,
		"atimeMs": 1551500530962.426,
		"mtimeMs": 1419626841000,
		"ctimeMs": 1551490330704.8396,
		"birthtimeMs": 1551490330704.8396,
		"atime": "2019-03-02T04:22:10.962Z",
		"mtime": "2014-12-26T20:47:21.000Z",
		"ctime": "2019-03-02T01:32:10.705Z",
		"birthtime": "2019-03-02T01:32:10.705Z",
		"isfile": true
	},
	"filename": "mkdirp/bin/usage.txt",
	"content": "usage: mkdirp [DIR1,DIR2..] {OPTIONS}\n\n  Create each supplied directory including any necessary parent directories that\n  don't yet exist.\n  \n  If the directory already exists, do nothing.\n\nOPTIONS are:\n\n  -m, --mode   If a directory needs to be created, set the mode as an octal\n               permission string.\n\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135138,
		"size": 3,
		"blocks": 1,
		"atimeMs": 1551500530958.426,
		"mtimeMs": 1551490330708.8396,
		"ctimeMs": 1551490330708.8396,
		"birthtimeMs": 1551490330708.8396,
		"atime": "2019-03-02T04:22:10.958Z",
		"mtime": "2019-03-02T01:32:10.709Z",
		"ctime": "2019-03-02T01:32:10.709Z",
		"birthtime": "2019-03-02T01:32:10.709Z",
		"isdirectory": true
	},
	"filename": "mkdirp/examples"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 512,
		"ino": 135279,
		"size": 142,
		"blocks": 2,
		"atimeMs": 1551500530958.426,
		"mtimeMs": 1419626841000,
		"ctimeMs": 1551490330708.8396,
		"birthtimeMs": 1551490330708.8396,
		"atime": "2019-03-02T04:22:10.958Z",
		"mtime": "2014-12-26T20:47:21.000Z",
		"ctime": "2019-03-02T01:32:10.709Z",
		"birthtime": "2019-03-02T01:32:10.709Z",
		"isfile": true
	},
	"filename": "mkdirp/examples/pow.js",
	"content": "var mkdirp = require('mkdirp');\n\nmkdirp('/tmp/foo/bar/baz', function (err) {\n    if (err) console.error(err)\n    else console.log('pow!')\n});\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 3072,
		"ino": 135348,
		"size": 2630,
		"blocks": 4,
		"atimeMs": 1551500530962.426,
		"mtimeMs": 1431570694000,
		"ctimeMs": 1551490330700.8396,
		"birthtimeMs": 1551490330700.8396,
		"atime": "2019-03-02T04:22:10.962Z",
		"mtime": "2015-05-14T02:31:34.000Z",
		"ctime": "2019-03-02T01:32:10.701Z",
		"birthtime": "2019-03-02T01:32:10.701Z",
		"isfile": true
	},
	"filename": "mkdirp/index.js",
	"content": "var path = require('path');\nvar fs = require('fs');\nvar _0777 = parseInt('0777', 8);\n\nmodule.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;\n\nfunction mkdirP (p, opts, f, made) {\n    if (typeof opts === 'function') {\n        f = opts;\n        opts = {};\n    }\n    else if (!opts || typeof opts !== 'object') {\n        opts = { mode: opts };\n    }\n    \n    var mode = opts.mode;\n    var xfs = opts.fs || fs;\n    \n    if (mode === undefined) {\n        mode = _0777 & (~process.umask());\n    }\n    if (!made) made = null;\n    \n    var cb = f || function () {};\n    p = path.resolve(p);\n    \n    xfs.mkdir(p, mode, function (er) {\n        if (!er) {\n            made = made || p;\n            return cb(null, made);\n        }\n        switch (er.code) {\n            case 'ENOENT':\n                mkdirP(path.dirname(p), opts, function (er, made) {\n                    if (er) cb(er, made);\n                    else mkdirP(p, opts, cb, made);\n                });\n                break;\n\n            // In the case of any other error, just see if there's a dir\n            // there already.  If so, then hooray!  If not, then something\n            // is borked.\n            default:\n                xfs.stat(p, function (er2, stat) {\n                    // if the stat fails, then that's super weird.\n                    // let the original error be the failure reason.\n                    if (er2 || !stat.isDirectory()) cb(er, made)\n                    else cb(null, made);\n                });\n                break;\n        }\n    });\n}\n\nmkdirP.sync = function sync (p, opts, made) {\n    if (!opts || typeof opts !== 'object') {\n        opts = { mode: opts };\n    }\n    \n    var mode = opts.mode;\n    var xfs = opts.fs || fs;\n    \n    if (mode === undefined) {\n        mode = _0777 & (~process.umask());\n    }\n    if (!made) made = null;\n\n    p = path.resolve(p);\n\n    try {\n        xfs.mkdirSync(p, mode);\n        made = made || p;\n    }\n    catch (err0) {\n        switch (err0.code) {\n            case 'ENOENT' :\n                made = sync(path.dirname(p), opts, made);\n                sync(p, opts, made);\n                break;\n\n            // In the case of any other error, just see if there's a dir\n            // there already.  If so, then hooray!  If not, then something\n            // is borked.\n            default:\n                var stat;\n                try {\n                    stat = xfs.statSync(p);\n                }\n                catch (err1) {\n                    throw err0;\n                }\n                if (!stat.isDirectory()) throw err0;\n                break;\n        }\n    }\n\n    return made;\n};\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1536,
		"ino": 135155,
		"size": 1481,
		"blocks": 3,
		"atimeMs": 1551500604735.8352,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:23:24.736Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isfile": true
	},
	"filename": "mkdirp/package.json",
	"content": "{\n  \"_from\": \"mkdirp@^0.5.0\",\n  \"_id\": \"mkdirp@0.5.1\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha1-MAV0OOrGz3+MR2fzhkjWaX11yQM=\",\n  \"_location\": \"/mkdirp\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"range\",\n    \"registry\": true,\n    \"raw\": \"mkdirp@^0.5.0\",\n    \"name\": \"mkdirp\",\n    \"escapedName\": \"mkdirp\",\n    \"rawSpec\": \"^0.5.0\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"^0.5.0\"\n  },\n  \"_requiredBy\": [\n    \"/tar\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/mkdirp/-/mkdirp-0.5.1.tgz\",\n  \"_shasum\": \"30057438eac6cf7f8c4767f38648d6697d75c903\",\n  \"_spec\": \"mkdirp@^0.5.0\",\n  \"_where\": \"/disk1/projects/@kawix/std/compression/tar/node_modules/tar\",\n  \"author\": {\n    \"name\": \"James Halliday\",\n    \"email\": \"mail@substack.net\",\n    \"url\": \"http://substack.net\"\n  },\n  \"bin\": {\n    \"mkdirp\": \"bin/cmd.js\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/substack/node-mkdirp/issues\"\n  },\n  \"bundleDependencies\": false,\n  \"dependencies\": {\n    \"minimist\": \"0.0.8\"\n  },\n  \"deprecated\": false,\n  \"description\": \"Recursively mkdir, like `mkdir -p`\",\n  \"devDependencies\": {\n    \"mock-fs\": \"2 >=2.7.0\",\n    \"tap\": \"1\"\n  },\n  \"homepage\": \"https://github.com/substack/node-mkdirp#readme\",\n  \"keywords\": [\n    \"mkdir\",\n    \"directory\"\n  ],\n  \"license\": \"MIT\",\n  \"main\": \"index.js\",\n  \"name\": \"mkdirp\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/substack/node-mkdirp.git\"\n  },\n  \"scripts\": {\n    \"test\": \"tap test/*.js\"\n  },\n  \"version\": \"0.5.1\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2560,
		"ino": 135282,
		"size": 2095,
		"blocks": 4,
		"atimeMs": 1551500530958.426,
		"mtimeMs": 1419626841000,
		"ctimeMs": 1551490330708.8396,
		"birthtimeMs": 1551490330708.8396,
		"atime": "2019-03-02T04:22:10.958Z",
		"mtime": "2014-12-26T20:47:21.000Z",
		"ctime": "2019-03-02T01:32:10.709Z",
		"birthtime": "2019-03-02T01:32:10.709Z",
		"isfile": true
	},
	"filename": "mkdirp/readme.markdown",
	"content": "# mkdirp\n\nLike `mkdir -p`, but in node.js!\n\n[![build status](https://secure.travis-ci.org/substack/node-mkdirp.png)](http://travis-ci.org/substack/node-mkdirp)\n\n# example\n\n## pow.js\n\n```js\nvar mkdirp = require('mkdirp');\n    \nmkdirp('/tmp/foo/bar/baz', function (err) {\n    if (err) console.error(err)\n    else console.log('pow!')\n});\n```\n\nOutput\n\n```\npow!\n```\n\nAnd now /tmp/foo/bar/baz exists, huzzah!\n\n# methods\n\n```js\nvar mkdirp = require('mkdirp');\n```\n\n## mkdirp(dir, opts, cb)\n\nCreate a new directory and any necessary subdirectories at `dir` with octal\npermission string `opts.mode`. If `opts` is a non-object, it will be treated as\nthe `opts.mode`.\n\nIf `opts.mode` isn't specified, it defaults to `0777 & (~process.umask())`.\n\n`cb(err, made)` fires with the error or the first directory `made`\nthat had to be created, if any.\n\nYou can optionally pass in an alternate `fs` implementation by passing in\n`opts.fs`. Your implementation should have `opts.fs.mkdir(path, mode, cb)` and\n`opts.fs.stat(path, cb)`.\n\n## mkdirp.sync(dir, opts)\n\nSynchronously create a new directory and any necessary subdirectories at `dir`\nwith octal permission string `opts.mode`. If `opts` is a non-object, it will be\ntreated as the `opts.mode`.\n\nIf `opts.mode` isn't specified, it defaults to `0777 & (~process.umask())`.\n\nReturns the first directory that had to be created, if any.\n\nYou can optionally pass in an alternate `fs` implementation by passing in\n`opts.fs`. Your implementation should have `opts.fs.mkdirSync(path, mode)` and\n`opts.fs.statSync(path)`.\n\n# usage\n\nThis package also ships with a `mkdirp` command.\n\n```\nusage: mkdirp [DIR1,DIR2..] {OPTIONS}\n\n  Create each supplied directory including any necessary parent directories that\n  don't yet exist.\n  \n  If the directory already exists, do nothing.\n\nOPTIONS are:\n\n  -m, --mode   If a directory needs to be created, set the mode as an octal\n               permission string.\n\n```\n\n# install\n\nWith [npm](http://npmjs.org) do:\n\n```\nnpm install mkdirp\n```\n\nto get the library, or\n\n```\nnpm install -g mkdirp\n```\n\nto get the command.\n\n# license\n\nMIT\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135006,
		"size": 7,
		"blocks": 3,
		"atimeMs": 1551500646012.6226,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:24:06.013Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isdirectory": true
	},
	"filename": "safe-buffer"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 9216,
		"ino": 135011,
		"size": 8738,
		"blocks": 7,
		"atimeMs": 1551500530954.4258,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330692.8394,
		"birthtimeMs": 1551490330692.8394,
		"atime": "2019-03-02T04:22:10.954Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.693Z",
		"birthtime": "2019-03-02T01:32:10.693Z",
		"isfile": true
	},
	"filename": "safe-buffer/index.d.ts",
	"content": "declare module \"safe-buffer\" {\n  export class Buffer {\n    length: number\n    write(string: string, offset?: number, length?: number, encoding?: string): number;\n    toString(encoding?: string, start?: number, end?: number): string;\n    toJSON(): { type: 'Buffer', data: any[] };\n    equals(otherBuffer: Buffer): boolean;\n    compare(otherBuffer: Buffer, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number;\n    copy(targetBuffer: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;\n    slice(start?: number, end?: number): Buffer;\n    writeUIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;\n    writeUIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;\n    writeIntLE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;\n    writeIntBE(value: number, offset: number, byteLength: number, noAssert?: boolean): number;\n    readUIntLE(offset: number, byteLength: number, noAssert?: boolean): number;\n    readUIntBE(offset: number, byteLength: number, noAssert?: boolean): number;\n    readIntLE(offset: number, byteLength: number, noAssert?: boolean): number;\n    readIntBE(offset: number, byteLength: number, noAssert?: boolean): number;\n    readUInt8(offset: number, noAssert?: boolean): number;\n    readUInt16LE(offset: number, noAssert?: boolean): number;\n    readUInt16BE(offset: number, noAssert?: boolean): number;\n    readUInt32LE(offset: number, noAssert?: boolean): number;\n    readUInt32BE(offset: number, noAssert?: boolean): number;\n    readInt8(offset: number, noAssert?: boolean): number;\n    readInt16LE(offset: number, noAssert?: boolean): number;\n    readInt16BE(offset: number, noAssert?: boolean): number;\n    readInt32LE(offset: number, noAssert?: boolean): number;\n    readInt32BE(offset: number, noAssert?: boolean): number;\n    readFloatLE(offset: number, noAssert?: boolean): number;\n    readFloatBE(offset: number, noAssert?: boolean): number;\n    readDoubleLE(offset: number, noAssert?: boolean): number;\n    readDoubleBE(offset: number, noAssert?: boolean): number;\n    swap16(): Buffer;\n    swap32(): Buffer;\n    swap64(): Buffer;\n    writeUInt8(value: number, offset: number, noAssert?: boolean): number;\n    writeUInt16LE(value: number, offset: number, noAssert?: boolean): number;\n    writeUInt16BE(value: number, offset: number, noAssert?: boolean): number;\n    writeUInt32LE(value: number, offset: number, noAssert?: boolean): number;\n    writeUInt32BE(value: number, offset: number, noAssert?: boolean): number;\n    writeInt8(value: number, offset: number, noAssert?: boolean): number;\n    writeInt16LE(value: number, offset: number, noAssert?: boolean): number;\n    writeInt16BE(value: number, offset: number, noAssert?: boolean): number;\n    writeInt32LE(value: number, offset: number, noAssert?: boolean): number;\n    writeInt32BE(value: number, offset: number, noAssert?: boolean): number;\n    writeFloatLE(value: number, offset: number, noAssert?: boolean): number;\n    writeFloatBE(value: number, offset: number, noAssert?: boolean): number;\n    writeDoubleLE(value: number, offset: number, noAssert?: boolean): number;\n    writeDoubleBE(value: number, offset: number, noAssert?: boolean): number;\n    fill(value: any, offset?: number, end?: number): this;\n    indexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;\n    lastIndexOf(value: string | number | Buffer, byteOffset?: number, encoding?: string): number;\n    includes(value: string | number | Buffer, byteOffset?: number, encoding?: string): boolean;\n\n    /**\n     * Allocates a new buffer containing the given {str}.\n     *\n     * @param str String to store in buffer.\n     * @param encoding encoding to use, optional.  Default is 'utf8'\n     */\n     constructor (str: string, encoding?: string);\n    /**\n     * Allocates a new buffer of {size} octets.\n     *\n     * @param size count of octets to allocate.\n     */\n    constructor (size: number);\n    /**\n     * Allocates a new buffer containing the given {array} of octets.\n     *\n     * @param array The octets to store.\n     */\n    constructor (array: Uint8Array);\n    /**\n     * Produces a Buffer backed by the same allocated memory as\n     * the given {ArrayBuffer}.\n     *\n     *\n     * @param arrayBuffer The ArrayBuffer with which to share memory.\n     */\n    constructor (arrayBuffer: ArrayBuffer);\n    /**\n     * Allocates a new buffer containing the given {array} of octets.\n     *\n     * @param array The octets to store.\n     */\n    constructor (array: any[]);\n    /**\n     * Copies the passed {buffer} data onto a new {Buffer} instance.\n     *\n     * @param buffer The buffer to copy.\n     */\n    constructor (buffer: Buffer);\n    prototype: Buffer;\n    /**\n     * Allocates a new Buffer using an {array} of octets.\n     *\n     * @param array\n     */\n    static from(array: any[]): Buffer;\n    /**\n     * When passed a reference to the .buffer property of a TypedArray instance,\n     * the newly created Buffer will share the same allocated memory as the TypedArray.\n     * The optional {byteOffset} and {length} arguments specify a memory range\n     * within the {arrayBuffer} that will be shared by the Buffer.\n     *\n     * @param arrayBuffer The .buffer property of a TypedArray or a new ArrayBuffer()\n     * @param byteOffset\n     * @param length\n     */\n    static from(arrayBuffer: ArrayBuffer, byteOffset?: number, length?: number): Buffer;\n    /**\n     * Copies the passed {buffer} data onto a new Buffer instance.\n     *\n     * @param buffer\n     */\n    static from(buffer: Buffer): Buffer;\n    /**\n     * Creates a new Buffer containing the given JavaScript string {str}.\n     * If provided, the {encoding} parameter identifies the character encoding.\n     * If not provided, {encoding} defaults to 'utf8'.\n     *\n     * @param str\n     */\n    static from(str: string, encoding?: string): Buffer;\n    /**\n     * Returns true if {obj} is a Buffer\n     *\n     * @param obj object to test.\n     */\n    static isBuffer(obj: any): obj is Buffer;\n    /**\n     * Returns true if {encoding} is a valid encoding argument.\n     * Valid string encodings in Node 0.12: 'ascii'|'utf8'|'utf16le'|'ucs2'(alias of 'utf16le')|'base64'|'binary'(deprecated)|'hex'\n     *\n     * @param encoding string to test.\n     */\n    static isEncoding(encoding: string): boolean;\n    /**\n     * Gives the actual byte length of a string. encoding defaults to 'utf8'.\n     * This is not the same as String.prototype.length since that returns the number of characters in a string.\n     *\n     * @param string string to test.\n     * @param encoding encoding used to evaluate (defaults to 'utf8')\n     */\n    static byteLength(string: string, encoding?: string): number;\n    /**\n     * Returns a buffer which is the result of concatenating all the buffers in the list together.\n     *\n     * If the list has no items, or if the totalLength is 0, then it returns a zero-length buffer.\n     * If the list has exactly one item, then the first item of the list is returned.\n     * If the list has more than one item, then a new Buffer is created.\n     *\n     * @param list An array of Buffer objects to concatenate\n     * @param totalLength Total length of the buffers when concatenated.\n     *   If totalLength is not provided, it is read from the buffers in the list. However, this adds an additional loop to the function, so it is faster to provide the length explicitly.\n     */\n    static concat(list: Buffer[], totalLength?: number): Buffer;\n    /**\n     * The same as buf1.compare(buf2).\n     */\n    static compare(buf1: Buffer, buf2: Buffer): number;\n    /**\n     * Allocates a new buffer of {size} octets.\n     *\n     * @param size count of octets to allocate.\n     * @param fill if specified, buffer will be initialized by calling buf.fill(fill).\n     *    If parameter is omitted, buffer will be filled with zeros.\n     * @param encoding encoding used for call to buf.fill while initalizing\n     */\n    static alloc(size: number, fill?: string | Buffer | number, encoding?: string): Buffer;\n    /**\n     * Allocates a new buffer of {size} octets, leaving memory not initialized, so the contents\n     * of the newly created Buffer are unknown and may contain sensitive data.\n     *\n     * @param size count of octets to allocate\n     */\n    static allocUnsafe(size: number): Buffer;\n    /**\n     * Allocates a new non-pooled buffer of {size} octets, leaving memory not initialized, so the contents\n     * of the newly created Buffer are unknown and may contain sensitive data.\n     *\n     * @param size count of octets to allocate\n     */\n    static allocUnsafeSlow(size: number): Buffer;\n  }\n}"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1536,
		"ino": 135012,
		"size": 1529,
		"blocks": 3,
		"atimeMs": 1551500530954.4258,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330696.8394,
		"birthtimeMs": 1551490330696.8394,
		"atime": "2019-03-02T04:22:10.954Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.697Z",
		"birthtime": "2019-03-02T01:32:10.697Z",
		"isfile": true
	},
	"filename": "safe-buffer/index.js",
	"content": "/* eslint-disable node/no-deprecated-api */\nvar buffer = require('buffer')\nvar Buffer = buffer.Buffer\n\n// alternative to using Object.keys for old browsers\nfunction copyProps (src, dst) {\n  for (var key in src) {\n    dst[key] = src[key]\n  }\n}\nif (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {\n  module.exports = buffer\n} else {\n  // Copy properties from require('buffer')\n  copyProps(buffer, exports)\n  exports.Buffer = SafeBuffer\n}\n\nfunction SafeBuffer (arg, encodingOrOffset, length) {\n  return Buffer(arg, encodingOrOffset, length)\n}\n\n// Copy static methods from Buffer\ncopyProps(Buffer, SafeBuffer)\n\nSafeBuffer.from = function (arg, encodingOrOffset, length) {\n  if (typeof arg === 'number') {\n    throw new TypeError('Argument must not be a number')\n  }\n  return Buffer(arg, encodingOrOffset, length)\n}\n\nSafeBuffer.alloc = function (size, fill, encoding) {\n  if (typeof size !== 'number') {\n    throw new TypeError('Argument must be a number')\n  }\n  var buf = Buffer(size)\n  if (fill !== undefined) {\n    if (typeof encoding === 'string') {\n      buf.fill(fill, encoding)\n    } else {\n      buf.fill(fill)\n    }\n  } else {\n    buf.fill(0)\n  }\n  return buf\n}\n\nSafeBuffer.allocUnsafe = function (size) {\n  if (typeof size !== 'number') {\n    throw new TypeError('Argument must be a number')\n  }\n  return Buffer(size)\n}\n\nSafeBuffer.allocUnsafeSlow = function (size) {\n  if (typeof size !== 'number') {\n    throw new TypeError('Argument must be a number')\n  }\n  return buffer.SlowBuffer(size)\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2048,
		"ino": 135156,
		"size": 1625,
		"blocks": 4,
		"atimeMs": 1551500604735.8352,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:23:24.736Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isfile": true
	},
	"filename": "safe-buffer/package.json",
	"content": "{\n  \"_from\": \"safe-buffer@^5.1.2\",\n  \"_id\": \"safe-buffer@5.1.2\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha512-Gd2UZBJDkXlY7GbJxfsE8/nvKkUEU1G38c1siN6QP6a9PT9MmHB8GnpscSmMJSoF8LOIrt8ud/wPtojys4G6+g==\",\n  \"_location\": \"/safe-buffer\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"range\",\n    \"registry\": true,\n    \"raw\": \"safe-buffer@^5.1.2\",\n    \"name\": \"safe-buffer\",\n    \"escapedName\": \"safe-buffer\",\n    \"rawSpec\": \"^5.1.2\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"^5.1.2\"\n  },\n  \"_requiredBy\": [\n    \"/minipass\",\n    \"/tar\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.1.2.tgz\",\n  \"_shasum\": \"991ec69d296e0313747d59bdfd2b745c35f8828d\",\n  \"_spec\": \"safe-buffer@^5.1.2\",\n  \"_where\": \"/disk1/projects/@kawix/std/compression/tar/node_modules/tar\",\n  \"author\": {\n    \"name\": \"Feross Aboukhadijeh\",\n    \"email\": \"feross@feross.org\",\n    \"url\": \"http://feross.org\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/feross/safe-buffer/issues\"\n  },\n  \"bundleDependencies\": false,\n  \"deprecated\": false,\n  \"description\": \"Safer Node.js Buffer API\",\n  \"devDependencies\": {\n    \"standard\": \"*\",\n    \"tape\": \"^4.0.0\"\n  },\n  \"homepage\": \"https://github.com/feross/safe-buffer\",\n  \"keywords\": [\n    \"buffer\",\n    \"buffer allocate\",\n    \"node security\",\n    \"safe\",\n    \"safe-buffer\",\n    \"security\",\n    \"uninitialized\"\n  ],\n  \"license\": \"MIT\",\n  \"main\": \"index.js\",\n  \"name\": \"safe-buffer\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git://github.com/feross/safe-buffer.git\"\n  },\n  \"scripts\": {\n    \"test\": \"standard && tape test/*.js\"\n  },\n  \"types\": \"index.d.ts\",\n  \"version\": \"5.1.2\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 3,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135133,
		"size": 7,
		"blocks": 3,
		"atimeMs": 1551500646612.634,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:24:06.613Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isdirectory": true
	},
	"filename": "tar"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1024,
		"ino": 135342,
		"size": 683,
		"blocks": 2,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330700.8396,
		"birthtimeMs": 1551490330700.8396,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.701Z",
		"birthtime": "2019-03-02T01:32:10.701Z",
		"isfile": true
	},
	"filename": "tar/index.js",
	"content": "'use strict'\n\n// high-level commands\nexports.c = exports.create = require('./lib/create.js')\nexports.r = exports.replace = require('./lib/replace.js')\nexports.t = exports.list = require('./lib/list.js')\nexports.u = exports.update = require('./lib/update.js')\nexports.x = exports.extract = require('./lib/extract.js')\n\n// classes\nexports.Pack = require('./lib/pack.js')\nexports.Unpack = require('./lib/unpack.js')\nexports.Parse = require('./lib/parse.js')\nexports.ReadEntry = require('./lib/read-entry.js')\nexports.WriteEntry = require('./lib/write-entry.js')\nexports.Header = require('./lib/header.js')\nexports.Pax = require('./lib/pax.js')\nexports.types = require('./lib/types.js')\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135136,
		"size": 22,
		"blocks": 3,
		"atimeMs": 1551500646612.634,
		"mtimeMs": 1551490330720.8398,
		"ctimeMs": 1551490330720.8398,
		"birthtimeMs": 1551490330720.8398,
		"atime": "2019-03-02T04:24:06.613Z",
		"mtime": "2019-03-02T01:32:10.721Z",
		"ctime": "2019-03-02T01:32:10.721Z",
		"birthtime": "2019-03-02T01:32:10.721Z",
		"isdirectory": true
	},
	"filename": "tar/lib"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 512,
		"ino": 135278,
		"size": 283,
		"blocks": 2,
		"atimeMs": 1551500530966.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330708.8396,
		"birthtimeMs": 1551490330708.8396,
		"atime": "2019-03-02T04:22:10.966Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.709Z",
		"birthtime": "2019-03-02T01:32:10.709Z",
		"isfile": true
	},
	"filename": "tar/lib/buffer.js",
	"content": "'use strict'\n\n// Buffer in node 4.x < 4.5.0 doesn't have working Buffer.from\n// or Buffer.alloc, and Buffer in node 10 deprecated the ctor.\n// .M, this is fine .\\^/M..\nlet B = Buffer\n/* istanbul ignore next */\nif (!B.alloc) {\n  B = require('safe-buffer').Buffer\n}\nmodule.exports = B\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2560,
		"ino": 135281,
		"size": 2374,
		"blocks": 4,
		"atimeMs": 1551500530966.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330708.8396,
		"birthtimeMs": 1551490330708.8396,
		"atime": "2019-03-02T04:22:10.966Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.709Z",
		"birthtime": "2019-03-02T01:32:10.709Z",
		"isfile": true
	},
	"filename": "tar/lib/create.js",
	"content": "'use strict'\n\n// tar -c\nconst hlo = require('./high-level-opt.js')\n\nconst Pack = require('./pack.js')\nconst fs = require('fs')\nconst fsm = require('fs-minipass')\nconst t = require('./list.js')\nconst path = require('path')\n\nconst c = module.exports = (opt_, files, cb) => {\n  if (typeof files === 'function')\n    cb = files\n\n  if (Array.isArray(opt_))\n    files = opt_, opt_ = {}\n\n  if (!files || !Array.isArray(files) || !files.length)\n    throw new TypeError('no files or directories specified')\n\n  files = Array.from(files)\n\n  const opt = hlo(opt_)\n\n  if (opt.sync && typeof cb === 'function')\n    throw new TypeError('callback not supported for sync tar functions')\n\n  if (!opt.file && typeof cb === 'function')\n    throw new TypeError('callback only supported with file option')\n\n  return opt.file && opt.sync ? createFileSync(opt, files)\n    : opt.file ? createFile(opt, files, cb)\n    : opt.sync ? createSync(opt, files)\n    : create(opt, files)\n}\n\nconst createFileSync = (opt, files) => {\n  const p = new Pack.Sync(opt)\n  const stream = new fsm.WriteStreamSync(opt.file, {\n    mode: opt.mode || 0o666\n  })\n  p.pipe(stream)\n  addFilesSync(p, files)\n}\n\nconst createFile = (opt, files, cb) => {\n  const p = new Pack(opt)\n  const stream = new fsm.WriteStream(opt.file, {\n    mode: opt.mode || 0o666\n  })\n  p.pipe(stream)\n\n  const promise = new Promise((res, rej) => {\n    stream.on('error', rej)\n    stream.on('close', res)\n    p.on('error', rej)\n  })\n\n  addFilesAsync(p, files)\n\n  return cb ? promise.then(cb, cb) : promise\n}\n\nconst addFilesSync = (p, files) => {\n  files.forEach(file => {\n    if (file.charAt(0) === '@')\n      t({\n        file: path.resolve(p.cwd, file.substr(1)),\n        sync: true,\n        noResume: true,\n        onentry: entry => p.add(entry)\n      })\n    else\n      p.add(file)\n  })\n  p.end()\n}\n\nconst addFilesAsync = (p, files) => {\n  while (files.length) {\n    const file = files.shift()\n    if (file.charAt(0) === '@')\n      return t({\n        file: path.resolve(p.cwd, file.substr(1)),\n        noResume: true,\n        onentry: entry => p.add(entry)\n      }).then(_ => addFilesAsync(p, files))\n    else\n      p.add(file)\n  }\n  p.end()\n}\n\nconst createSync = (opt, files) => {\n  const p = new Pack.Sync(opt)\n  addFilesSync(p, files)\n  return p\n}\n\nconst create = (opt, files) => {\n  const p = new Pack(opt)\n  addFilesAsync(p, files)\n  return p\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 3072,
		"ino": 135284,
		"size": 2824,
		"blocks": 5,
		"atimeMs": 1551500530966.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330708.8396,
		"birthtimeMs": 1551490330708.8396,
		"atime": "2019-03-02T04:22:10.966Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.709Z",
		"birthtime": "2019-03-02T01:32:10.709Z",
		"isfile": true
	},
	"filename": "tar/lib/extract.js",
	"content": "'use strict'\n\n// tar -x\nconst hlo = require('./high-level-opt.js')\nconst Unpack = require('./unpack.js')\nconst fs = require('fs')\nconst fsm = require('fs-minipass')\nconst path = require('path')\n\nconst x = module.exports = (opt_, files, cb) => {\n  if (typeof opt_ === 'function')\n    cb = opt_, files = null, opt_ = {}\n  else if (Array.isArray(opt_))\n    files = opt_, opt_ = {}\n\n  if (typeof files === 'function')\n    cb = files, files = null\n\n  if (!files)\n    files = []\n  else\n    files = Array.from(files)\n\n  const opt = hlo(opt_)\n\n  if (opt.sync && typeof cb === 'function')\n    throw new TypeError('callback not supported for sync tar functions')\n\n  if (!opt.file && typeof cb === 'function')\n    throw new TypeError('callback only supported with file option')\n\n  if (files.length)\n    filesFilter(opt, files)\n\n  return opt.file && opt.sync ? extractFileSync(opt)\n    : opt.file ? extractFile(opt, cb)\n    : opt.sync ? extractSync(opt)\n    : extract(opt)\n}\n\n// construct a filter that limits the file entries listed\n// include child entries if a dir is included\nconst filesFilter = (opt, files) => {\n  const map = new Map(files.map(f => [f.replace(/\\/+$/, ''), true]))\n  const filter = opt.filter\n\n  const mapHas = (file, r) => {\n    const root = r || path.parse(file).root || '.'\n    const ret = file === root ? false\n      : map.has(file) ? map.get(file)\n      : mapHas(path.dirname(file), root)\n\n    map.set(file, ret)\n    return ret\n  }\n\n  opt.filter = filter\n    ? (file, entry) => filter(file, entry) && mapHas(file.replace(/\\/+$/, ''))\n    : file => mapHas(file.replace(/\\/+$/, ''))\n}\n\nconst extractFileSync = opt => {\n  const u = new Unpack.Sync(opt)\n\n  const file = opt.file\n  let threw = true\n  let fd\n  const stat = fs.statSync(file)\n  // This trades a zero-byte read() syscall for a stat\n  // However, it will usually result in less memory allocation\n  const readSize = opt.maxReadSize || 16*1024*1024\n  const stream = new fsm.ReadStreamSync(file, {\n    readSize: readSize,\n    size: stat.size\n  })\n  stream.pipe(u)\n}\n\nconst extractFile = (opt, cb) => {\n  const u = new Unpack(opt)\n  const readSize = opt.maxReadSize || 16*1024*1024\n\n  const file = opt.file\n  const p = new Promise((resolve, reject) => {\n    u.on('error', reject)\n    u.on('close', resolve)\n\n    // This trades a zero-byte read() syscall for a stat\n    // However, it will usually result in less memory allocation\n    fs.stat(file, (er, stat) => {\n      if (er)\n        reject(er)\n      else {\n        const stream = new fsm.ReadStream(file, {\n          readSize: readSize,\n          size: stat.size\n        })\n        stream.on('error', reject)\n        stream.pipe(u)\n      }\n    })\n  })\n  return cb ? p.then(cb, cb) : p\n}\n\nconst extractSync = opt => {\n  return new Unpack.Sync(opt)\n}\n\nconst extract = opt => {\n  return new Unpack(opt)\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 9216,
		"ino": 135142,
		"size": 9044,
		"blocks": 10,
		"atimeMs": 1551500530966.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330712.8398,
		"birthtimeMs": 1551490330712.8398,
		"atime": "2019-03-02T04:22:10.966Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.713Z",
		"birthtime": "2019-03-02T01:32:10.713Z",
		"isfile": true
	},
	"filename": "tar/lib/header.js",
	"content": "'use strict'\n// parse a 512-byte header block to a data object, or vice-versa\n// encode returns `true` if a pax extended header is needed, because\n// the data could not be faithfully encoded in a simple header.\n// (Also, check header.needPax to see if it needs a pax header.)\n\nconst Buffer = require('./buffer.js')\nconst types = require('./types.js')\nconst pathModule = require('path').posix\nconst large = require('./large-numbers.js')\n\nconst SLURP = Symbol('slurp')\nconst TYPE = Symbol('type')\n\nclass Header {\n  constructor (data, off, ex, gex) {\n    this.cksumValid = false\n    this.needPax = false\n    this.nullBlock = false\n\n    this.block = null\n    this.path = null\n    this.mode = null\n    this.uid = null\n    this.gid = null\n    this.size = null\n    this.mtime = null\n    this.cksum = null\n    this[TYPE] = '0'\n    this.linkpath = null\n    this.uname = null\n    this.gname = null\n    this.devmaj = 0\n    this.devmin = 0\n    this.atime = null\n    this.ctime = null\n\n    if (Buffer.isBuffer(data))\n      this.decode(data, off || 0, ex, gex)\n    else if (data)\n      this.set(data)\n  }\n\n  decode (buf, off, ex, gex) {\n    if (!off)\n      off = 0\n\n    if (!buf || !(buf.length >= off + 512))\n      throw new Error('need 512 bytes for header')\n\n    this.path = decString(buf, off, 100)\n    this.mode = decNumber(buf, off + 100, 8)\n    this.uid = decNumber(buf, off + 108, 8)\n    this.gid = decNumber(buf, off + 116, 8)\n    this.size = decNumber(buf, off + 124, 12)\n    this.mtime = decDate(buf, off + 136, 12)\n    this.cksum = decNumber(buf, off + 148, 12)\n\n    // if we have extended or global extended headers, apply them now\n    // See https://github.com/npm/node-tar/pull/187\n    this[SLURP](ex)\n    this[SLURP](gex, true)\n\n    // old tar versions marked dirs as a file with a trailing /\n    this[TYPE] = decString(buf, off + 156, 1)\n    if (this[TYPE] === '')\n      this[TYPE] = '0'\n    if (this[TYPE] === '0' && this.path.substr(-1) === '/')\n      this[TYPE] = '5'\n\n    // tar implementations sometimes incorrectly put the stat(dir).size\n    // as the size in the tarball, even though Directory entries are\n    // not able to have any body at all.  In the very rare chance that\n    // it actually DOES have a body, we weren't going to do anything with\n    // it anyway, and it'll just be a warning about an invalid header.\n    if (this[TYPE] === '5')\n      this.size = 0\n\n    this.linkpath = decString(buf, off + 157, 100)\n    if (buf.slice(off + 257, off + 265).toString() === 'ustar\\u000000') {\n      this.uname = decString(buf, off + 265, 32)\n      this.gname = decString(buf, off + 297, 32)\n      this.devmaj = decNumber(buf, off + 329, 8)\n      this.devmin = decNumber(buf, off + 337, 8)\n      if (buf[off + 475] !== 0) {\n        // definitely a prefix, definitely >130 chars.\n        const prefix = decString(buf, off + 345, 155)\n        this.path = prefix + '/' + this.path\n      } else {\n        const prefix = decString(buf, off + 345, 130)\n        if (prefix)\n          this.path = prefix + '/' + this.path\n        this.atime = decDate(buf, off + 476, 12)\n        this.ctime = decDate(buf, off + 488, 12)\n      }\n    }\n\n    let sum = 8 * 0x20\n    for (let i = off; i < off + 148; i++) {\n      sum += buf[i]\n    }\n    for (let i = off + 156; i < off + 512; i++) {\n      sum += buf[i]\n    }\n    this.cksumValid = sum === this.cksum\n    if (this.cksum === null && sum === 8 * 0x20)\n      this.nullBlock = true\n  }\n\n  [SLURP] (ex, global) {\n    for (let k in ex) {\n      // we slurp in everything except for the path attribute in\n      // a global extended header, because that's weird.\n      if (ex[k] !== null && ex[k] !== undefined &&\n          !(global && k === 'path'))\n        this[k] = ex[k]\n    }\n  }\n\n  encode (buf, off) {\n    if (!buf) {\n      buf = this.block = Buffer.alloc(512)\n      off = 0\n    }\n\n    if (!off)\n      off = 0\n\n    if (!(buf.length >= off + 512))\n      throw new Error('need 512 bytes for header')\n\n    const prefixSize = this.ctime || this.atime ? 130 : 155\n    const split = splitPrefix(this.path || '', prefixSize)\n    const path = split[0]\n    const prefix = split[1]\n    this.needPax = split[2]\n\n    this.needPax = encString(buf, off, 100, path) || this.needPax\n    this.needPax = encNumber(buf, off + 100, 8, this.mode) || this.needPax\n    this.needPax = encNumber(buf, off + 108, 8, this.uid) || this.needPax\n    this.needPax = encNumber(buf, off + 116, 8, this.gid) || this.needPax\n    this.needPax = encNumber(buf, off + 124, 12, this.size) || this.needPax\n    this.needPax = encDate(buf, off + 136, 12, this.mtime) || this.needPax\n    buf[off + 156] = this[TYPE].charCodeAt(0)\n    this.needPax = encString(buf, off + 157, 100, this.linkpath) || this.needPax\n    buf.write('ustar\\u000000', off + 257, 8)\n    this.needPax = encString(buf, off + 265, 32, this.uname) || this.needPax\n    this.needPax = encString(buf, off + 297, 32, this.gname) || this.needPax\n    this.needPax = encNumber(buf, off + 329, 8, this.devmaj) || this.needPax\n    this.needPax = encNumber(buf, off + 337, 8, this.devmin) || this.needPax\n    this.needPax = encString(buf, off + 345, prefixSize, prefix) || this.needPax\n    if (buf[off + 475] !== 0)\n      this.needPax = encString(buf, off + 345, 155, prefix) || this.needPax\n    else {\n      this.needPax = encString(buf, off + 345, 130, prefix) || this.needPax\n      this.needPax = encDate(buf, off + 476, 12, this.atime) || this.needPax\n      this.needPax = encDate(buf, off + 488, 12, this.ctime) || this.needPax\n    }\n\n    let sum = 8 * 0x20\n    for (let i = off; i < off + 148; i++) {\n      sum += buf[i]\n    }\n    for (let i = off + 156; i < off + 512; i++) {\n      sum += buf[i]\n    }\n    this.cksum = sum\n    encNumber(buf, off + 148, 8, this.cksum)\n    this.cksumValid = true\n\n    return this.needPax\n  }\n\n  set (data) {\n    for (let i in data) {\n      if (data[i] !== null && data[i] !== undefined)\n        this[i] = data[i]\n    }\n  }\n\n  get type () {\n    return types.name.get(this[TYPE]) || this[TYPE]\n  }\n\n  get typeKey () {\n    return this[TYPE]\n  }\n\n  set type (type) {\n    if (types.code.has(type))\n      this[TYPE] = types.code.get(type)\n    else\n      this[TYPE] = type\n  }\n}\n\nconst splitPrefix = (p, prefixSize) => {\n  const pathSize = 100\n  let pp = p\n  let prefix = ''\n  let ret\n  const root = pathModule.parse(p).root || '.'\n\n  if (Buffer.byteLength(pp) < pathSize)\n    ret = [pp, prefix, false]\n  else {\n    // first set prefix to the dir, and path to the base\n    prefix = pathModule.dirname(pp)\n    pp = pathModule.basename(pp)\n\n    do {\n      // both fit!\n      if (Buffer.byteLength(pp) <= pathSize &&\n          Buffer.byteLength(prefix) <= prefixSize)\n        ret = [pp, prefix, false]\n\n      // prefix fits in prefix, but path doesn't fit in path\n      else if (Buffer.byteLength(pp) > pathSize &&\n          Buffer.byteLength(prefix) <= prefixSize)\n        ret = [pp.substr(0, pathSize - 1), prefix, true]\n\n      else {\n        // make path take a bit from prefix\n        pp = pathModule.join(pathModule.basename(prefix), pp)\n        prefix = pathModule.dirname(prefix)\n      }\n    } while (prefix !== root && !ret)\n\n    // at this point, found no resolution, just truncate\n    if (!ret)\n      ret = [p.substr(0, pathSize - 1), '', true]\n  }\n  return ret\n}\n\nconst decString = (buf, off, size) =>\n  buf.slice(off, off + size).toString('utf8').replace(/\\0.*/, '')\n\nconst decDate = (buf, off, size) =>\n  numToDate(decNumber(buf, off, size))\n\nconst numToDate = num => num === null ? null : new Date(num * 1000)\n\nconst decNumber = (buf, off, size) =>\n  buf[off] & 0x80 ? large.parse(buf.slice(off, off + size))\n    : decSmallNumber(buf, off, size)\n\nconst nanNull = value => isNaN(value) ? null : value\n\nconst decSmallNumber = (buf, off, size) =>\n  nanNull(parseInt(\n    buf.slice(off, off + size)\n      .toString('utf8').replace(/\\0.*$/, '').trim(), 8))\n\n// the maximum encodable as a null-terminated octal, by field size\nconst MAXNUM = {\n  12: 0o77777777777,\n  8 : 0o7777777\n}\n\nconst encNumber = (buf, off, size, number) =>\n  number === null ? false :\n  number > MAXNUM[size] || number < 0\n    ? (large.encode(number, buf.slice(off, off + size)), true)\n    : (encSmallNumber(buf, off, size, number), false)\n\nconst encSmallNumber = (buf, off, size, number) =>\n  buf.write(octalString(number, size), off, size, 'ascii')\n\nconst octalString = (number, size) =>\n  padOctal(Math.floor(number).toString(8), size)\n\nconst padOctal = (string, size) =>\n  (string.length === size - 1 ? string\n  : new Array(size - string.length - 1).join('0') + string + ' ') + '\\0'\n\nconst encDate = (buf, off, size, date) =>\n  date === null ? false :\n  encNumber(buf, off, size, date.getTime() / 1000)\n\n// enough to fill the longest string we've got\nconst NULLS = new Array(156).join('\\0')\n// pad with nulls, return true if it's longer or non-ascii\nconst encString = (buf, off, size, string) =>\n  string === null ? false :\n  (buf.write(string + NULLS, off, size, 'utf8'),\n   string.length !== Buffer.byteLength(string) || string.length > size)\n\nmodule.exports = Header\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1024,
		"ino": 135285,
		"size": 772,
		"blocks": 3,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330712.8398,
		"birthtimeMs": 1551490330712.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.713Z",
		"birthtime": "2019-03-02T01:32:10.713Z",
		"isfile": true
	},
	"filename": "tar/lib/high-level-opt.js",
	"content": "'use strict'\n\n// turn tar(1) style args like `C` into the more verbose things like `cwd`\n\nconst argmap = new Map([\n  ['C', 'cwd'],\n  ['f', 'file'],\n  ['z', 'gzip'],\n  ['P', 'preservePaths'],\n  ['U', 'unlink'],\n  ['strip-components', 'strip'],\n  ['stripComponents', 'strip'],\n  ['keep-newer', 'newer'],\n  ['keepNewer', 'newer'],\n  ['keep-newer-files', 'newer'],\n  ['keepNewerFiles', 'newer'],\n  ['k', 'keep'],\n  ['keep-existing', 'keep'],\n  ['keepExisting', 'keep'],\n  ['m', 'noMtime'],\n  ['no-mtime', 'noMtime'],\n  ['p', 'preserveOwner'],\n  ['L', 'follow'],\n  ['h', 'follow']\n])\n\nconst parse = module.exports = opt => opt ? Object.keys(opt).map(k => [\n  argmap.has(k) ? argmap.get(k) : k, opt[k]\n]).reduce((set, kv) => (set[kv[0]] = kv[1], set), Object.create(null)) : {}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2048,
		"ino": 135287,
		"size": 1978,
		"blocks": 3,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330712.8398,
		"birthtimeMs": 1551490330712.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.713Z",
		"birthtime": "2019-03-02T01:32:10.713Z",
		"isfile": true
	},
	"filename": "tar/lib/large-numbers.js",
	"content": "'use strict'\n// Tar can encode large and negative numbers using a leading byte of\n// 0xff for negative, and 0x80 for positive.  The trailing byte in the\n// section will always be 0x20, or in some implementations 0x00.\n// this module encodes and decodes these things.\n\nconst encode = exports.encode = (num, buf) => {\n  buf[buf.length - 1] = 0x20\n  if (num < 0)\n    encodeNegative(num, buf)\n  else\n    encodePositive(num, buf)\n  return buf\n}\n\nconst encodePositive = (num, buf) => {\n  buf[0] = 0x80\n  for (var i = buf.length - 2; i > 0; i--) {\n    if (num === 0)\n      buf[i] = 0\n    else {\n      buf[i] = num % 0x100\n      num = Math.floor(num / 0x100)\n    }\n  }\n}\n\nconst encodeNegative = (num, buf) => {\n  buf[0] = 0xff\n  var flipped = false\n  num = num * -1\n  for (var i = buf.length - 2; i > 0; i--) {\n    var byte\n    if (num === 0)\n      byte = 0\n    else {\n      byte = num % 0x100\n      num = Math.floor(num / 0x100)\n    }\n    if (flipped)\n      buf[i] = onesComp(byte)\n    else if (byte === 0)\n      buf[i] = 0\n    else {\n      flipped = true\n      buf[i] = twosComp(byte)\n    }\n  }\n}\n\nconst parse = exports.parse = (buf) => {\n  var post = buf[buf.length - 1]\n  var pre = buf[0]\n  return pre === 0x80 ? pos(buf.slice(1, buf.length - 1))\n   : twos(buf.slice(1, buf.length - 1))\n}\n\nconst twos = (buf) => {\n  var len = buf.length\n  var sum = 0\n  var flipped = false\n  for (var i = len - 1; i > -1; i--) {\n    var byte = buf[i]\n    var f\n    if (flipped)\n      f = onesComp(byte)\n    else if (byte === 0)\n      f = byte\n    else {\n      flipped = true\n      f = twosComp(byte)\n    }\n    if (f !== 0)\n      sum += f * Math.pow(256, len - i - 1)\n  }\n  return sum * -1\n}\n\nconst pos = (buf) => {\n  var len = buf.length\n  var sum = 0\n  for (var i = len - 1; i > -1; i--) {\n    var byte = buf[i]\n    if (byte !== 0)\n      sum += byte * Math.pow(256, len - i - 1)\n  }\n  return sum\n}\n\nconst onesComp = byte => (0xff ^ byte) & 0xff\n\nconst twosComp = byte => ((0xff ^ byte) + 1) & 0xff\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 3584,
		"ino": 135370,
		"size": 3152,
		"blocks": 5,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330712.8398,
		"birthtimeMs": 1551490330712.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.713Z",
		"birthtime": "2019-03-02T01:32:10.713Z",
		"isfile": true
	},
	"filename": "tar/lib/list.js",
	"content": "'use strict'\n\nconst Buffer = require('./buffer.js')\n\n// XXX: This shares a lot in common with extract.js\n// maybe some DRY opportunity here?\n\n// tar -t\nconst hlo = require('./high-level-opt.js')\nconst Parser = require('./parse.js')\nconst fs = require('fs')\nconst fsm = require('fs-minipass')\nconst path = require('path')\n\nconst t = module.exports = (opt_, files, cb) => {\n  if (typeof opt_ === 'function')\n    cb = opt_, files = null, opt_ = {}\n  else if (Array.isArray(opt_))\n    files = opt_, opt_ = {}\n\n  if (typeof files === 'function')\n    cb = files, files = null\n\n  if (!files)\n    files = []\n  else\n    files = Array.from(files)\n\n  const opt = hlo(opt_)\n\n  if (opt.sync && typeof cb === 'function')\n    throw new TypeError('callback not supported for sync tar functions')\n\n  if (!opt.file && typeof cb === 'function')\n    throw new TypeError('callback only supported with file option')\n\n  if (files.length)\n    filesFilter(opt, files)\n\n  if (!opt.noResume)\n    onentryFunction(opt)\n\n  return opt.file && opt.sync ? listFileSync(opt)\n    : opt.file ? listFile(opt, cb)\n    : list(opt)\n}\n\nconst onentryFunction = opt => {\n  const onentry = opt.onentry\n  opt.onentry = onentry ? e => {\n    onentry(e)\n    e.resume()\n  } : e => e.resume()\n}\n\n// construct a filter that limits the file entries listed\n// include child entries if a dir is included\nconst filesFilter = (opt, files) => {\n  const map = new Map(files.map(f => [f.replace(/\\/+$/, ''), true]))\n  const filter = opt.filter\n\n  const mapHas = (file, r) => {\n    const root = r || path.parse(file).root || '.'\n    const ret = file === root ? false\n      : map.has(file) ? map.get(file)\n      : mapHas(path.dirname(file), root)\n\n    map.set(file, ret)\n    return ret\n  }\n\n  opt.filter = filter\n    ? (file, entry) => filter(file, entry) && mapHas(file.replace(/\\/+$/, ''))\n    : file => mapHas(file.replace(/\\/+$/, ''))\n}\n\nconst listFileSync = opt => {\n  const p = list(opt)\n  const file = opt.file\n  let threw = true\n  let fd\n  try {\n    const stat = fs.statSync(file)\n    const readSize = opt.maxReadSize || 16*1024*1024\n    if (stat.size < readSize) {\n      p.end(fs.readFileSync(file))\n    } else {\n      let pos = 0\n      const buf = Buffer.allocUnsafe(readSize)\n      fd = fs.openSync(file, 'r')\n      while (pos < stat.size) {\n        let bytesRead = fs.readSync(fd, buf, 0, readSize, pos)\n        pos += bytesRead\n        p.write(buf.slice(0, bytesRead))\n      }\n      p.end()\n    }\n    threw = false\n  } finally {\n    if (threw && fd)\n      try { fs.closeSync(fd) } catch (er) {}\n  }\n}\n\nconst listFile = (opt, cb) => {\n  const parse = new Parser(opt)\n  const readSize = opt.maxReadSize || 16*1024*1024\n\n  const file = opt.file\n  const p = new Promise((resolve, reject) => {\n    parse.on('error', reject)\n    parse.on('end', resolve)\n\n    fs.stat(file, (er, stat) => {\n      if (er)\n        reject(er)\n      else {\n        const stream = new fsm.ReadStream(file, {\n          readSize: readSize,\n          size: stat.size\n        })\n        stream.on('error', reject)\n        stream.pipe(parse)\n      }\n    })\n  })\n  return cb ? p.then(cb, cb) : p\n}\n\nconst list = opt => new Parser(opt)\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 5632,
		"ino": 135372,
		"size": 5180,
		"blocks": 6,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330712.8398,
		"birthtimeMs": 1551490330712.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.713Z",
		"birthtime": "2019-03-02T01:32:10.713Z",
		"isfile": true
	},
	"filename": "tar/lib/mkdir.js",
	"content": "'use strict'\n// wrapper around mkdirp for tar's needs.\n\n// TODO: This should probably be a class, not functionally\n// passing around state in a gazillion args.\n\nconst mkdirp = require('mkdirp')\nconst fs = require('fs')\nconst path = require('path')\nconst chownr = require('chownr')\n\nclass SymlinkError extends Error {\n  constructor (symlink, path) {\n    super('Cannot extract through symbolic link')\n    this.path = path\n    this.symlink = symlink\n  }\n\n  get name () {\n    return 'SylinkError'\n  }\n}\n\nclass CwdError extends Error {\n  constructor (path, code) {\n    super(code + ': Cannot cd into \\'' + path + '\\'')\n    this.path = path\n    this.code = code\n  }\n\n  get name () {\n    return 'CwdError'\n  }\n}\n\nconst mkdir = module.exports = (dir, opt, cb) => {\n  // if there's any overlap between mask and mode,\n  // then we'll need an explicit chmod\n  const umask = opt.umask\n  const mode = opt.mode | 0o0700\n  const needChmod = (mode & umask) !== 0\n\n  const uid = opt.uid\n  const gid = opt.gid\n  const doChown = typeof uid === 'number' &&\n    typeof gid === 'number' &&\n    ( uid !== opt.processUid || gid !== opt.processGid )\n\n  const preserve = opt.preserve\n  const unlink = opt.unlink\n  const cache = opt.cache\n  const cwd = opt.cwd\n\n  const done = (er, created) => {\n    if (er)\n      cb(er)\n    else {\n      cache.set(dir, true)\n      if (created && doChown)\n        chownr(created, uid, gid, er => done(er))\n      else if (needChmod)\n        fs.chmod(dir, mode, cb)\n      else\n        cb()\n    }\n  }\n\n  if (cache && cache.get(dir) === true)\n    return done()\n\n  if (dir === cwd)\n    return fs.lstat(dir, (er, st) => {\n      if (er || !st.isDirectory())\n        er = new CwdError(dir, er && er.code || 'ENOTDIR')\n      done(er)\n    })\n\n  if (preserve)\n    return mkdirp(dir, mode, done)\n\n  const sub = path.relative(cwd, dir)\n  const parts = sub.split(/\\/|\\\\/)\n  mkdir_(cwd, parts, mode, cache, unlink, cwd, null, done)\n}\n\nconst mkdir_ = (base, parts, mode, cache, unlink, cwd, created, cb) => {\n  if (!parts.length)\n    return cb(null, created)\n  const p = parts.shift()\n  const part = base + '/' + p\n  if (cache.get(part))\n    return mkdir_(part, parts, mode, cache, unlink, cwd, created, cb)\n  fs.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb))\n}\n\nconst onmkdir = (part, parts, mode, cache, unlink, cwd, created, cb) => er => {\n  if (er) {\n    if (er.path && path.dirname(er.path) === cwd &&\n        (er.code === 'ENOTDIR' || er.code === 'ENOENT'))\n      return cb(new CwdError(cwd, er.code))\n\n    fs.lstat(part, (statEr, st) => {\n      if (statEr)\n        cb(statEr)\n      else if (st.isDirectory())\n        mkdir_(part, parts, mode, cache, unlink, cwd, created, cb)\n      else if (unlink)\n        fs.unlink(part, er => {\n          if (er)\n            return cb(er)\n          fs.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb))\n        })\n      else if (st.isSymbolicLink())\n        return cb(new SymlinkError(part, part + '/' + parts.join('/')))\n      else\n        cb(er)\n    })\n  } else {\n    created = created || part\n    mkdir_(part, parts, mode, cache, unlink, cwd, created, cb)\n  }\n}\n\nconst mkdirSync = module.exports.sync = (dir, opt) => {\n  // if there's any overlap between mask and mode,\n  // then we'll need an explicit chmod\n  const umask = opt.umask\n  const mode = opt.mode | 0o0700\n  const needChmod = (mode & umask) !== 0\n\n  const uid = opt.uid\n  const gid = opt.gid\n  const doChown = typeof uid === 'number' &&\n    typeof gid === 'number' &&\n    ( uid !== opt.processUid || gid !== opt.processGid )\n\n  const preserve = opt.preserve\n  const unlink = opt.unlink\n  const cache = opt.cache\n  const cwd = opt.cwd\n\n  const done = (created) => {\n    cache.set(dir, true)\n    if (created && doChown)\n      chownr.sync(created, uid, gid)\n    if (needChmod)\n      fs.chmodSync(dir, mode)\n  }\n\n  if (cache && cache.get(dir) === true)\n    return done()\n\n  if (dir === cwd) {\n    let ok = false\n    let code = 'ENOTDIR'\n    try {\n      ok = fs.lstatSync(dir).isDirectory()\n    } catch (er) {\n      code = er.code\n    } finally {\n      if (!ok)\n        throw new CwdError(dir, code)\n    }\n    done()\n    return\n  }\n\n  if (preserve)\n    return done(mkdirp.sync(dir, mode))\n\n  const sub = path.relative(cwd, dir)\n  const parts = sub.split(/\\/|\\\\/)\n  let created = null\n  for (let p = parts.shift(), part = cwd;\n       p && (part += '/' + p);\n       p = parts.shift()) {\n\n    if (cache.get(part))\n      continue\n\n    try {\n      fs.mkdirSync(part, mode)\n      created = created || part\n      cache.set(part, true)\n    } catch (er) {\n      if (er.path && path.dirname(er.path) === cwd &&\n          (er.code === 'ENOTDIR' || er.code === 'ENOENT'))\n        return new CwdError(cwd, er.code)\n\n      const st = fs.lstatSync(part)\n      if (st.isDirectory()) {\n        cache.set(part, true)\n        continue\n      } else if (unlink) {\n        fs.unlinkSync(part)\n        fs.mkdirSync(part, mode)\n        created = created || part\n        cache.set(part, true)\n        continue\n      } else if (st.isSymbolicLink())\n        return new SymlinkError(part, part + '/' + parts.join('/'))\n    }\n  }\n\n  return done(created)\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 512,
		"ino": 135289,
		"size": 277,
		"blocks": 2,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330712.8398,
		"birthtimeMs": 1551490330712.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.713Z",
		"birthtime": "2019-03-02T01:32:10.713Z",
		"isfile": true
	},
	"filename": "tar/lib/mode-fix.js",
	"content": "'use strict'\nmodule.exports = (mode, isDir) => {\n  mode &= 0o7777\n  // if dirs are readable, then they should be listable\n  if (isDir) {\n    if (mode & 0o400)\n      mode |= 0o100\n    if (mode & 0o40)\n      mode |= 0o10\n    if (mode & 0o4)\n      mode |= 0o1\n  }\n  return mode\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 9728,
		"ino": 135145,
		"size": 9614,
		"blocks": 11,
		"atimeMs": 1551500530966.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330716.8398,
		"birthtimeMs": 1551490330716.8398,
		"atime": "2019-03-02T04:22:10.966Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.717Z",
		"birthtime": "2019-03-02T01:32:10.717Z",
		"isfile": true
	},
	"filename": "tar/lib/pack.js",
	"content": "'use strict'\n\nconst Buffer = require('./buffer.js')\n\n// A readable tar stream creator\n// Technically, this is a transform stream that you write paths into,\n// and tar format comes out of.\n// The `add()` method is like `write()` but returns this,\n// and end() return `this` as well, so you can\n// do `new Pack(opt).add('files').add('dir').end().pipe(output)\n// You could also do something like:\n// streamOfPaths().pipe(new Pack()).pipe(new fs.WriteStream('out.tar'))\n\nclass PackJob {\n  constructor (path, absolute) {\n    this.path = path || './'\n    this.absolute = absolute\n    this.entry = null\n    this.stat = null\n    this.readdir = null\n    this.pending = false\n    this.ignore = false\n    this.piped = false\n  }\n}\n\nconst MiniPass = require('minipass')\nconst zlib = require('minizlib')\nconst ReadEntry = require('./read-entry.js')\nconst WriteEntry = require('./write-entry.js')\nconst WriteEntrySync = WriteEntry.Sync\nconst WriteEntryTar = WriteEntry.Tar\nconst Yallist = require('yallist')\nconst EOF = Buffer.alloc(1024)\nconst ONSTAT = Symbol('onStat')\nconst ENDED = Symbol('ended')\nconst QUEUE = Symbol('queue')\nconst CURRENT = Symbol('current')\nconst PROCESS = Symbol('process')\nconst PROCESSING = Symbol('processing')\nconst PROCESSJOB = Symbol('processJob')\nconst JOBS = Symbol('jobs')\nconst JOBDONE = Symbol('jobDone')\nconst ADDFSENTRY = Symbol('addFSEntry')\nconst ADDTARENTRY = Symbol('addTarEntry')\nconst STAT = Symbol('stat')\nconst READDIR = Symbol('readdir')\nconst ONREADDIR = Symbol('onreaddir')\nconst PIPE = Symbol('pipe')\nconst ENTRY = Symbol('entry')\nconst ENTRYOPT = Symbol('entryOpt')\nconst WRITEENTRYCLASS = Symbol('writeEntryClass')\nconst WRITE = Symbol('write')\nconst ONDRAIN = Symbol('ondrain')\n\nconst fs = require('fs')\nconst path = require('path')\nconst warner = require('./warn-mixin.js')\n\nconst Pack = warner(class Pack extends MiniPass {\n  constructor (opt) {\n    super(opt)\n    opt = opt || Object.create(null)\n    this.opt = opt\n    this.cwd = opt.cwd || process.cwd()\n    this.maxReadSize = opt.maxReadSize\n    this.preservePaths = !!opt.preservePaths\n    this.strict = !!opt.strict\n    this.noPax = !!opt.noPax\n    this.prefix = (opt.prefix || '').replace(/(\\\\|\\/)+$/, '')\n    this.linkCache = opt.linkCache || new Map()\n    this.statCache = opt.statCache || new Map()\n    this.readdirCache = opt.readdirCache || new Map()\n\n    this[WRITEENTRYCLASS] = WriteEntry\n    if (typeof opt.onwarn === 'function')\n      this.on('warn', opt.onwarn)\n\n    this.zip = null\n    if (opt.gzip) {\n      if (typeof opt.gzip !== 'object')\n        opt.gzip = {}\n      this.zip = new zlib.Gzip(opt.gzip)\n      this.zip.on('data', chunk => super.write(chunk))\n      this.zip.on('end', _ => super.end())\n      this.zip.on('drain', _ => this[ONDRAIN]())\n      this.on('resume', _ => this.zip.resume())\n    } else\n      this.on('drain', this[ONDRAIN])\n\n    this.portable = !!opt.portable\n    this.noDirRecurse = !!opt.noDirRecurse\n    this.follow = !!opt.follow\n    this.noMtime = !!opt.noMtime\n    this.mtime = opt.mtime || null\n\n    this.filter = typeof opt.filter === 'function' ? opt.filter : _ => true\n\n    this[QUEUE] = new Yallist\n    this[JOBS] = 0\n    this.jobs = +opt.jobs || 4\n    this[PROCESSING] = false\n    this[ENDED] = false\n  }\n\n  [WRITE] (chunk) {\n    return super.write(chunk)\n  }\n\n  add (path) {\n    this.write(path)\n    return this\n  }\n\n  end (path) {\n    if (path)\n      this.write(path)\n    this[ENDED] = true\n    this[PROCESS]()\n    return this\n  }\n\n  write (path) {\n    if (this[ENDED])\n      throw new Error('write after end')\n\n    if (path instanceof ReadEntry)\n      this[ADDTARENTRY](path)\n    else\n      this[ADDFSENTRY](path)\n    return this.flowing\n  }\n\n  [ADDTARENTRY] (p) {\n    const absolute = path.resolve(this.cwd, p.path)\n    if (this.prefix)\n      p.path = this.prefix + '/' + p.path.replace(/^\\.(\\/+|$)/, '')\n\n    // in this case, we don't have to wait for the stat\n    if (!this.filter(p.path, p))\n      p.resume()\n    else {\n      const job = new PackJob(p.path, absolute, false)\n      job.entry = new WriteEntryTar(p, this[ENTRYOPT](job))\n      job.entry.on('end', _ => this[JOBDONE](job))\n      this[JOBS] += 1\n      this[QUEUE].push(job)\n    }\n\n    this[PROCESS]()\n  }\n\n  [ADDFSENTRY] (p) {\n    const absolute = path.resolve(this.cwd, p)\n    if (this.prefix)\n      p = this.prefix + '/' + p.replace(/^\\.(\\/+|$)/, '')\n\n    this[QUEUE].push(new PackJob(p, absolute))\n    this[PROCESS]()\n  }\n\n  [STAT] (job) {\n    job.pending = true\n    this[JOBS] += 1\n    const stat = this.follow ? 'stat' : 'lstat'\n    fs[stat](job.absolute, (er, stat) => {\n      job.pending = false\n      this[JOBS] -= 1\n      if (er)\n        this.emit('error', er)\n      else\n        this[ONSTAT](job, stat)\n    })\n  }\n\n  [ONSTAT] (job, stat) {\n    this.statCache.set(job.absolute, stat)\n    job.stat = stat\n\n    // now we have the stat, we can filter it.\n    if (!this.filter(job.path, stat))\n      job.ignore = true\n\n    this[PROCESS]()\n  }\n\n  [READDIR] (job) {\n    job.pending = true\n    this[JOBS] += 1\n    fs.readdir(job.absolute, (er, entries) => {\n      job.pending = false\n      this[JOBS] -= 1\n      if (er)\n        return this.emit('error', er)\n      this[ONREADDIR](job, entries)\n    })\n  }\n\n  [ONREADDIR] (job, entries) {\n    this.readdirCache.set(job.absolute, entries)\n    job.readdir = entries\n    this[PROCESS]()\n  }\n\n  [PROCESS] () {\n    if (this[PROCESSING])\n      return\n\n    this[PROCESSING] = true\n    for (let w = this[QUEUE].head;\n         w !== null && this[JOBS] < this.jobs;\n         w = w.next) {\n      this[PROCESSJOB](w.value)\n      if (w.value.ignore) {\n        const p = w.next\n        this[QUEUE].removeNode(w)\n        w.next = p\n      }\n    }\n\n    this[PROCESSING] = false\n\n    if (this[ENDED] && !this[QUEUE].length && this[JOBS] === 0) {\n      if (this.zip)\n        this.zip.end(EOF)\n      else {\n        super.write(EOF)\n        super.end()\n      }\n    }\n  }\n\n  get [CURRENT] () {\n    return this[QUEUE] && this[QUEUE].head && this[QUEUE].head.value\n  }\n\n  [JOBDONE] (job) {\n    this[QUEUE].shift()\n    this[JOBS] -= 1\n    this[PROCESS]()\n  }\n\n  [PROCESSJOB] (job) {\n    if (job.pending)\n      return\n\n    if (job.entry) {\n      if (job === this[CURRENT] && !job.piped)\n        this[PIPE](job)\n      return\n    }\n\n    if (!job.stat) {\n      if (this.statCache.has(job.absolute))\n        this[ONSTAT](job, this.statCache.get(job.absolute))\n      else\n        this[STAT](job)\n    }\n    if (!job.stat)\n      return\n\n    // filtered out!\n    if (job.ignore)\n      return\n\n    if (!this.noDirRecurse && job.stat.isDirectory() && !job.readdir) {\n      if (this.readdirCache.has(job.absolute))\n        this[ONREADDIR](job, this.readdirCache.get(job.absolute))\n      else\n        this[READDIR](job)\n      if (!job.readdir)\n        return\n    }\n\n    // we know it doesn't have an entry, because that got checked above\n    job.entry = this[ENTRY](job)\n    if (!job.entry) {\n      job.ignore = true\n      return\n    }\n\n    if (job === this[CURRENT] && !job.piped)\n      this[PIPE](job)\n  }\n\n  [ENTRYOPT] (job) {\n    return {\n      onwarn: (msg, data) => {\n        this.warn(msg, data)\n      },\n      noPax: this.noPax,\n      cwd: this.cwd,\n      absolute: job.absolute,\n      preservePaths: this.preservePaths,\n      maxReadSize: this.maxReadSize,\n      strict: this.strict,\n      portable: this.portable,\n      linkCache: this.linkCache,\n      statCache: this.statCache,\n      noMtime: this.noMtime,\n      mtime: this.mtime\n    }\n  }\n\n  [ENTRY] (job) {\n    this[JOBS] += 1\n    try {\n      return new this[WRITEENTRYCLASS](job.path, this[ENTRYOPT](job))\n        .on('end', () => this[JOBDONE](job))\n        .on('error', er => this.emit('error', er))\n    } catch (er) {\n      this.emit('error', er)\n    }\n  }\n\n  [ONDRAIN] () {\n    if (this[CURRENT] && this[CURRENT].entry)\n      this[CURRENT].entry.resume()\n  }\n\n  // like .pipe() but using super, because our write() is special\n  [PIPE] (job) {\n    job.piped = true\n\n    if (job.readdir)\n      job.readdir.forEach(entry => {\n        const p = this.prefix ?\n          job.path.slice(this.prefix.length + 1) || './'\n          : job.path\n\n        const base = p === './' ? '' : p.replace(/\\/*$/, '/')\n        this[ADDFSENTRY](base + entry)\n      })\n\n    const source = job.entry\n    const zip = this.zip\n\n    if (zip)\n      source.on('data', chunk => {\n        if (!zip.write(chunk))\n          source.pause()\n      })\n    else\n      source.on('data', chunk => {\n        if (!super.write(chunk))\n          source.pause()\n      })\n  }\n\n  pause () {\n    if (this.zip)\n      this.zip.pause()\n    return super.pause()\n  }\n})\n\nclass PackSync extends Pack {\n  constructor (opt) {\n    super(opt)\n    this[WRITEENTRYCLASS] = WriteEntrySync\n  }\n\n  // pause/resume are no-ops in sync streams.\n  pause () {}\n  resume () {}\n\n  [STAT] (job) {\n    const stat = this.follow ? 'statSync' : 'lstatSync'\n    this[ONSTAT](job, fs[stat](job.absolute))\n  }\n\n  [READDIR] (job, stat) {\n    this[ONREADDIR](job, fs.readdirSync(job.absolute))\n  }\n\n  // gotta get it all in this tick\n  [PIPE] (job) {\n    const source = job.entry\n    const zip = this.zip\n\n    if (job.readdir)\n      job.readdir.forEach(entry => {\n        const p = this.prefix ?\n          job.path.slice(this.prefix.length + 1) || './'\n          : job.path\n\n        const base = p === './' ? '' : p.replace(/\\/*$/, '/')\n        this[ADDFSENTRY](base + entry)\n      })\n\n    if (zip)\n      source.on('data', chunk => {\n        zip.write(chunk)\n      })\n    else\n      source.on('data', chunk => {\n        super[WRITE](chunk)\n      })\n  }\n}\n\nPack.Sync = PackSync\n\nmodule.exports = Pack\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 12288,
		"ino": 135148,
		"size": 12050,
		"blocks": 13,
		"atimeMs": 1551500530966.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330716.8398,
		"birthtimeMs": 1551490330716.8398,
		"atime": "2019-03-02T04:22:10.966Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.717Z",
		"birthtime": "2019-03-02T01:32:10.717Z",
		"isfile": true
	},
	"filename": "tar/lib/parse.js",
	"content": "'use strict'\n\n// this[BUFFER] is the remainder of a chunk if we're waiting for\n// the full 512 bytes of a header to come in.  We will Buffer.concat()\n// it to the next write(), which is a mem copy, but a small one.\n//\n// this[QUEUE] is a Yallist of entries that haven't been emitted\n// yet this can only get filled up if the user keeps write()ing after\n// a write() returns false, or does a write() with more than one entry\n//\n// We don't buffer chunks, we always parse them and either create an\n// entry, or push it into the active entry.  The ReadEntry class knows\n// to throw data away if .ignore=true\n//\n// Shift entry off the buffer when it emits 'end', and emit 'entry' for\n// the next one in the list.\n//\n// At any time, we're pushing body chunks into the entry at WRITEENTRY,\n// and waiting for 'end' on the entry at READENTRY\n//\n// ignored entries get .resume() called on them straight away\n\nconst warner = require('./warn-mixin.js')\nconst path = require('path')\nconst Header = require('./header.js')\nconst EE = require('events')\nconst Yallist = require('yallist')\nconst maxMetaEntrySize = 1024 * 1024\nconst Entry = require('./read-entry.js')\nconst Pax = require('./pax.js')\nconst zlib = require('minizlib')\nconst Buffer = require('./buffer.js')\n\nconst gzipHeader = Buffer.from([0x1f, 0x8b])\nconst STATE = Symbol('state')\nconst WRITEENTRY = Symbol('writeEntry')\nconst READENTRY = Symbol('readEntry')\nconst NEXTENTRY = Symbol('nextEntry')\nconst PROCESSENTRY = Symbol('processEntry')\nconst EX = Symbol('extendedHeader')\nconst GEX = Symbol('globalExtendedHeader')\nconst META = Symbol('meta')\nconst EMITMETA = Symbol('emitMeta')\nconst BUFFER = Symbol('buffer')\nconst QUEUE = Symbol('queue')\nconst ENDED = Symbol('ended')\nconst EMITTEDEND = Symbol('emittedEnd')\nconst EMIT = Symbol('emit')\nconst UNZIP = Symbol('unzip')\nconst CONSUMECHUNK = Symbol('consumeChunk')\nconst CONSUMECHUNKSUB = Symbol('consumeChunkSub')\nconst CONSUMEBODY = Symbol('consumeBody')\nconst CONSUMEMETA = Symbol('consumeMeta')\nconst CONSUMEHEADER = Symbol('consumeHeader')\nconst CONSUMING = Symbol('consuming')\nconst BUFFERCONCAT = Symbol('bufferConcat')\nconst MAYBEEND = Symbol('maybeEnd')\nconst WRITING = Symbol('writing')\nconst ABORTED = Symbol('aborted')\nconst DONE = Symbol('onDone')\n\nconst noop = _ => true\n\nmodule.exports = warner(class Parser extends EE {\n  constructor (opt) {\n    opt = opt || {}\n    super(opt)\n\n    if (opt.ondone)\n      this.on(DONE, opt.ondone)\n    else\n      this.on(DONE, _ => {\n        this.emit('prefinish')\n        this.emit('finish')\n        this.emit('end')\n        this.emit('close')\n      })\n\n    this.strict = !!opt.strict\n    this.maxMetaEntrySize = opt.maxMetaEntrySize || maxMetaEntrySize\n    this.filter = typeof opt.filter === 'function' ? opt.filter : noop\n\n    // have to set this so that streams are ok piping into it\n    this.writable = true\n    this.readable = false\n\n    this[QUEUE] = new Yallist()\n    this[BUFFER] = null\n    this[READENTRY] = null\n    this[WRITEENTRY] = null\n    this[STATE] = 'begin'\n    this[META] = ''\n    this[EX] = null\n    this[GEX] = null\n    this[ENDED] = false\n    this[UNZIP] = null\n    this[ABORTED] = false\n    if (typeof opt.onwarn === 'function')\n      this.on('warn', opt.onwarn)\n    if (typeof opt.onentry === 'function')\n      this.on('entry', opt.onentry)\n  }\n\n  [CONSUMEHEADER] (chunk, position) {\n    const header = new Header(chunk, position, this[EX], this[GEX])\n\n    if (header.nullBlock)\n      this[EMIT]('nullBlock')\n    else if (!header.cksumValid)\n      this.warn('invalid entry', header)\n    else if (!header.path)\n      this.warn('invalid: path is required', header)\n    else {\n      const type = header.type\n      if (/^(Symbolic)?Link$/.test(type) && !header.linkpath)\n        this.warn('invalid: linkpath required', header)\n      else if (!/^(Symbolic)?Link$/.test(type) && header.linkpath)\n        this.warn('invalid: linkpath forbidden', header)\n      else {\n        const entry = this[WRITEENTRY] = new Entry(header, this[EX], this[GEX])\n\n        if (entry.meta) {\n          if (entry.size > this.maxMetaEntrySize) {\n            entry.ignore = true\n            this[EMIT]('ignoredEntry', entry)\n            this[STATE] = 'ignore'\n          } else if (entry.size > 0) {\n            this[META] = ''\n            entry.on('data', c => this[META] += c)\n            this[STATE] = 'meta'\n          }\n        } else {\n\n          this[EX] = null\n          entry.ignore = entry.ignore || !this.filter(entry.path, entry)\n          if (entry.ignore) {\n            this[EMIT]('ignoredEntry', entry)\n            this[STATE] = entry.remain ? 'ignore' : 'begin'\n          } else {\n            if (entry.remain)\n              this[STATE] = 'body'\n            else {\n              this[STATE] = 'begin'\n              entry.end()\n            }\n\n            if (!this[READENTRY]) {\n              this[QUEUE].push(entry)\n              this[NEXTENTRY]()\n            } else\n              this[QUEUE].push(entry)\n          }\n        }\n      }\n    }\n  }\n\n  [PROCESSENTRY] (entry) {\n    let go = true\n\n    if (!entry) {\n      this[READENTRY] = null\n      go = false\n    } else if (Array.isArray(entry))\n      this.emit.apply(this, entry)\n    else {\n      this[READENTRY] = entry\n      this.emit('entry', entry)\n      if (!entry.emittedEnd) {\n        entry.on('end', _ => this[NEXTENTRY]())\n        go = false\n      }\n    }\n\n    return go\n  }\n\n  [NEXTENTRY] () {\n    do {} while (this[PROCESSENTRY](this[QUEUE].shift()))\n\n    if (!this[QUEUE].length) {\n      // At this point, there's nothing in the queue, but we may have an\n      // entry which is being consumed (readEntry).\n      // If we don't, then we definitely can handle more data.\n      // If we do, and either it's flowing, or it has never had any data\n      // written to it, then it needs more.\n      // The only other possibility is that it has returned false from a\n      // write() call, so we wait for the next drain to continue.\n      const re = this[READENTRY]\n      const drainNow = !re || re.flowing || re.size === re.remain\n      if (drainNow) {\n        if (!this[WRITING])\n          this.emit('drain')\n      } else\n        re.once('drain', _ => this.emit('drain'))\n     }\n  }\n\n  [CONSUMEBODY] (chunk, position) {\n    // write up to but no  more than writeEntry.blockRemain\n    const entry = this[WRITEENTRY]\n    const br = entry.blockRemain\n    const c = (br >= chunk.length && position === 0) ? chunk\n      : chunk.slice(position, position + br)\n\n    entry.write(c)\n\n    if (!entry.blockRemain) {\n      this[STATE] = 'begin'\n      this[WRITEENTRY] = null\n      entry.end()\n    }\n\n    return c.length\n  }\n\n  [CONSUMEMETA] (chunk, position) {\n    const entry = this[WRITEENTRY]\n    const ret = this[CONSUMEBODY](chunk, position)\n\n    // if we finished, then the entry is reset\n    if (!this[WRITEENTRY])\n      this[EMITMETA](entry)\n\n    return ret\n  }\n\n  [EMIT] (ev, data, extra) {\n    if (!this[QUEUE].length && !this[READENTRY])\n      this.emit(ev, data, extra)\n    else\n      this[QUEUE].push([ev, data, extra])\n  }\n\n  [EMITMETA] (entry) {\n    this[EMIT]('meta', this[META])\n    switch (entry.type) {\n      case 'ExtendedHeader':\n      case 'OldExtendedHeader':\n        this[EX] = Pax.parse(this[META], this[EX], false)\n        break\n\n      case 'GlobalExtendedHeader':\n        this[GEX] = Pax.parse(this[META], this[GEX], true)\n        break\n\n      case 'NextFileHasLongPath':\n      case 'OldGnuLongPath':\n        this[EX] = this[EX] || Object.create(null)\n        this[EX].path = this[META].replace(/\\0.*/, '')\n        break\n\n      case 'NextFileHasLongLinkpath':\n        this[EX] = this[EX] || Object.create(null)\n        this[EX].linkpath = this[META].replace(/\\0.*/, '')\n        break\n\n      /* istanbul ignore next */\n      default: throw new Error('unknown meta: ' + entry.type)\n    }\n  }\n\n  abort (msg, error) {\n    this[ABORTED] = true\n    this.warn(msg, error)\n    this.emit('abort', error)\n    this.emit('error', error)\n  }\n\n  write (chunk) {\n    if (this[ABORTED])\n      return\n\n    // first write, might be gzipped\n    if (this[UNZIP] === null && chunk) {\n      if (this[BUFFER]) {\n        chunk = Buffer.concat([this[BUFFER], chunk])\n        this[BUFFER] = null\n      }\n      if (chunk.length < gzipHeader.length) {\n        this[BUFFER] = chunk\n        return true\n      }\n      for (let i = 0; this[UNZIP] === null && i < gzipHeader.length; i++) {\n        if (chunk[i] !== gzipHeader[i])\n          this[UNZIP] = false\n      }\n      if (this[UNZIP] === null) {\n        const ended = this[ENDED]\n        this[ENDED] = false\n        this[UNZIP] = new zlib.Unzip()\n        this[UNZIP].on('data', chunk => this[CONSUMECHUNK](chunk))\n        this[UNZIP].on('error', er =>\n          this.abort(er.message, er))\n        this[UNZIP].on('end', _ => {\n          this[ENDED] = true\n          this[CONSUMECHUNK]()\n        })\n        this[WRITING] = true\n        const ret = this[UNZIP][ended ? 'end' : 'write' ](chunk)\n        this[WRITING] = false\n        return ret\n      }\n    }\n\n    this[WRITING] = true\n    if (this[UNZIP])\n      this[UNZIP].write(chunk)\n    else\n      this[CONSUMECHUNK](chunk)\n    this[WRITING] = false\n\n    // return false if there's a queue, or if the current entry isn't flowing\n    const ret =\n      this[QUEUE].length ? false :\n      this[READENTRY] ? this[READENTRY].flowing :\n      true\n\n    // if we have no queue, then that means a clogged READENTRY\n    if (!ret && !this[QUEUE].length)\n      this[READENTRY].once('drain', _ => this.emit('drain'))\n\n    return ret\n  }\n\n  [BUFFERCONCAT] (c) {\n    if (c && !this[ABORTED])\n      this[BUFFER] = this[BUFFER] ? Buffer.concat([this[BUFFER], c]) : c\n  }\n\n  [MAYBEEND] () {\n    if (this[ENDED] &&\n        !this[EMITTEDEND] &&\n        !this[ABORTED] &&\n        !this[CONSUMING]) {\n      this[EMITTEDEND] = true\n      const entry = this[WRITEENTRY]\n      if (entry && entry.blockRemain) {\n        const have = this[BUFFER] ? this[BUFFER].length : 0\n        this.warn('Truncated input (needed ' + entry.blockRemain +\n                  ' more bytes, only ' + have + ' available)', entry)\n        if (this[BUFFER])\n          entry.write(this[BUFFER])\n        entry.end()\n      }\n      this[EMIT](DONE)\n    }\n  }\n\n  [CONSUMECHUNK] (chunk) {\n    if (this[CONSUMING]) {\n      this[BUFFERCONCAT](chunk)\n    } else if (!chunk && !this[BUFFER]) {\n      this[MAYBEEND]()\n    } else {\n      this[CONSUMING] = true\n      if (this[BUFFER]) {\n        this[BUFFERCONCAT](chunk)\n        const c = this[BUFFER]\n        this[BUFFER] = null\n        this[CONSUMECHUNKSUB](c)\n      } else {\n        this[CONSUMECHUNKSUB](chunk)\n      }\n\n      while (this[BUFFER] && this[BUFFER].length >= 512 && !this[ABORTED]) {\n        const c = this[BUFFER]\n        this[BUFFER] = null\n        this[CONSUMECHUNKSUB](c)\n      }\n      this[CONSUMING] = false\n    }\n\n    if (!this[BUFFER] || this[ENDED])\n      this[MAYBEEND]()\n  }\n\n  [CONSUMECHUNKSUB] (chunk) {\n    // we know that we are in CONSUMING mode, so anything written goes into\n    // the buffer.  Advance the position and put any remainder in the buffer.\n    let position = 0\n    let length = chunk.length\n    while (position + 512 <= length && !this[ABORTED]) {\n      switch (this[STATE]) {\n        case 'begin':\n          this[CONSUMEHEADER](chunk, position)\n          position += 512\n          break\n\n        case 'ignore':\n        case 'body':\n          position += this[CONSUMEBODY](chunk, position)\n          break\n\n        case 'meta':\n          position += this[CONSUMEMETA](chunk, position)\n          break\n\n        /* istanbul ignore next */\n        default:\n          throw new Error('invalid state: ' + this[STATE])\n      }\n    }\n\n    if (position < length) {\n      if (this[BUFFER])\n        this[BUFFER] = Buffer.concat([chunk.slice(position), this[BUFFER]])\n      else\n        this[BUFFER] = chunk.slice(position)\n    }\n  }\n\n  end (chunk) {\n    if (!this[ABORTED]) {\n      if (this[UNZIP])\n        this[UNZIP].end(chunk)\n      else {\n        this[ENDED] = true\n        this.write(chunk)\n      }\n    }\n  }\n})\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 135374,
		"size": 4070,
		"blocks": 6,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330716.8398,
		"birthtimeMs": 1551490330716.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.717Z",
		"birthtime": "2019-03-02T01:32:10.717Z",
		"isfile": true
	},
	"filename": "tar/lib/pax.js",
	"content": "'use strict'\nconst Buffer = require('./buffer.js')\nconst Header = require('./header.js')\nconst path = require('path')\n\nclass Pax {\n  constructor (obj, global) {\n    this.atime = obj.atime || null\n    this.charset = obj.charset || null\n    this.comment = obj.comment || null\n    this.ctime = obj.ctime || null\n    this.gid = obj.gid || null\n    this.gname = obj.gname || null\n    this.linkpath = obj.linkpath || null\n    this.mtime = obj.mtime || null\n    this.path = obj.path || null\n    this.size = obj.size || null\n    this.uid = obj.uid || null\n    this.uname = obj.uname || null\n    this.dev = obj.dev || null\n    this.ino = obj.ino || null\n    this.nlink = obj.nlink || null\n    this.global = global || false\n  }\n\n  encode () {\n    const body = this.encodeBody()\n    if (body === '')\n      return null\n\n    const bodyLen = Buffer.byteLength(body)\n    // round up to 512 bytes\n    // add 512 for header\n    const bufLen = 512 * Math.ceil(1 + bodyLen / 512)\n    const buf = Buffer.allocUnsafe(bufLen)\n\n    // 0-fill the header section, it might not hit every field\n    for (let i = 0; i < 512; i++) {\n      buf[i] = 0\n    }\n\n    new Header({\n      // XXX split the path\n      // then the path should be PaxHeader + basename, but less than 99,\n      // prepend with the dirname\n      path: ('PaxHeader/' + path.basename(this.path)).slice(0, 99),\n      mode: this.mode || 0o644,\n      uid: this.uid || null,\n      gid: this.gid || null,\n      size: bodyLen,\n      mtime: this.mtime || null,\n      type: this.global ? 'GlobalExtendedHeader' : 'ExtendedHeader',\n      linkpath: '',\n      uname: this.uname || '',\n      gname: this.gname || '',\n      devmaj: 0,\n      devmin: 0,\n      atime: this.atime || null,\n      ctime: this.ctime || null\n    }).encode(buf)\n\n    buf.write(body, 512, bodyLen, 'utf8')\n\n    // null pad after the body\n    for (let i = bodyLen + 512; i < buf.length; i++) {\n      buf[i] = 0\n    }\n\n    return buf\n  }\n\n  encodeBody () {\n    return (\n      this.encodeField('path') +\n      this.encodeField('ctime') +\n      this.encodeField('atime') +\n      this.encodeField('dev') +\n      this.encodeField('ino') +\n      this.encodeField('nlink') +\n      this.encodeField('charset') +\n      this.encodeField('comment') +\n      this.encodeField('gid') +\n      this.encodeField('gname') +\n      this.encodeField('linkpath') +\n      this.encodeField('mtime') +\n      this.encodeField('size') +\n      this.encodeField('uid') +\n      this.encodeField('uname')\n    )\n  }\n\n  encodeField (field) {\n    if (this[field] === null || this[field] === undefined)\n      return ''\n    const v = this[field] instanceof Date ? this[field].getTime() / 1000\n      : this[field]\n    const s = ' ' +\n      (field === 'dev' || field === 'ino' || field === 'nlink'\n       ? 'SCHILY.' : '') +\n      field + '=' + v + '\\n'\n    const byteLen = Buffer.byteLength(s)\n    // the digits includes the length of the digits in ascii base-10\n    // so if it's 9 characters, then adding 1 for the 9 makes it 10\n    // which makes it 11 chars.\n    let digits = Math.floor(Math.log(byteLen) / Math.log(10)) + 1\n    if (byteLen + digits >= Math.pow(10, digits))\n      digits += 1\n    const len = digits + byteLen\n    return len + s\n  }\n}\n\nPax.parse = (string, ex, g) => new Pax(merge(parseKV(string), ex), g)\n\nconst merge = (a, b) =>\n  b ? Object.keys(a).reduce((s, k) => (s[k] = a[k], s), b) : a\n\nconst parseKV = string =>\n  string\n    .replace(/\\n$/, '')\n    .split('\\n')\n    .reduce(parseKVLine, Object.create(null))\n\nconst parseKVLine = (set, line) => {\n  const n = parseInt(line, 10)\n\n  // XXX Values with \\n in them will fail this.\n  // Refactor to not be a naive line-by-line parse.\n  if (n !== Buffer.byteLength(line) + 1)\n    return set\n\n  line = line.substr((n + ' ').length)\n  const kv = line.split('=')\n  const k = kv.shift().replace(/^SCHILY\\.(dev|ino|nlink)/, '$1')\n  if (!k)\n    return set\n\n  const v = kv.join('=')\n  set[k] = /^([A-Z]+\\.)?([mac]|birth|creation)time$/.test(k)\n    ?  new Date(v * 1000)\n    : /^[0-9]+$/.test(v) ? +v\n    : v\n  return set\n}\n\nmodule.exports = Pax\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2560,
		"ino": 135375,
		"size": 2467,
		"blocks": 4,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330716.8398,
		"birthtimeMs": 1551490330716.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.717Z",
		"birthtime": "2019-03-02T01:32:10.717Z",
		"isfile": true
	},
	"filename": "tar/lib/read-entry.js",
	"content": "'use strict'\nconst types = require('./types.js')\nconst MiniPass = require('minipass')\n\nconst SLURP = Symbol('slurp')\nmodule.exports = class ReadEntry extends MiniPass {\n  constructor (header, ex, gex) {\n    super()\n    this.extended = ex\n    this.globalExtended = gex\n    this.header = header\n    this.startBlockSize = 512 * Math.ceil(header.size / 512)\n    this.blockRemain = this.startBlockSize\n    this.remain = header.size\n    this.type = header.type\n    this.meta = false\n    this.ignore = false\n    switch (this.type) {\n      case 'File':\n      case 'OldFile':\n      case 'Link':\n      case 'SymbolicLink':\n      case 'CharacterDevice':\n      case 'BlockDevice':\n      case 'Directory':\n      case 'FIFO':\n      case 'ContiguousFile':\n      case 'GNUDumpDir':\n        break\n\n      case 'NextFileHasLongLinkpath':\n      case 'NextFileHasLongPath':\n      case 'OldGnuLongPath':\n      case 'GlobalExtendedHeader':\n      case 'ExtendedHeader':\n      case 'OldExtendedHeader':\n        this.meta = true\n        break\n\n      // NOTE: gnutar and bsdtar treat unrecognized types as 'File'\n      // it may be worth doing the same, but with a warning.\n      default:\n        this.ignore = true\n    }\n\n    this.path = header.path\n    this.mode = header.mode\n    if (this.mode)\n      this.mode = this.mode & 0o7777\n    this.uid = header.uid\n    this.gid = header.gid\n    this.uname = header.uname\n    this.gname = header.gname\n    this.size = header.size\n    this.mtime = header.mtime\n    this.atime = header.atime\n    this.ctime = header.ctime\n    this.linkpath = header.linkpath\n    this.uname = header.uname\n    this.gname = header.gname\n\n    if (ex) this[SLURP](ex)\n    if (gex) this[SLURP](gex, true)\n  }\n\n  write (data) {\n    const writeLen = data.length\n    if (writeLen > this.blockRemain)\n      throw new Error('writing more to entry than is appropriate')\n\n    const r = this.remain\n    const br = this.blockRemain\n    this.remain = Math.max(0, r - writeLen)\n    this.blockRemain = Math.max(0, br - writeLen)\n    if (this.ignore)\n      return true\n\n    if (r >= writeLen)\n      return super.write(data)\n\n    // r < writeLen\n    return super.write(data.slice(0, r))\n  }\n\n  [SLURP] (ex, global) {\n    for (let k in ex) {\n      // we slurp in everything except for the path attribute in\n      // a global extended header, because that's weird.\n      if (ex[k] !== null && ex[k] !== undefined &&\n          !(global && k === 'path'))\n        this[k] = ex[k]\n    }\n  }\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 5632,
		"ino": 135376,
		"size": 5492,
		"blocks": 7,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330716.8398,
		"birthtimeMs": 1551490330716.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.717Z",
		"birthtime": "2019-03-02T01:32:10.717Z",
		"isfile": true
	},
	"filename": "tar/lib/replace.js",
	"content": "'use strict'\nconst Buffer = require('./buffer.js')\n\n// tar -r\nconst hlo = require('./high-level-opt.js')\nconst Pack = require('./pack.js')\nconst Parse = require('./parse.js')\nconst fs = require('fs')\nconst fsm = require('fs-minipass')\nconst t = require('./list.js')\nconst path = require('path')\n\n// starting at the head of the file, read a Header\n// If the checksum is invalid, that's our position to start writing\n// If it is, jump forward by the specified size (round up to 512)\n// and try again.\n// Write the new Pack stream starting there.\n\nconst Header = require('./header.js')\n\nconst r = module.exports = (opt_, files, cb) => {\n  const opt = hlo(opt_)\n\n  if (!opt.file)\n    throw new TypeError('file is required')\n\n  if (opt.gzip)\n    throw new TypeError('cannot append to compressed archives')\n\n  if (!files || !Array.isArray(files) || !files.length)\n    throw new TypeError('no files or directories specified')\n\n  files = Array.from(files)\n\n  return opt.sync ? replaceSync(opt, files)\n    : replace(opt, files, cb)\n}\n\nconst replaceSync = (opt, files) => {\n  const p = new Pack.Sync(opt)\n\n  let threw = true\n  let fd\n  let position\n\n  try {\n    try {\n      fd = fs.openSync(opt.file, 'r+')\n    } catch (er) {\n      if (er.code === 'ENOENT')\n        fd = fs.openSync(opt.file, 'w+')\n      else\n        throw er\n    }\n\n    const st = fs.fstatSync(fd)\n    const headBuf = Buffer.alloc(512)\n\n    POSITION: for (position = 0; position < st.size; position += 512) {\n      for (let bufPos = 0, bytes = 0; bufPos < 512; bufPos += bytes) {\n        bytes = fs.readSync(\n          fd, headBuf, bufPos, headBuf.length - bufPos, position + bufPos\n        )\n\n        if (position === 0 && headBuf[0] === 0x1f && headBuf[1] === 0x8b)\n          throw new Error('cannot append to compressed archives')\n\n        if (!bytes)\n          break POSITION\n      }\n\n      let h = new Header(headBuf)\n      if (!h.cksumValid)\n        break\n      let entryBlockSize = 512 * Math.ceil(h.size / 512)\n      if (position + entryBlockSize + 512 > st.size)\n        break\n      // the 512 for the header we just parsed will be added as well\n      // also jump ahead all the blocks for the body\n      position += entryBlockSize\n      if (opt.mtimeCache)\n        opt.mtimeCache.set(h.path, h.mtime)\n    }\n    threw = false\n\n    streamSync(opt, p, position, fd, files)\n  } finally {\n    if (threw)\n      try { fs.closeSync(fd) } catch (er) {}\n  }\n}\n\nconst streamSync = (opt, p, position, fd, files) => {\n  const stream = new fsm.WriteStreamSync(opt.file, {\n    fd: fd,\n    start: position\n  })\n  p.pipe(stream)\n  addFilesSync(p, files)\n}\n\nconst replace = (opt, files, cb) => {\n  files = Array.from(files)\n  const p = new Pack(opt)\n\n  const getPos = (fd, size, cb_) => {\n    const cb = (er, pos) => {\n      if (er)\n        fs.close(fd, _ => cb_(er))\n      else\n        cb_(null, pos)\n    }\n\n    let position = 0\n    if (size === 0)\n      return cb(null, 0)\n\n    let bufPos = 0\n    const headBuf = Buffer.alloc(512)\n    const onread = (er, bytes) => {\n      if (er)\n        return cb(er)\n      bufPos += bytes\n      if (bufPos < 512 && bytes)\n        return fs.read(\n          fd, headBuf, bufPos, headBuf.length - bufPos,\n          position + bufPos, onread\n        )\n\n      if (position === 0 && headBuf[0] === 0x1f && headBuf[1] === 0x8b)\n        return cb(new Error('cannot append to compressed archives'))\n\n      // truncated header\n      if (bufPos < 512)\n        return cb(null, position)\n\n      const h = new Header(headBuf)\n      if (!h.cksumValid)\n        return cb(null, position)\n\n      const entryBlockSize = 512 * Math.ceil(h.size / 512)\n      if (position + entryBlockSize + 512 > size)\n        return cb(null, position)\n\n      position += entryBlockSize + 512\n      if (position >= size)\n        return cb(null, position)\n\n      if (opt.mtimeCache)\n        opt.mtimeCache.set(h.path, h.mtime)\n      bufPos = 0\n      fs.read(fd, headBuf, 0, 512, position, onread)\n    }\n    fs.read(fd, headBuf, 0, 512, position, onread)\n  }\n\n  const promise = new Promise((resolve, reject) => {\n    p.on('error', reject)\n    let flag = 'r+'\n    const onopen = (er, fd) => {\n      if (er && er.code === 'ENOENT' && flag === 'r+') {\n        flag = 'w+'\n        return fs.open(opt.file, flag, onopen)\n      }\n\n      if (er)\n        return reject(er)\n\n      fs.fstat(fd, (er, st) => {\n        if (er)\n          return reject(er)\n        getPos(fd, st.size, (er, position) => {\n          if (er)\n            return reject(er)\n          const stream = new fsm.WriteStream(opt.file, {\n            fd: fd,\n            start: position\n          })\n          p.pipe(stream)\n          stream.on('error', reject)\n          stream.on('close', resolve)\n          addFilesAsync(p, files)\n        })\n      })\n    }\n    fs.open(opt.file, flag, onopen)\n  })\n\n  return cb ? promise.then(cb, cb) : promise\n}\n\nconst addFilesSync = (p, files) => {\n  files.forEach(file => {\n    if (file.charAt(0) === '@')\n      t({\n        file: path.resolve(p.cwd, file.substr(1)),\n        sync: true,\n        noResume: true,\n        onentry: entry => p.add(entry)\n      })\n    else\n      p.add(file)\n  })\n  p.end()\n}\n\nconst addFilesAsync = (p, files) => {\n  while (files.length) {\n    const file = files.shift()\n    if (file.charAt(0) === '@')\n      return t({\n        file: path.resolve(p.cwd, file.substr(1)),\n        noResume: true,\n        onentry: entry => p.add(entry)\n      }).then(_ => addFilesAsync(p, files))\n    else\n      p.add(file)\n  }\n  p.end()\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1536,
		"ino": 135292,
		"size": 1095,
		"blocks": 3,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330716.8398,
		"birthtimeMs": 1551490330716.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.717Z",
		"birthtime": "2019-03-02T01:32:10.717Z",
		"isfile": true
	},
	"filename": "tar/lib/types.js",
	"content": "'use strict'\n// map types from key to human-friendly name\nexports.name = new Map([\n  ['0', 'File'],\n  // same as File\n  ['', 'OldFile'],\n  ['1', 'Link'],\n  ['2', 'SymbolicLink'],\n  // Devices and FIFOs aren't fully supported\n  // they are parsed, but skipped when unpacking\n  ['3', 'CharacterDevice'],\n  ['4', 'BlockDevice'],\n  ['5', 'Directory'],\n  ['6', 'FIFO'],\n  // same as File\n  ['7', 'ContiguousFile'],\n  // pax headers\n  ['g', 'GlobalExtendedHeader'],\n  ['x', 'ExtendedHeader'],\n  // vendor-specific stuff\n  // skip\n  ['A', 'SolarisACL'],\n  // like 5, but with data, which should be skipped\n  ['D', 'GNUDumpDir'],\n  // metadata only, skip\n  ['I', 'Inode'],\n  // data = link path of next file\n  ['K', 'NextFileHasLongLinkpath'],\n  // data = path of next file\n  ['L', 'NextFileHasLongPath'],\n  // skip\n  ['M', 'ContinuationFile'],\n  // like L\n  ['N', 'OldGnuLongPath'],\n  // skip\n  ['S', 'SparseFile'],\n  // skip\n  ['V', 'TapeVolumeHeader'],\n  // like x\n  ['X', 'OldExtendedHeader']\n])\n\n// map the other direction\nexports.code = new Map(Array.from(exports.name).map(kv => [kv[1], kv[0]]))\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 16896,
		"ino": 135378,
		"size": 16856,
		"blocks": 17,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330716.8398,
		"birthtimeMs": 1551490330716.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.717Z",
		"birthtime": "2019-03-02T01:32:10.717Z",
		"isfile": true
	},
	"filename": "tar/lib/unpack.js",
	"content": "'use strict'\n\nconst assert = require('assert')\nconst EE = require('events').EventEmitter\nconst Parser = require('./parse.js')\nconst fs = require('fs')\nconst fsm = require('fs-minipass')\nconst path = require('path')\nconst mkdir = require('./mkdir.js')\nconst mkdirSync = mkdir.sync\nconst wc = require('./winchars.js')\n\nconst ONENTRY = Symbol('onEntry')\nconst CHECKFS = Symbol('checkFs')\nconst ISREUSABLE = Symbol('isReusable')\nconst MAKEFS = Symbol('makeFs')\nconst FILE = Symbol('file')\nconst DIRECTORY = Symbol('directory')\nconst LINK = Symbol('link')\nconst SYMLINK = Symbol('symlink')\nconst HARDLINK = Symbol('hardlink')\nconst UNSUPPORTED = Symbol('unsupported')\nconst UNKNOWN = Symbol('unknown')\nconst CHECKPATH = Symbol('checkPath')\nconst MKDIR = Symbol('mkdir')\nconst ONERROR = Symbol('onError')\nconst PENDING = Symbol('pending')\nconst PEND = Symbol('pend')\nconst UNPEND = Symbol('unpend')\nconst ENDED = Symbol('ended')\nconst MAYBECLOSE = Symbol('maybeClose')\nconst SKIP = Symbol('skip')\nconst DOCHOWN = Symbol('doChown')\nconst UID = Symbol('uid')\nconst GID = Symbol('gid')\nconst crypto = require('crypto')\n\n// Unlinks on Windows are not atomic.\n//\n// This means that if you have a file entry, followed by another\n// file entry with an identical name, and you cannot re-use the file\n// (because it's a hardlink, or because unlink:true is set, or it's\n// Windows, which does not have useful nlink values), then the unlink\n// will be committed to the disk AFTER the new file has been written\n// over the old one, deleting the new file.\n//\n// To work around this, on Windows systems, we rename the file and then\n// delete the renamed file.  It's a sloppy kludge, but frankly, I do not\n// know of a better way to do this, given windows' non-atomic unlink\n// semantics.\n//\n// See: https://github.com/npm/node-tar/issues/183\n/* istanbul ignore next */\nconst unlinkFile = (path, cb) => {\n  if (process.platform !== 'win32')\n    return fs.unlink(path, cb)\n\n  const name = path + '.DELETE.' + crypto.randomBytes(16).toString('hex')\n  fs.rename(path, name, er => {\n    if (er)\n      return cb(er)\n    fs.unlink(name, cb)\n  })\n}\n\n/* istanbul ignore next */\nconst unlinkFileSync = path => {\n  if (process.platform !== 'win32')\n    return fs.unlinkSync(path)\n\n  const name = path + '.DELETE.' + crypto.randomBytes(16).toString('hex')\n  fs.renameSync(path, name)\n  fs.unlinkSync(name)\n}\n\n// this.gid, entry.gid, this.processUid\nconst uint32 = (a, b, c) =>\n  a === a >>> 0 ? a\n  : b === b >>> 0 ? b\n  : c\n\nclass Unpack extends Parser {\n  constructor (opt) {\n    if (!opt)\n      opt = {}\n\n    opt.ondone = _ => {\n      this[ENDED] = true\n      this[MAYBECLOSE]()\n    }\n\n    super(opt)\n\n    this.transform = typeof opt.transform === 'function' ? opt.transform : null\n\n    this.writable = true\n    this.readable = false\n\n    this[PENDING] = 0\n    this[ENDED] = false\n\n    this.dirCache = opt.dirCache || new Map()\n\n    if (typeof opt.uid === 'number' || typeof opt.gid === 'number') {\n      // need both or neither\n      if (typeof opt.uid !== 'number' || typeof opt.gid !== 'number')\n        throw new TypeError('cannot set owner without number uid and gid')\n      if (opt.preserveOwner)\n        throw new TypeError(\n          'cannot preserve owner in archive and also set owner explicitly')\n      this.uid = opt.uid\n      this.gid = opt.gid\n      this.setOwner = true\n    } else {\n      this.uid = null\n      this.gid = null\n      this.setOwner = false\n    }\n\n    // default true for root\n    if (opt.preserveOwner === undefined && typeof opt.uid !== 'number')\n      this.preserveOwner = process.getuid && process.getuid() === 0\n    else\n      this.preserveOwner = !!opt.preserveOwner\n\n    this.processUid = (this.preserveOwner || this.setOwner) && process.getuid ?\n      process.getuid() : null\n    this.processGid = (this.preserveOwner || this.setOwner) && process.getgid ?\n      process.getgid() : null\n\n    // mostly just for testing, but useful in some cases.\n    // Forcibly trigger a chown on every entry, no matter what\n    this.forceChown = opt.forceChown === true\n\n    // turn ><?| in filenames into 0xf000-higher encoded forms\n    this.win32 = !!opt.win32 || process.platform === 'win32'\n\n    // do not unpack over files that are newer than what's in the archive\n    this.newer = !!opt.newer\n\n    // do not unpack over ANY files\n    this.keep = !!opt.keep\n\n    // do not set mtime/atime of extracted entries\n    this.noMtime = !!opt.noMtime\n\n    // allow .., absolute path entries, and unpacking through symlinks\n    // without this, warn and skip .., relativize absolutes, and error\n    // on symlinks in extraction path\n    this.preservePaths = !!opt.preservePaths\n\n    // unlink files and links before writing. This breaks existing hard\n    // links, and removes symlink directories rather than erroring\n    this.unlink = !!opt.unlink\n\n    this.cwd = path.resolve(opt.cwd || process.cwd())\n    this.strip = +opt.strip || 0\n    this.processUmask = process.umask()\n    this.umask = typeof opt.umask === 'number' ? opt.umask : this.processUmask\n    // default mode for dirs created as parents\n    this.dmode = opt.dmode || (0o0777 & (~this.umask))\n    this.fmode = opt.fmode || (0o0666 & (~this.umask))\n    this.on('entry', entry => this[ONENTRY](entry))\n  }\n\n  [MAYBECLOSE] () {\n    if (this[ENDED] && this[PENDING] === 0) {\n      this.emit('prefinish')\n      this.emit('finish')\n      this.emit('end')\n      this.emit('close')\n    }\n  }\n\n  [CHECKPATH] (entry) {\n    if (this.strip) {\n      const parts = entry.path.split(/\\/|\\\\/)\n      if (parts.length < this.strip)\n        return false\n      entry.path = parts.slice(this.strip).join('/')\n\n      if (entry.type === 'Link') {\n        const linkparts = entry.linkpath.split(/\\/|\\\\/)\n        if (linkparts.length >= this.strip)\n          entry.linkpath = linkparts.slice(this.strip).join('/')\n      }\n    }\n\n    if (!this.preservePaths) {\n      const p = entry.path\n      if (p.match(/(^|\\/|\\\\)\\.\\.(\\\\|\\/|$)/)) {\n        this.warn('path contains \\'..\\'', p)\n        return false\n      }\n\n      // absolutes on posix are also absolutes on win32\n      // so we only need to test this one to get both\n      if (path.win32.isAbsolute(p)) {\n        const parsed = path.win32.parse(p)\n        this.warn('stripping ' + parsed.root + ' from absolute path', p)\n        entry.path = p.substr(parsed.root.length)\n      }\n    }\n\n    // only encode : chars that aren't drive letter indicators\n    if (this.win32) {\n      const parsed = path.win32.parse(entry.path)\n      entry.path = parsed.root === '' ? wc.encode(entry.path)\n        : parsed.root + wc.encode(entry.path.substr(parsed.root.length))\n    }\n\n    if (path.isAbsolute(entry.path))\n      entry.absolute = entry.path\n    else\n      entry.absolute = path.resolve(this.cwd, entry.path)\n\n    return true\n  }\n\n  [ONENTRY] (entry) {\n    if (!this[CHECKPATH](entry))\n      return entry.resume()\n\n    assert.equal(typeof entry.absolute, 'string')\n\n    switch (entry.type) {\n      case 'Directory':\n      case 'GNUDumpDir':\n        if (entry.mode)\n          entry.mode = entry.mode | 0o700\n\n      case 'File':\n      case 'OldFile':\n      case 'ContiguousFile':\n      case 'Link':\n      case 'SymbolicLink':\n        return this[CHECKFS](entry)\n\n      case 'CharacterDevice':\n      case 'BlockDevice':\n      case 'FIFO':\n        return this[UNSUPPORTED](entry)\n    }\n  }\n\n  [ONERROR] (er, entry) {\n    // Cwd has to exist, or else nothing works. That's serious.\n    // Other errors are warnings, which raise the error in strict\n    // mode, but otherwise continue on.\n    if (er.name === 'CwdError')\n      this.emit('error', er)\n    else {\n      this.warn(er.message, er)\n      this[UNPEND]()\n      entry.resume()\n    }\n  }\n\n  [MKDIR] (dir, mode, cb) {\n    mkdir(dir, {\n      uid: this.uid,\n      gid: this.gid,\n      processUid: this.processUid,\n      processGid: this.processGid,\n      umask: this.processUmask,\n      preserve: this.preservePaths,\n      unlink: this.unlink,\n      cache: this.dirCache,\n      cwd: this.cwd,\n      mode: mode\n    }, cb)\n  }\n\n  [DOCHOWN] (entry) {\n    // in preserve owner mode, chown if the entry doesn't match process\n    // in set owner mode, chown if setting doesn't match process\n    return this.forceChown ||\n      this.preserveOwner &&\n      ( typeof entry.uid === 'number' && entry.uid !== this.processUid ||\n        typeof entry.gid === 'number' && entry.gid !== this.processGid )\n      ||\n      ( typeof this.uid === 'number' && this.uid !== this.processUid ||\n        typeof this.gid === 'number' && this.gid !== this.processGid )\n  }\n\n  [UID] (entry) {\n    return uint32(this.uid, entry.uid, this.processUid)\n  }\n\n  [GID] (entry) {\n    return uint32(this.gid, entry.gid, this.processGid)\n  }\n\n  [FILE] (entry) {\n    const mode = entry.mode & 0o7777 || this.fmode\n    const stream = new fsm.WriteStream(entry.absolute, {\n      mode: mode,\n      autoClose: false\n    })\n    stream.on('error', er => this[ONERROR](er, entry))\n\n    let actions = 1\n    const done = er => {\n      if (er)\n        return this[ONERROR](er, entry)\n\n      if (--actions === 0)\n        fs.close(stream.fd, _ => this[UNPEND]())\n    }\n\n    stream.on('finish', _ => {\n      // if futimes fails, try utimes\n      // if utimes fails, fail with the original error\n      // same for fchown/chown\n      const abs = entry.absolute\n      const fd = stream.fd\n\n      if (entry.mtime && !this.noMtime) {\n        actions++\n        const atime = entry.atime || new Date()\n        const mtime = entry.mtime\n        fs.futimes(fd, atime, mtime, er =>\n          er ? fs.utimes(abs, atime, mtime, er2 => done(er2 && er))\n          : done())\n      }\n\n      if (this[DOCHOWN](entry)) {\n        actions++\n        const uid = this[UID](entry)\n        const gid = this[GID](entry)\n        fs.fchown(fd, uid, gid, er =>\n          er ? fs.chown(abs, uid, gid, er2 => done(er2 && er))\n          : done())\n      }\n\n      done()\n    })\n\n    const tx = this.transform ? this.transform(entry) || entry : entry\n    if (tx !== entry) {\n      tx.on('error', er => this[ONERROR](er, entry))\n      entry.pipe(tx)\n    }\n    tx.pipe(stream)\n  }\n\n  [DIRECTORY] (entry) {\n    const mode = entry.mode & 0o7777 || this.dmode\n    this[MKDIR](entry.absolute, mode, er => {\n      if (er)\n        return this[ONERROR](er, entry)\n\n      let actions = 1\n      const done = _ => {\n        if (--actions === 0) {\n          this[UNPEND]()\n          entry.resume()\n        }\n      }\n\n      if (entry.mtime && !this.noMtime) {\n        actions++\n        fs.utimes(entry.absolute, entry.atime || new Date(), entry.mtime, done)\n      }\n\n      if (this[DOCHOWN](entry)) {\n        actions++\n        fs.chown(entry.absolute, this[UID](entry), this[GID](entry), done)\n      }\n\n      done()\n    })\n  }\n\n  [UNSUPPORTED] (entry) {\n    this.warn('unsupported entry type: ' + entry.type, entry)\n    entry.resume()\n  }\n\n  [SYMLINK] (entry) {\n    this[LINK](entry, entry.linkpath, 'symlink')\n  }\n\n  [HARDLINK] (entry) {\n    this[LINK](entry, path.resolve(this.cwd, entry.linkpath), 'link')\n  }\n\n  [PEND] () {\n    this[PENDING]++\n  }\n\n  [UNPEND] () {\n    this[PENDING]--\n    this[MAYBECLOSE]()\n  }\n\n  [SKIP] (entry) {\n    this[UNPEND]()\n    entry.resume()\n  }\n\n  // Check if we can reuse an existing filesystem entry safely and\n  // overwrite it, rather than unlinking and recreating\n  // Windows doesn't report a useful nlink, so we just never reuse entries\n  [ISREUSABLE] (entry, st) {\n    return entry.type === 'File' &&\n      !this.unlink &&\n      st.isFile() &&\n      st.nlink <= 1 &&\n      process.platform !== 'win32'\n  }\n\n  // check if a thing is there, and if so, try to clobber it\n  [CHECKFS] (entry) {\n    this[PEND]()\n    this[MKDIR](path.dirname(entry.absolute), this.dmode, er => {\n      if (er)\n        return this[ONERROR](er, entry)\n      fs.lstat(entry.absolute, (er, st) => {\n        if (st && (this.keep || this.newer && st.mtime > entry.mtime))\n          this[SKIP](entry)\n        else if (er || this[ISREUSABLE](entry, st))\n          this[MAKEFS](null, entry)\n        else if (st.isDirectory()) {\n          if (entry.type === 'Directory') {\n            if (!entry.mode || (st.mode & 0o7777) === entry.mode)\n              this[MAKEFS](null, entry)\n            else\n              fs.chmod(entry.absolute, entry.mode, er => this[MAKEFS](er, entry))\n          } else\n            fs.rmdir(entry.absolute, er => this[MAKEFS](er, entry))\n        } else\n          unlinkFile(entry.absolute, er => this[MAKEFS](er, entry))\n      })\n    })\n  }\n\n  [MAKEFS] (er, entry) {\n    if (er)\n      return this[ONERROR](er, entry)\n\n    switch (entry.type) {\n      case 'File':\n      case 'OldFile':\n      case 'ContiguousFile':\n        return this[FILE](entry)\n\n      case 'Link':\n        return this[HARDLINK](entry)\n\n      case 'SymbolicLink':\n        return this[SYMLINK](entry)\n\n      case 'Directory':\n      case 'GNUDumpDir':\n        return this[DIRECTORY](entry)\n    }\n  }\n\n  [LINK] (entry, linkpath, link) {\n    // XXX: get the type ('file' or 'dir') for windows\n    fs[link](linkpath, entry.absolute, er => {\n      if (er)\n        return this[ONERROR](er, entry)\n      this[UNPEND]()\n      entry.resume()\n    })\n  }\n}\n\nclass UnpackSync extends Unpack {\n  constructor (opt) {\n    super(opt)\n  }\n\n  [CHECKFS] (entry) {\n    const er = this[MKDIR](path.dirname(entry.absolute), this.dmode)\n    if (er)\n      return this[ONERROR](er, entry)\n    try {\n      const st = fs.lstatSync(entry.absolute)\n      if (this.keep || this.newer && st.mtime > entry.mtime)\n        return this[SKIP](entry)\n      else if (this[ISREUSABLE](entry, st))\n        return this[MAKEFS](null, entry)\n      else {\n        try {\n          if (st.isDirectory()) {\n            if (entry.type === 'Directory') {\n              if (entry.mode && (st.mode & 0o7777) !== entry.mode)\n                fs.chmodSync(entry.absolute, entry.mode)\n            } else\n              fs.rmdirSync(entry.absolute)\n          } else\n            unlinkFileSync(entry.absolute)\n          return this[MAKEFS](null, entry)\n        } catch (er) {\n          return this[ONERROR](er, entry)\n        }\n      }\n    } catch (er) {\n      return this[MAKEFS](null, entry)\n    }\n  }\n\n  [FILE] (entry) {\n    const mode = entry.mode & 0o7777 || this.fmode\n\n    const oner = er => {\n      try { fs.closeSync(fd) } catch (_) {}\n      if (er)\n        this[ONERROR](er, entry)\n    }\n\n    let stream\n    let fd\n    try {\n      fd = fs.openSync(entry.absolute, 'w', mode)\n    } catch (er) {\n      return oner(er)\n    }\n    const tx = this.transform ? this.transform(entry) || entry : entry\n    if (tx !== entry) {\n      tx.on('error', er => this[ONERROR](er, entry))\n      entry.pipe(tx)\n    }\n\n    tx.on('data', chunk => {\n      try {\n        fs.writeSync(fd, chunk, 0, chunk.length)\n      } catch (er) {\n        oner(er)\n      }\n    })\n\n    tx.on('end', _ => {\n      let er = null\n      // try both, falling futimes back to utimes\n      // if either fails, handle the first error\n      if (entry.mtime && !this.noMtime) {\n        const atime = entry.atime || new Date()\n        const mtime = entry.mtime\n        try {\n          fs.futimesSync(fd, atime, mtime)\n        } catch (futimeser) {\n          try {\n            fs.utimesSync(entry.absolute, atime, mtime)\n          } catch (utimeser) {\n            er = futimeser\n          }\n        }\n      }\n\n      if (this[DOCHOWN](entry)) {\n        const uid = this[UID](entry)\n        const gid = this[GID](entry)\n\n        try {\n          fs.fchownSync(fd, uid, gid)\n        } catch (fchowner) {\n          try {\n            fs.chownSync(entry.absolute, uid, gid)\n          } catch (chowner) {\n            er = er || fchowner\n          }\n        }\n      }\n\n      oner(er)\n    })\n  }\n\n  [DIRECTORY] (entry) {\n    const mode = entry.mode & 0o7777 || this.dmode\n    const er = this[MKDIR](entry.absolute, mode)\n    if (er)\n      return this[ONERROR](er, entry)\n    if (entry.mtime && !this.noMtime) {\n      try {\n        fs.utimesSync(entry.absolute, entry.atime || new Date(), entry.mtime)\n      } catch (er) {}\n    }\n    if (this[DOCHOWN](entry)) {\n      try {\n        fs.chownSync(entry.absolute, this[UID](entry), this[GID](entry))\n      } catch (er) {}\n    }\n    entry.resume()\n  }\n\n  [MKDIR] (dir, mode) {\n    try {\n      return mkdir.sync(dir, {\n        uid: this.uid,\n        gid: this.gid,\n        processUid: this.processUid,\n        processGid: this.processGid,\n        umask: this.processUmask,\n        preserve: this.preservePaths,\n        unlink: this.unlink,\n        cache: this.dirCache,\n        cwd: this.cwd,\n        mode: mode\n      })\n    } catch (er) {\n      return er\n    }\n  }\n\n  [LINK] (entry, linkpath, link) {\n    try {\n      fs[link + 'Sync'](linkpath, entry.absolute)\n      entry.resume()\n    } catch (er) {\n      return this[ONERROR](er, entry)\n    }\n  }\n}\n\nUnpack.Sync = UnpackSync\nmodule.exports = Unpack\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1024,
		"ino": 135294,
		"size": 852,
		"blocks": 3,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330720.8398,
		"birthtimeMs": 1551490330720.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.721Z",
		"birthtime": "2019-03-02T01:32:10.721Z",
		"isfile": true
	},
	"filename": "tar/lib/update.js",
	"content": "'use strict'\n\n// tar -u\n\nconst hlo = require('./high-level-opt.js')\nconst r = require('./replace.js')\n// just call tar.r with the filter and mtimeCache\n\nconst u = module.exports = (opt_, files, cb) => {\n  const opt = hlo(opt_)\n\n  if (!opt.file)\n    throw new TypeError('file is required')\n\n  if (opt.gzip)\n    throw new TypeError('cannot append to compressed archives')\n\n  if (!files || !Array.isArray(files) || !files.length)\n    throw new TypeError('no files or directories specified')\n\n  files = Array.from(files)\n\n  mtimeFilter(opt)\n  return r(opt, files, cb)\n}\n\nconst mtimeFilter = opt => {\n  const filter = opt.filter\n\n  if (!opt.mtimeCache)\n    opt.mtimeCache = new Map()\n\n  opt.filter = filter ? (path, stat) =>\n    filter(path, stat) && !(opt.mtimeCache.get(path) > stat.mtime)\n    : (path, stat) => !(opt.mtimeCache.get(path) > stat.mtime)\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 512,
		"ino": 135379,
		"size": 309,
		"blocks": 2,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330720.8398,
		"birthtimeMs": 1551490330720.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.721Z",
		"birthtime": "2019-03-02T01:32:10.721Z",
		"isfile": true
	},
	"filename": "tar/lib/warn-mixin.js",
	"content": "'use strict'\nmodule.exports = Base => class extends Base {\n  warn (msg, data) {\n    if (!this.strict)\n      this.emit('warn', msg, data)\n    else if (data instanceof Error)\n      this.emit('error', data)\n    else {\n      const er = new Error(msg)\n      er.data = data\n      this.emit('error', er)\n    }\n  }\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 1024,
		"ino": 135380,
		"size": 533,
		"blocks": 2,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330720.8398,
		"birthtimeMs": 1551490330720.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.721Z",
		"birthtime": "2019-03-02T01:32:10.721Z",
		"isfile": true
	},
	"filename": "tar/lib/winchars.js",
	"content": "'use strict'\n\n// When writing files on Windows, translate the characters to their\n// 0xf000 higher-encoded versions.\n\nconst raw = [\n  '|',\n  '<',\n  '>',\n  '?',\n  ':'\n]\n\nconst win = raw.map(char =>\n  String.fromCharCode(0xf000 + char.charCodeAt(0)))\n\nconst toWin = new Map(raw.map((char, i) => [char, win[i]]))\nconst toRaw = new Map(win.map((char, i) => [char, raw[i]]))\n\nmodule.exports = {\n  encode: s => raw.reduce((s, c) => s.split(c).join(toWin.get(c)), s),\n  decode: s => win.reduce((s, c) => s.split(c).join(toRaw.get(c)), s)\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 12288,
		"ino": 135295,
		"size": 12037,
		"blocks": 11,
		"atimeMs": 1551500530970.4263,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330720.8398,
		"birthtimeMs": 1551490330720.8398,
		"atime": "2019-03-02T04:22:10.970Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.721Z",
		"birthtime": "2019-03-02T01:32:10.721Z",
		"isfile": true
	},
	"filename": "tar/lib/write-entry.js",
	"content": "'use strict'\nconst Buffer = require('./buffer.js')\nconst MiniPass = require('minipass')\nconst Pax = require('./pax.js')\nconst Header = require('./header.js')\nconst ReadEntry = require('./read-entry.js')\nconst fs = require('fs')\nconst path = require('path')\n\nconst types = require('./types.js')\nconst maxReadSize = 16 * 1024 * 1024\nconst PROCESS = Symbol('process')\nconst FILE = Symbol('file')\nconst DIRECTORY = Symbol('directory')\nconst SYMLINK = Symbol('symlink')\nconst HARDLINK = Symbol('hardlink')\nconst HEADER = Symbol('header')\nconst READ = Symbol('read')\nconst LSTAT = Symbol('lstat')\nconst ONLSTAT = Symbol('onlstat')\nconst ONREAD = Symbol('onread')\nconst ONREADLINK = Symbol('onreadlink')\nconst OPENFILE = Symbol('openfile')\nconst ONOPENFILE = Symbol('onopenfile')\nconst CLOSE = Symbol('close')\nconst MODE = Symbol('mode')\nconst warner = require('./warn-mixin.js')\nconst winchars = require('./winchars.js')\n\nconst modeFix = require('./mode-fix.js')\n\nconst WriteEntry = warner(class WriteEntry extends MiniPass {\n  constructor (p, opt) {\n    opt = opt || {}\n    super(opt)\n    if (typeof p !== 'string')\n      throw new TypeError('path is required')\n    this.path = p\n    // suppress atime, ctime, uid, gid, uname, gname\n    this.portable = !!opt.portable\n    // until node has builtin pwnam functions, this'll have to do\n    this.myuid = process.getuid && process.getuid()\n    this.myuser = process.env.USER || ''\n    this.maxReadSize = opt.maxReadSize || maxReadSize\n    this.linkCache = opt.linkCache || new Map()\n    this.statCache = opt.statCache || new Map()\n    this.preservePaths = !!opt.preservePaths\n    this.cwd = opt.cwd || process.cwd()\n    this.strict = !!opt.strict\n    this.noPax = !!opt.noPax\n    this.noMtime = !!opt.noMtime\n    this.mtime = opt.mtime || null\n\n    if (typeof opt.onwarn === 'function')\n      this.on('warn', opt.onwarn)\n\n    if (!this.preservePaths && path.win32.isAbsolute(p)) {\n      // absolutes on posix are also absolutes on win32\n      // so we only need to test this one to get both\n      const parsed = path.win32.parse(p)\n      this.warn('stripping ' + parsed.root + ' from absolute path', p)\n      this.path = p.substr(parsed.root.length)\n    }\n\n    this.win32 = !!opt.win32 || process.platform === 'win32'\n    if (this.win32) {\n      this.path = winchars.decode(this.path.replace(/\\\\/g, '/'))\n      p = p.replace(/\\\\/g, '/')\n    }\n\n    this.absolute = opt.absolute || path.resolve(this.cwd, p)\n\n    if (this.path === '')\n      this.path = './'\n\n    if (this.statCache.has(this.absolute))\n      this[ONLSTAT](this.statCache.get(this.absolute))\n    else\n      this[LSTAT]()\n  }\n\n  [LSTAT] () {\n    fs.lstat(this.absolute, (er, stat) => {\n      if (er)\n        return this.emit('error', er)\n      this[ONLSTAT](stat)\n    })\n  }\n\n  [ONLSTAT] (stat) {\n    this.statCache.set(this.absolute, stat)\n    this.stat = stat\n    if (!stat.isFile())\n      stat.size = 0\n    this.type = getType(stat)\n    this.emit('stat', stat)\n    this[PROCESS]()\n  }\n\n  [PROCESS] () {\n    switch (this.type) {\n      case 'File': return this[FILE]()\n      case 'Directory': return this[DIRECTORY]()\n      case 'SymbolicLink': return this[SYMLINK]()\n      // unsupported types are ignored.\n      default: return this.end()\n    }\n  }\n\n  [MODE] (mode) {\n    return modeFix(mode, this.type === 'Directory')\n  }\n\n  [HEADER] () {\n    if (this.type === 'Directory' && this.portable)\n      this.noMtime = true\n\n    this.header = new Header({\n      path: this.path,\n      linkpath: this.linkpath,\n      // only the permissions and setuid/setgid/sticky bitflags\n      // not the higher-order bits that specify file type\n      mode: this[MODE](this.stat.mode),\n      uid: this.portable ? null : this.stat.uid,\n      gid: this.portable ? null : this.stat.gid,\n      size: this.stat.size,\n      mtime: this.noMtime ? null : this.mtime || this.stat.mtime,\n      type: this.type,\n      uname: this.portable ? null :\n        this.stat.uid === this.myuid ? this.myuser : '',\n      atime: this.portable ? null : this.stat.atime,\n      ctime: this.portable ? null : this.stat.ctime\n    })\n\n    if (this.header.encode() && !this.noPax)\n      this.write(new Pax({\n        atime: this.portable ? null : this.header.atime,\n        ctime: this.portable ? null : this.header.ctime,\n        gid: this.portable ? null : this.header.gid,\n        mtime: this.noMtime ? null : this.mtime || this.header.mtime,\n        path: this.path,\n        linkpath: this.linkpath,\n        size: this.header.size,\n        uid: this.portable ? null : this.header.uid,\n        uname: this.portable ? null : this.header.uname,\n        dev: this.portable ? null : this.stat.dev,\n        ino: this.portable ? null : this.stat.ino,\n        nlink: this.portable ? null : this.stat.nlink\n      }).encode())\n    this.write(this.header.block)\n  }\n\n  [DIRECTORY] () {\n    if (this.path.substr(-1) !== '/')\n      this.path += '/'\n    this.stat.size = 0\n    this[HEADER]()\n    this.end()\n  }\n\n  [SYMLINK] () {\n    fs.readlink(this.absolute, (er, linkpath) => {\n      if (er)\n        return this.emit('error', er)\n      this[ONREADLINK](linkpath)\n    })\n  }\n\n  [ONREADLINK] (linkpath) {\n    this.linkpath = linkpath\n    this[HEADER]()\n    this.end()\n  }\n\n  [HARDLINK] (linkpath) {\n    this.type = 'Link'\n    this.linkpath = path.relative(this.cwd, linkpath)\n    this.stat.size = 0\n    this[HEADER]()\n    this.end()\n  }\n\n  [FILE] () {\n    if (this.stat.nlink > 1) {\n      const linkKey = this.stat.dev + ':' + this.stat.ino\n      if (this.linkCache.has(linkKey)) {\n        const linkpath = this.linkCache.get(linkKey)\n        if (linkpath.indexOf(this.cwd) === 0)\n          return this[HARDLINK](linkpath)\n      }\n      this.linkCache.set(linkKey, this.absolute)\n    }\n\n    this[HEADER]()\n    if (this.stat.size === 0)\n      return this.end()\n\n    this[OPENFILE]()\n  }\n\n  [OPENFILE] () {\n    fs.open(this.absolute, 'r', (er, fd) => {\n      if (er)\n        return this.emit('error', er)\n      this[ONOPENFILE](fd)\n    })\n  }\n\n  [ONOPENFILE] (fd) {\n    const blockLen = 512 * Math.ceil(this.stat.size / 512)\n    const bufLen = Math.min(blockLen, this.maxReadSize)\n    const buf = Buffer.allocUnsafe(bufLen)\n    this[READ](fd, buf, 0, buf.length, 0, this.stat.size, blockLen)\n  }\n\n  [READ] (fd, buf, offset, length, pos, remain, blockRemain) {\n    fs.read(fd, buf, offset, length, pos, (er, bytesRead) => {\n      if (er)\n        return this[CLOSE](fd, _ => this.emit('error', er))\n      this[ONREAD](fd, buf, offset, length, pos, remain, blockRemain, bytesRead)\n    })\n  }\n\n  [CLOSE] (fd, cb) {\n    fs.close(fd, cb)\n  }\n\n  [ONREAD] (fd, buf, offset, length, pos, remain, blockRemain, bytesRead) {\n    if (bytesRead <= 0 && remain > 0) {\n      const er = new Error('encountered unexpected EOF')\n      er.path = this.absolute\n      er.syscall = 'read'\n      er.code = 'EOF'\n      this[CLOSE](fd)\n      return this.emit('error', er)\n    }\n\n    if (bytesRead > remain) {\n      const er = new Error('did not encounter expected EOF')\n      er.path = this.absolute\n      er.syscall = 'read'\n      er.code = 'EOF'\n      this[CLOSE](fd)\n      return this.emit('error', er)\n    }\n\n    // null out the rest of the buffer, if we could fit the block padding\n    if (bytesRead === remain) {\n      for (let i = bytesRead; i < length && bytesRead < blockRemain; i++) {\n        buf[i + offset] = 0\n        bytesRead ++\n        remain ++\n      }\n    }\n\n    const writeBuf = offset === 0 && bytesRead === buf.length ?\n      buf : buf.slice(offset, offset + bytesRead)\n    remain -= bytesRead\n    blockRemain -= bytesRead\n    pos += bytesRead\n    offset += bytesRead\n\n    this.write(writeBuf)\n\n    if (!remain) {\n      if (blockRemain)\n        this.write(Buffer.alloc(blockRemain))\n      this.end()\n      this[CLOSE](fd, _ => _)\n      return\n    }\n\n    if (offset >= length) {\n      buf = Buffer.allocUnsafe(length)\n      offset = 0\n    }\n    length = buf.length - offset\n    this[READ](fd, buf, offset, length, pos, remain, blockRemain)\n  }\n})\n\nclass WriteEntrySync extends WriteEntry {\n  constructor (path, opt) {\n    super(path, opt)\n  }\n\n  [LSTAT] () {\n    this[ONLSTAT](fs.lstatSync(this.absolute))\n  }\n\n  [SYMLINK] () {\n    this[ONREADLINK](fs.readlinkSync(this.absolute))\n  }\n\n  [OPENFILE] () {\n    this[ONOPENFILE](fs.openSync(this.absolute, 'r'))\n  }\n\n  [READ] (fd, buf, offset, length, pos, remain, blockRemain) {\n    let threw = true\n    try {\n      const bytesRead = fs.readSync(fd, buf, offset, length, pos)\n      this[ONREAD](fd, buf, offset, length, pos, remain, blockRemain, bytesRead)\n      threw = false\n    } finally {\n      if (threw)\n        try { this[CLOSE](fd) } catch (er) {}\n    }\n  }\n\n  [CLOSE] (fd) {\n    fs.closeSync(fd)\n  }\n}\n\nconst WriteEntryTar = warner(class WriteEntryTar extends MiniPass {\n  constructor (readEntry, opt) {\n    opt = opt || {}\n    super(opt)\n    this.preservePaths = !!opt.preservePaths\n    this.portable = !!opt.portable\n    this.strict = !!opt.strict\n    this.noPax = !!opt.noPax\n    this.noMtime = !!opt.noMtime\n\n    this.readEntry = readEntry\n    this.type = readEntry.type\n    if (this.type === 'Directory' && this.portable)\n      this.noMtime = true\n\n    this.path = readEntry.path\n    this.mode = this[MODE](readEntry.mode)\n    this.uid = this.portable ? null : readEntry.uid\n    this.gid = this.portable ? null : readEntry.gid\n    this.uname = this.portable ? null : readEntry.uname\n    this.gname = this.portable ? null : readEntry.gname\n    this.size = readEntry.size\n    this.mtime = this.noMtime ? null : opt.mtime || readEntry.mtime\n    this.atime = this.portable ? null : readEntry.atime\n    this.ctime = this.portable ? null : readEntry.ctime\n    this.linkpath = readEntry.linkpath\n\n    if (typeof opt.onwarn === 'function')\n      this.on('warn', opt.onwarn)\n\n    if (path.isAbsolute(this.path) && !this.preservePaths) {\n      const parsed = path.parse(this.path)\n      this.warn(\n        'stripping ' + parsed.root + ' from absolute path',\n        this.path\n      )\n      this.path = this.path.substr(parsed.root.length)\n    }\n\n    this.remain = readEntry.size\n    this.blockRemain = readEntry.startBlockSize\n\n    this.header = new Header({\n      path: this.path,\n      linkpath: this.linkpath,\n      // only the permissions and setuid/setgid/sticky bitflags\n      // not the higher-order bits that specify file type\n      mode: this.mode,\n      uid: this.portable ? null : this.uid,\n      gid: this.portable ? null : this.gid,\n      size: this.size,\n      mtime: this.noMtime ? null : this.mtime,\n      type: this.type,\n      uname: this.portable ? null : this.uname,\n      atime: this.portable ? null : this.atime,\n      ctime: this.portable ? null : this.ctime\n    })\n\n    if (this.header.encode() && !this.noPax)\n      super.write(new Pax({\n        atime: this.portable ? null : this.atime,\n        ctime: this.portable ? null : this.ctime,\n        gid: this.portable ? null : this.gid,\n        mtime: this.noMtime ? null : this.mtime,\n        path: this.path,\n        linkpath: this.linkpath,\n        size: this.size,\n        uid: this.portable ? null : this.uid,\n        uname: this.portable ? null : this.uname,\n        dev: this.portable ? null : this.readEntry.dev,\n        ino: this.portable ? null : this.readEntry.ino,\n        nlink: this.portable ? null : this.readEntry.nlink\n      }).encode())\n\n    super.write(this.header.block)\n    readEntry.pipe(this)\n  }\n\n  [MODE] (mode) {\n    return modeFix(mode, this.type === 'Directory')\n  }\n\n  write (data) {\n    const writeLen = data.length\n    if (writeLen > this.blockRemain)\n      throw new Error('writing more to entry than is appropriate')\n    this.blockRemain -= writeLen\n    return super.write(data)\n  }\n\n  end () {\n    if (this.blockRemain)\n      this.write(Buffer.alloc(this.blockRemain))\n    return super.end()\n  }\n})\n\nWriteEntry.Sync = WriteEntrySync\nWriteEntry.Tar = WriteEntryTar\n\nconst getType = stat =>\n  stat.isFile() ? 'File'\n  : stat.isDirectory() ? 'Directory'\n  : stat.isSymbolicLink() ? 'SymbolicLink'\n  : 'Unsupported'\n\nmodule.exports = WriteEntry\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2560,
		"ino": 135424,
		"size": 2055,
		"blocks": 4,
		"atimeMs": 1551500604735.8352,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:23:24.736Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isfile": true
	},
	"filename": "tar/package.json",
	"content": "{\n  \"_from\": \"tar\",\n  \"_id\": \"tar@4.4.8\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha512-LzHF64s5chPQQS0IYBn9IN5h3i98c12bo4NCO7e0sGM2llXQ3p2FGC5sdENN4cTW48O915Sh+x+EXx7XW96xYQ==\",\n  \"_location\": \"/tar\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"tag\",\n    \"registry\": true,\n    \"raw\": \"tar\",\n    \"name\": \"tar\",\n    \"escapedName\": \"tar\",\n    \"rawSpec\": \"\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"latest\"\n  },\n  \"_requiredBy\": [\n    \"#USER\",\n    \"/\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/tar/-/tar-4.4.8.tgz\",\n  \"_shasum\": \"b19eec3fde2a96e64666df9fdb40c5ca1bc3747d\",\n  \"_spec\": \"tar\",\n  \"_where\": \"/disk1/projects/@kawix/std/compression/tar\",\n  \"author\": {\n    \"name\": \"Isaac Z. Schlueter\",\n    \"email\": \"i@izs.me\",\n    \"url\": \"http://blog.izs.me/\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/npm/node-tar/issues\"\n  },\n  \"bundleDependencies\": false,\n  \"dependencies\": {\n    \"chownr\": \"^1.1.1\",\n    \"fs-minipass\": \"^1.2.5\",\n    \"minipass\": \"^2.3.4\",\n    \"minizlib\": \"^1.1.1\",\n    \"mkdirp\": \"^0.5.0\",\n    \"safe-buffer\": \"^5.1.2\",\n    \"yallist\": \"^3.0.2\"\n  },\n  \"deprecated\": false,\n  \"description\": \"tar for node\",\n  \"devDependencies\": {\n    \"chmodr\": \"^1.2.0\",\n    \"end-of-stream\": \"^1.4.1\",\n    \"events-to-array\": \"^1.1.2\",\n    \"mutate-fs\": \"^2.1.1\",\n    \"rimraf\": \"^2.6.2\",\n    \"tap\": \"^12.0.1\",\n    \"tar-fs\": \"^1.16.3\",\n    \"tar-stream\": \"^1.6.2\"\n  },\n  \"engines\": {\n    \"node\": \">=4.5\"\n  },\n  \"files\": [\n    \"index.js\",\n    \"lib/\"\n  ],\n  \"homepage\": \"https://github.com/npm/node-tar#readme\",\n  \"license\": \"ISC\",\n  \"name\": \"tar\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/npm/node-tar.git\"\n  },\n  \"scripts\": {\n    \"bench\": \"for i in benchmarks/*/*.js; do echo $i; for j in {1..5}; do node $i || break; done; done\",\n    \"genparse\": \"node scripts/generate-parse-fixtures.js\",\n    \"postpublish\": \"git push origin --all; git push origin --tags\",\n    \"postversion\": \"npm publish\",\n    \"preversion\": \"npm test\",\n    \"test\": \"tap test/*.js --100 -J --coverage-report=text -c\"\n  },\n  \"version\": \"4.4.8\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 131072,
		"ino": 135007,
		"size": 7,
		"blocks": 3,
		"atimeMs": 1551500646012.6226,
		"mtimeMs": 1551490330784.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:24:06.013Z",
		"mtime": "2019-03-02T01:32:10.785Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isdirectory": true
	},
	"filename": "yallist"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 512,
		"ino": 135018,
		"size": 207,
		"blocks": 2,
		"atimeMs": 1551500530954.4258,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330696.8394,
		"birthtimeMs": 1551490330696.8394,
		"atime": "2019-03-02T04:22:10.954Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.697Z",
		"birthtime": "2019-03-02T01:32:10.697Z",
		"isfile": true
	},
	"filename": "yallist/iterator.js",
	"content": "'use strict'\nmodule.exports = function (Yallist) {\n  Yallist.prototype[Symbol.iterator] = function* () {\n    for (let walker = this.head; walker; walker = walker.next) {\n      yield walker.value\n    }\n  }\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 2048,
		"ino": 135382,
		"size": 1631,
		"blocks": 4,
		"atimeMs": 1551500604735.8352,
		"mtimeMs": 1551490330780.841,
		"ctimeMs": 1551490330784.841,
		"birthtimeMs": 1551490330784.841,
		"atime": "2019-03-02T04:23:24.736Z",
		"mtime": "2019-03-02T01:32:10.781Z",
		"ctime": "2019-03-02T01:32:10.785Z",
		"birthtime": "2019-03-02T01:32:10.785Z",
		"isfile": true
	},
	"filename": "yallist/package.json",
	"content": "{\n  \"_from\": \"yallist@^3.0.2\",\n  \"_id\": \"yallist@3.0.3\",\n  \"_inBundle\": false,\n  \"_integrity\": \"sha512-S+Zk8DEWE6oKpV+vI3qWkaK+jSbIK86pCwe2IF/xwIpQ8jEuxpw9NyaGjmp9+BoJv5FV2piqCDcoCtStppiq2A==\",\n  \"_location\": \"/yallist\",\n  \"_phantomChildren\": {},\n  \"_requested\": {\n    \"type\": \"range\",\n    \"registry\": true,\n    \"raw\": \"yallist@^3.0.2\",\n    \"name\": \"yallist\",\n    \"escapedName\": \"yallist\",\n    \"rawSpec\": \"^3.0.2\",\n    \"saveSpec\": null,\n    \"fetchSpec\": \"^3.0.2\"\n  },\n  \"_requiredBy\": [\n    \"/minipass\",\n    \"/tar\"\n  ],\n  \"_resolved\": \"https://registry.npmjs.org/yallist/-/yallist-3.0.3.tgz\",\n  \"_shasum\": \"b4b049e314be545e3ce802236d6cd22cd91c3de9\",\n  \"_spec\": \"yallist@^3.0.2\",\n  \"_where\": \"/disk1/projects/@kawix/std/compression/tar/node_modules/tar\",\n  \"author\": {\n    \"name\": \"Isaac Z. Schlueter\",\n    \"email\": \"i@izs.me\",\n    \"url\": \"http://blog.izs.me/\"\n  },\n  \"bugs\": {\n    \"url\": \"https://github.com/isaacs/yallist/issues\"\n  },\n  \"bundleDependencies\": false,\n  \"dependencies\": {},\n  \"deprecated\": false,\n  \"description\": \"Yet Another Linked List\",\n  \"devDependencies\": {\n    \"tap\": \"^12.1.0\"\n  },\n  \"directories\": {\n    \"test\": \"test\"\n  },\n  \"files\": [\n    \"yallist.js\",\n    \"iterator.js\"\n  ],\n  \"homepage\": \"https://github.com/isaacs/yallist#readme\",\n  \"license\": \"ISC\",\n  \"main\": \"yallist.js\",\n  \"name\": \"yallist\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/isaacs/yallist.git\"\n  },\n  \"scripts\": {\n    \"postpublish\": \"git push origin --all; git push origin --tags\",\n    \"postversion\": \"npm publish\",\n    \"preversion\": \"npm test\",\n    \"test\": \"tap test/*.js --100\"\n  },\n  \"version\": \"3.0.3\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 67,
		"mode": 33204,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 7680,
		"ino": 135362,
		"size": 7403,
		"blocks": 7,
		"atimeMs": 1551500530958.426,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551490330704.8396,
		"birthtimeMs": 1551490330704.8396,
		"atime": "2019-03-02T04:22:10.958Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-02T01:32:10.705Z",
		"birthtime": "2019-03-02T01:32:10.705Z",
		"isfile": true
	},
	"filename": "yallist/yallist.js",
	"content": "'use strict'\nmodule.exports = Yallist\n\nYallist.Node = Node\nYallist.create = Yallist\n\nfunction Yallist (list) {\n  var self = this\n  if (!(self instanceof Yallist)) {\n    self = new Yallist()\n  }\n\n  self.tail = null\n  self.head = null\n  self.length = 0\n\n  if (list && typeof list.forEach === 'function') {\n    list.forEach(function (item) {\n      self.push(item)\n    })\n  } else if (arguments.length > 0) {\n    for (var i = 0, l = arguments.length; i < l; i++) {\n      self.push(arguments[i])\n    }\n  }\n\n  return self\n}\n\nYallist.prototype.removeNode = function (node) {\n  if (node.list !== this) {\n    throw new Error('removing node which does not belong to this list')\n  }\n\n  var next = node.next\n  var prev = node.prev\n\n  if (next) {\n    next.prev = prev\n  }\n\n  if (prev) {\n    prev.next = next\n  }\n\n  if (node === this.head) {\n    this.head = next\n  }\n  if (node === this.tail) {\n    this.tail = prev\n  }\n\n  node.list.length--\n  node.next = null\n  node.prev = null\n  node.list = null\n}\n\nYallist.prototype.unshiftNode = function (node) {\n  if (node === this.head) {\n    return\n  }\n\n  if (node.list) {\n    node.list.removeNode(node)\n  }\n\n  var head = this.head\n  node.list = this\n  node.next = head\n  if (head) {\n    head.prev = node\n  }\n\n  this.head = node\n  if (!this.tail) {\n    this.tail = node\n  }\n  this.length++\n}\n\nYallist.prototype.pushNode = function (node) {\n  if (node === this.tail) {\n    return\n  }\n\n  if (node.list) {\n    node.list.removeNode(node)\n  }\n\n  var tail = this.tail\n  node.list = this\n  node.prev = tail\n  if (tail) {\n    tail.next = node\n  }\n\n  this.tail = node\n  if (!this.head) {\n    this.head = node\n  }\n  this.length++\n}\n\nYallist.prototype.push = function () {\n  for (var i = 0, l = arguments.length; i < l; i++) {\n    push(this, arguments[i])\n  }\n  return this.length\n}\n\nYallist.prototype.unshift = function () {\n  for (var i = 0, l = arguments.length; i < l; i++) {\n    unshift(this, arguments[i])\n  }\n  return this.length\n}\n\nYallist.prototype.pop = function () {\n  if (!this.tail) {\n    return undefined\n  }\n\n  var res = this.tail.value\n  this.tail = this.tail.prev\n  if (this.tail) {\n    this.tail.next = null\n  } else {\n    this.head = null\n  }\n  this.length--\n  return res\n}\n\nYallist.prototype.shift = function () {\n  if (!this.head) {\n    return undefined\n  }\n\n  var res = this.head.value\n  this.head = this.head.next\n  if (this.head) {\n    this.head.prev = null\n  } else {\n    this.tail = null\n  }\n  this.length--\n  return res\n}\n\nYallist.prototype.forEach = function (fn, thisp) {\n  thisp = thisp || this\n  for (var walker = this.head, i = 0; walker !== null; i++) {\n    fn.call(thisp, walker.value, i, this)\n    walker = walker.next\n  }\n}\n\nYallist.prototype.forEachReverse = function (fn, thisp) {\n  thisp = thisp || this\n  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {\n    fn.call(thisp, walker.value, i, this)\n    walker = walker.prev\n  }\n}\n\nYallist.prototype.get = function (n) {\n  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {\n    // abort out of the list early if we hit a cycle\n    walker = walker.next\n  }\n  if (i === n && walker !== null) {\n    return walker.value\n  }\n}\n\nYallist.prototype.getReverse = function (n) {\n  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {\n    // abort out of the list early if we hit a cycle\n    walker = walker.prev\n  }\n  if (i === n && walker !== null) {\n    return walker.value\n  }\n}\n\nYallist.prototype.map = function (fn, thisp) {\n  thisp = thisp || this\n  var res = new Yallist()\n  for (var walker = this.head; walker !== null;) {\n    res.push(fn.call(thisp, walker.value, this))\n    walker = walker.next\n  }\n  return res\n}\n\nYallist.prototype.mapReverse = function (fn, thisp) {\n  thisp = thisp || this\n  var res = new Yallist()\n  for (var walker = this.tail; walker !== null;) {\n    res.push(fn.call(thisp, walker.value, this))\n    walker = walker.prev\n  }\n  return res\n}\n\nYallist.prototype.reduce = function (fn, initial) {\n  var acc\n  var walker = this.head\n  if (arguments.length > 1) {\n    acc = initial\n  } else if (this.head) {\n    walker = this.head.next\n    acc = this.head.value\n  } else {\n    throw new TypeError('Reduce of empty list with no initial value')\n  }\n\n  for (var i = 0; walker !== null; i++) {\n    acc = fn(acc, walker.value, i)\n    walker = walker.next\n  }\n\n  return acc\n}\n\nYallist.prototype.reduceReverse = function (fn, initial) {\n  var acc\n  var walker = this.tail\n  if (arguments.length > 1) {\n    acc = initial\n  } else if (this.tail) {\n    walker = this.tail.prev\n    acc = this.tail.value\n  } else {\n    throw new TypeError('Reduce of empty list with no initial value')\n  }\n\n  for (var i = this.length - 1; walker !== null; i--) {\n    acc = fn(acc, walker.value, i)\n    walker = walker.prev\n  }\n\n  return acc\n}\n\nYallist.prototype.toArray = function () {\n  var arr = new Array(this.length)\n  for (var i = 0, walker = this.head; walker !== null; i++) {\n    arr[i] = walker.value\n    walker = walker.next\n  }\n  return arr\n}\n\nYallist.prototype.toArrayReverse = function () {\n  var arr = new Array(this.length)\n  for (var i = 0, walker = this.tail; walker !== null; i++) {\n    arr[i] = walker.value\n    walker = walker.prev\n  }\n  return arr\n}\n\nYallist.prototype.slice = function (from, to) {\n  to = to || this.length\n  if (to < 0) {\n    to += this.length\n  }\n  from = from || 0\n  if (from < 0) {\n    from += this.length\n  }\n  var ret = new Yallist()\n  if (to < from || to < 0) {\n    return ret\n  }\n  if (from < 0) {\n    from = 0\n  }\n  if (to > this.length) {\n    to = this.length\n  }\n  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {\n    walker = walker.next\n  }\n  for (; walker !== null && i < to; i++, walker = walker.next) {\n    ret.push(walker.value)\n  }\n  return ret\n}\n\nYallist.prototype.sliceReverse = function (from, to) {\n  to = to || this.length\n  if (to < 0) {\n    to += this.length\n  }\n  from = from || 0\n  if (from < 0) {\n    from += this.length\n  }\n  var ret = new Yallist()\n  if (to < from || to < 0) {\n    return ret\n  }\n  if (from < 0) {\n    from = 0\n  }\n  if (to > this.length) {\n    to = this.length\n  }\n  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {\n    walker = walker.prev\n  }\n  for (; walker !== null && i > from; i--, walker = walker.prev) {\n    ret.push(walker.value)\n  }\n  return ret\n}\n\nYallist.prototype.reverse = function () {\n  var head = this.head\n  var tail = this.tail\n  for (var walker = head; walker !== null; walker = walker.prev) {\n    var p = walker.prev\n    walker.prev = walker.next\n    walker.next = p\n  }\n  this.head = tail\n  this.tail = head\n  return this\n}\n\nfunction push (self, item) {\n  self.tail = new Node(item, self.tail, null, self)\n  if (!self.head) {\n    self.head = self.tail\n  }\n  self.length++\n}\n\nfunction unshift (self, item) {\n  self.head = new Node(item, null, self.head, self)\n  if (!self.tail) {\n    self.tail = self.head\n  }\n  self.length++\n}\n\nfunction Node (value, prev, next, list) {\n  if (!(this instanceof Node)) {\n    return new Node(value, prev, next, list)\n  }\n\n  this.list = list\n  this.value = value\n\n  if (prev) {\n    prev.next = this\n    this.prev = prev\n  } else {\n    this.prev = null\n  }\n\n  if (next) {\n    next.prev = this\n    this.next = next\n  } else {\n    this.next = null\n  }\n}\n\ntry {\n  // add if support for Symbol.iterator is present\n  require('./iterator.js')(Yallist)\n} catch (er) {}\n"
}})
	var filenames={
	"": 0,
	"chownr": 1,
	"chownr/chownr.js": 2,
	"chownr/package.json": 3,
	"fs-minipass": 4,
	"fs-minipass/index.js": 5,
	"fs-minipass/package.json": 6,
	"minimist": 7,
	"minimist/example": 8,
	"minimist/example/parse.js": 9,
	"minimist/index.js": 10,
	"minimist/package.json": 11,
	"minimist/readme.markdown": 12,
	"minipass": 13,
	"minipass/index.js": 14,
	"minipass/package.json": 15,
	"minizlib": 16,
	"minizlib/constants.js": 17,
	"minizlib/index.js": 18,
	"minizlib/package.json": 19,
	"mkdirp": 20,
	"mkdirp/bin": 21,
	"mkdirp/bin/cmd.js": 22,
	"mkdirp/bin/usage.txt": 23,
	"mkdirp/examples": 24,
	"mkdirp/examples/pow.js": 25,
	"mkdirp/index.js": 26,
	"mkdirp/package.json": 27,
	"mkdirp/readme.markdown": 28,
	"safe-buffer": 29,
	"safe-buffer/index.d.ts": 30,
	"safe-buffer/index.js": 31,
	"safe-buffer/package.json": 32,
	"tar": 33,
	"tar/index.js": 34,
	"tar/lib": 35,
	"tar/lib/buffer.js": 36,
	"tar/lib/create.js": 37,
	"tar/lib/extract.js": 38,
	"tar/lib/header.js": 39,
	"tar/lib/high-level-opt.js": 40,
	"tar/lib/large-numbers.js": 41,
	"tar/lib/list.js": 42,
	"tar/lib/mkdir.js": 43,
	"tar/lib/mode-fix.js": 44,
	"tar/lib/pack.js": 45,
	"tar/lib/parse.js": 46,
	"tar/lib/pax.js": 47,
	"tar/lib/read-entry.js": 48,
	"tar/lib/replace.js": 49,
	"tar/lib/types.js": 50,
	"tar/lib/unpack.js": 51,
	"tar/lib/update.js": 52,
	"tar/lib/warn-mixin.js": 53,
	"tar/lib/winchars.js": 54,
	"tar/lib/write-entry.js": 55,
	"tar/package.json": 56,
	"yallist": 57,
	"yallist/iterator.js": 58,
	"yallist/package.json": 59,
	"yallist/yallist.js": 60
}
        var mod1= function(KModule, exports){
            var i=0, main, pe, filecount, pjson
            for(var id in filenames){
                if(typeof module == "object"){
                    
                main= "tar"
                main= "tar$v$4.4.8/node_modules" + (main ? ("/"+main) : "")
                                     
                }
                KModule.addVirtualFile("tar$v$4.4.8/node_modules" + (id ? ("/"+id) : ""), fileData[i])
                i++
            }
            if(pjson){
                main= pjson.main
                if(main.substring(0,2)=="./"){
                    main= main.substring(2)
                }
                main= "tar$v$4.4.8/node_modules" + (main ? ("/" + main) : "")
            }
            if(main){
                return KModule.import("/virtual/" + main)
            }
            if(typeof module == "object"){
                return exports 
            }
            return {}
        }
        /*
        if(typeof module == "object"){
            module.exports.__kawi= mod1
        }*/

        if(typeof window == "object"){
            if(window.KModuleLoader){
                module.exports= mod1(window.KModuleLoader, module.exports)
            }
        }
        if(typeof KModule == "object"){
            module.exports= mod1(KModule, module.exports)
        }
        return mod1
        
})()
// kawi converted. Preserve this line, Kawi transpiler will not reprocess if this line found