(function(){
	var fileData=[]
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 16893,
		"nlink": 5,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 697356,
		"size": 4096,
		"blocks": 8,
		"atimeMs": 1551819276057.165,
		"mtimeMs": 1551819275993.1638,
		"ctimeMs": 1551819275993.1638,
		"birthtimeMs": 1551819275993.1638,
		"atime": "2019-03-05T20:54:36.057Z",
		"mtime": "2019-03-05T20:54:35.993Z",
		"ctime": "2019-03-05T20:54:35.993Z",
		"birthtime": "2019-03-05T20:54:35.993Z",
		"isdirectory": true
	},
	"filename": ""
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696170,
		"size": 2949,
		"blocks": 8,
		"atimeMs": 1551819275990,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819275985.1636,
		"birthtimeMs": 1551819275985.1636,
		"atime": "2019-03-05T20:54:35.990Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:35.985Z",
		"birthtime": "2019-03-05T20:54:35.985Z",
		"isfile": true
	},
	"filename": "bench.js",
	"content": "'use strict'\n\nconst Benchmark = require('benchmark')\n// The default number of samples for Benchmark seems to be low enough that it\n// can generate results with significant variance (~2%) for this benchmark\n// suite. This makes it sometimes a bit confusing to actually evaluate impact of\n// changes on performance. Setting the minimum of samples to 500 results in\n// significantly lower variance on my local setup for this tests suite, and\n// gives me higher confidence in benchmark results.\nBenchmark.options.minSamples = 500\n\nconst suite = Benchmark.Suite()\n\nconst FindMyWay = require('./')\n\nconst findMyWay = new FindMyWay()\nfindMyWay.on('GET', '/', () => true)\nfindMyWay.on('GET', '/user/:id', () => true)\nfindMyWay.on('GET', '/user/:id/static', () => true)\nfindMyWay.on('GET', '/customer/:name-:surname', () => true)\nfindMyWay.on('GET', '/at/:hour(^\\\\d+)h:minute(^\\\\d+)m', () => true)\nfindMyWay.on('GET', '/abc/def/ghi/lmn/opq/rst/uvz', () => true)\nfindMyWay.on('GET', '/', { version: '1.2.0' }, () => true)\n\nsuite\n  .add('lookup static route', function () {\n    findMyWay.lookup({ method: 'GET', url: '/', headers: {} }, null)\n  })\n  .add('lookup dynamic route', function () {\n    findMyWay.lookup({ method: 'GET', url: '/user/tomas', headers: {} }, null)\n  })\n  .add('lookup dynamic multi-parametric route', function () {\n    findMyWay.lookup({ method: 'GET', url: '/customer/john-doe', headers: {} }, null)\n  })\n  .add('lookup dynamic multi-parametric route with regex', function () {\n    findMyWay.lookup({ method: 'GET', url: '/at/12h00m', headers: {} }, null)\n  })\n  .add('lookup long static route', function () {\n    findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz', headers: {} }, null)\n  })\n  .add('lookup long dynamic route', function () {\n    findMyWay.lookup({ method: 'GET', url: '/user/qwertyuiopasdfghjklzxcvbnm/static', headers: {} }, null)\n  })\n  .add('lookup static versioned route', function () {\n    findMyWay.lookup({ method: 'GET', url: '/', headers: { 'accept-version': '1.x' } }, null)\n  })\n  .add('find static route', function () {\n    findMyWay.find('GET', '/', undefined)\n  })\n  .add('find dynamic route', function () {\n    findMyWay.find('GET', '/user/tomas', undefined)\n  })\n  .add('find dynamic multi-parametric route', function () {\n    findMyWay.find('GET', '/customer/john-doe', undefined)\n  })\n  .add('find dynamic multi-parametric route with regex', function () {\n    findMyWay.find('GET', '/at/12h00m', undefined)\n  })\n  .add('find long static route', function () {\n    findMyWay.find('GET', '/abc/def/ghi/lmn/opq/rst/uvz', undefined)\n  })\n  .add('find long dynamic route', function () {\n    findMyWay.find('GET', '/user/qwertyuiopasdfghjklzxcvbnm/static', undefined)\n  })\n  .add('find static versioned route', function () {\n    findMyWay.find('GET', '/', '1.x')\n  })\n  .on('cycle', function (event) {\n    console.log(String(event.target))\n  })\n  .on('complete', function () {})\n  .run()\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696171,
		"size": 599,
		"blocks": 8,
		"atimeMs": 1551819275990,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819275985.1636,
		"birthtimeMs": 1551819275985.1636,
		"atime": "2019-03-05T20:54:35.990Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:35.985Z",
		"birthtime": "2019-03-05T20:54:35.985Z",
		"isfile": true
	},
	"filename": "example.js",
	"content": "'use strict'\n\nconst http = require('http')\nconst router = require('./')({\n  defaultRoute: (req, res) => {\n    res.end('not found')\n  }\n})\n\nrouter.on('GET', '/test', (req, res, params) => {\n  res.end('{\"hello\":\"world\"}')\n})\n\nrouter.on('GET', '/:test', (req, res, params) => {\n  res.end(JSON.stringify(params))\n})\n\nrouter.on('GET', '/text/hello', (req, res, params) => {\n  res.end('{\"winter\":\"is here\"}')\n})\n\nconst server = http.createServer((req, res) => {\n  router.lookup(req, res)\n})\n\nserver.listen(3000, err => {\n  if (err) throw err\n  console.log('Server listening on: http://localhost:3000')\n})\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696172,
		"size": 4461,
		"blocks": 16,
		"atimeMs": 1551819275990,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819275985.1636,
		"birthtimeMs": 1551819275985.1636,
		"atime": "2019-03-05T20:54:35.990Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:35.985Z",
		"birthtime": "2019-03-05T20:54:35.985Z",
		"isfile": true
	},
	"filename": "index.d.ts",
	"content": "import { IncomingMessage, ServerResponse } from 'http';\nimport { Http2ServerRequest, Http2ServerResponse } from 'http2';\n\ndeclare function Router<V extends Router.HTTPVersion = Router.HTTPVersion.V1>(\n  config?: Router.Config<V>\n): Router.Instance<V>;\n\ndeclare namespace Router {\n  enum HTTPVersion {\n    V1 = 'http1',\n    V2 = 'http2'\n  }\n\n  type HTTPMethod =\n    | 'ACL'\n    | 'BIND'\n    | 'CHECKOUT'\n    | 'CONNECT'\n    | 'COPY'\n    | 'DELETE'\n    | 'GET'\n    | 'HEAD'\n    | 'LINK'\n    | 'LOCK'\n    | 'M-SEARCH'\n    | 'MERGE'\n    | 'MKACTIVITY'\n    | 'MKCALENDAR'\n    | 'MKCOL'\n    | 'MOVE'\n    | 'NOTIFY'\n    | 'OPTIONS'\n    | 'PATCH'\n    | 'POST'\n    | 'PROPFIND'\n    | 'PROPPATCH'\n    | 'PURGE'\n    | 'PUT'\n    | 'REBIND'\n    | 'REPORT'\n    | 'SEARCH'\n    | 'SOURCE'\n    | 'SUBSCRIBE'\n    | 'TRACE'\n    | 'UNBIND'\n    | 'UNLINK'\n    | 'UNLOCK'\n    | 'UNSUBSCRIBE';\n\n  type Handler<V extends HTTPVersion> = (\n    req: V extends HTTPVersion.V1 ? IncomingMessage : Http2ServerRequest,\n    res: V extends HTTPVersion.V1 ? ServerResponse : Http2ServerResponse,\n    params: { [k: string]: string | undefined },\n    store: any\n  ) => void;\n\n  interface Config<V extends HTTPVersion> {\n    ignoreTrailingSlash?: boolean;\n\n    allowUnsafeRegex?: boolean;\n\n    caseSensitive?: boolean;\n\n    maxParamLength?: number;\n\n    defaultRoute?(\n      req: V extends HTTPVersion.V1 ? IncomingMessage : Http2ServerRequest,\n      res: V extends HTTPVersion.V1 ? ServerResponse : Http2ServerResponse\n    ): void;\n\n    versioning? : {\n      storage() : {\n        get(version: String) : Handler<V> | null,\n        set(version: String, store: Handler<V>) : void,\n        del(version: String) : void,\n        empty() : void\n      },\n      deriveVersion<Context>(req: V extends HTTPVersion.V1 ? IncomingMessage : Http2ServerRequest, ctx?: Context) : String,\n    }\n  }\n\n  interface RouteOptions {\n    version: string;\n  }\n\n  interface ShortHandRoute<V extends HTTPVersion> {\n    (path: string, handler: Handler<V>): void;\n    (path: string, opts: RouteOptions, handler: Handler<V>): void;\n    (path: string, handler: Handler<V>, store: any): void;\n    (path: string, opts: RouteOptions, handler: Handler<V>, store: any): void;\n  }\n\n  interface FindResult<V extends HTTPVersion> {\n    handler: Handler<V>;\n    params: { [k: string]: string | undefined };\n    store: any;\n  }\n\n  interface Instance<V extends HTTPVersion> {\n    on(\n      method: HTTPMethod | HTTPMethod[],\n      path: string,\n      handler: Handler<V>\n    ): void;\n    on(\n      method: HTTPMethod | HTTPMethod[],\n      path: string,\n      options: RouteOptions,\n      handler: Handler<V>\n    ): void;\n    on(\n      method: HTTPMethod | HTTPMethod[],\n      path: string,\n      handler: Handler<V>,\n      store: any\n    ): void;\n    on(\n      method: HTTPMethod | HTTPMethod[],\n      path: string,\n      options: RouteOptions,\n      handler: Handler<V>,\n      store: any\n    ): void;\n\n    off(method: HTTPMethod | HTTPMethod[], path: string): void;\n\n    lookup<Context>(\n      req: V extends HTTPVersion.V1 ? IncomingMessage : Http2ServerRequest,\n      res: V extends HTTPVersion.V1 ? ServerResponse : Http2ServerResponse,\n      ctx?: Context\n    ): void;\n\n    find(\n      method: HTTPMethod,\n      path: string,\n      version?: string\n    ): FindResult<V> | null;\n\n    reset(): void;\n    prettyPrint(): string;\n\n    all: ShortHandRoute<V>;\n\n    acl: ShortHandRoute<V>;\n    bind: ShortHandRoute<V>;\n    checkout: ShortHandRoute<V>;\n    connect: ShortHandRoute<V>;\n    copy: ShortHandRoute<V>;\n    delete: ShortHandRoute<V>;\n    get: ShortHandRoute<V>;\n    head: ShortHandRoute<V>;\n    link: ShortHandRoute<V>;\n    lock: ShortHandRoute<V>;\n    'm-search': ShortHandRoute<V>;\n    merge: ShortHandRoute<V>;\n    mkactivity: ShortHandRoute<V>;\n    mkcalendar: ShortHandRoute<V>;\n    mkcol: ShortHandRoute<V>;\n    move: ShortHandRoute<V>;\n    notify: ShortHandRoute<V>;\n    options: ShortHandRoute<V>;\n    patch: ShortHandRoute<V>;\n    post: ShortHandRoute<V>;\n    propfind: ShortHandRoute<V>;\n    proppatch: ShortHandRoute<V>;\n    purge: ShortHandRoute<V>;\n    put: ShortHandRoute<V>;\n    rebind: ShortHandRoute<V>;\n    report: ShortHandRoute<V>;\n    search: ShortHandRoute<V>;\n    source: ShortHandRoute<V>;\n    subscribe: ShortHandRoute<V>;\n    trace: ShortHandRoute<V>;\n    unbind: ShortHandRoute<V>;\n    unlink: ShortHandRoute<V>;\n    unlock: ShortHandRoute<V>;\n    unsubscribe: ShortHandRoute<V>;\n  }\n}\n\nexport = Router;\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696173,
		"size": 18518,
		"blocks": 40,
		"atimeMs": 1551819275990,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819275985.1636,
		"birthtimeMs": 1551819275985.1636,
		"atime": "2019-03-05T20:54:35.990Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:35.985Z",
		"birthtime": "2019-03-05T20:54:35.985Z",
		"isfile": true
	},
	"filename": "index.js",
	"content": "'use strict'\n\n/*\n  Char codes:\n    '#': 35\n    '*': 42\n    '-': 45\n    '/': 47\n    ':': 58\n    ';': 59\n    '?': 63\n*/\n\nconst assert = require('assert')\nconst http = require('http')\nconst fastDecode = require('fast-decode-uri-component')\nconst isRegexSafe = require('safe-regex2')\nconst Node = require('./node')\nconst NODE_TYPES = Node.prototype.types\nconst httpMethods = http.METHODS\nconst FULL_PATH_REGEXP = /^https?:\\/\\/.*\\//\n\nif (!isRegexSafe(FULL_PATH_REGEXP)) {\n  throw new Error('the FULL_PATH_REGEXP is not safe, update this module')\n}\n\nconst acceptVersionStrategy = require('./lib/accept-version')\n\nfunction Router (opts) {\n  if (!(this instanceof Router)) {\n    return new Router(opts)\n  }\n  opts = opts || {}\n\n  if (opts.defaultRoute) {\n    assert(typeof opts.defaultRoute === 'function', 'The default route must be a function')\n    this.defaultRoute = opts.defaultRoute\n  } else {\n    this.defaultRoute = null\n  }\n\n  this.caseSensitive = opts.caseSensitive === undefined ? true : opts.caseSensitive\n  this.ignoreTrailingSlash = opts.ignoreTrailingSlash || false\n  this.maxParamLength = opts.maxParamLength || 100\n  this.allowUnsafeRegex = opts.allowUnsafeRegex || false\n  this.versioning = opts.versioning || acceptVersionStrategy\n  this.tree = new Node({ versions: this.versioning.storage() })\n  this.routes = []\n}\n\nRouter.prototype.on = function on (method, path, opts, handler, store) {\n  if (typeof opts === 'function') {\n    if (handler !== undefined) {\n      store = handler\n    }\n    handler = opts\n    opts = {}\n  }\n  // path validation\n  assert(typeof path === 'string', 'Path should be a string')\n  assert(path.length > 0, 'The path could not be empty')\n  assert(path[0] === '/' || path[0] === '*', 'The first character of a path should be `/` or `*`')\n  // handler validation\n  assert(typeof handler === 'function', 'Handler should be a function')\n\n  this._on(method, path, opts, handler, store)\n\n  if (this.ignoreTrailingSlash && path !== '/' && !path.endsWith('*')) {\n    if (path.endsWith('/')) {\n      this._on(method, path.slice(0, -1), opts, handler, store)\n    } else {\n      this._on(method, path + '/', opts, handler, store)\n    }\n  }\n}\n\nRouter.prototype._on = function _on (method, path, opts, handler, store) {\n  if (Array.isArray(method)) {\n    for (var k = 0; k < method.length; k++) {\n      this._on(method[k], path, opts, handler, store)\n    }\n    return\n  }\n\n  // method validation\n  assert(typeof method === 'string', 'Method should be a string')\n  assert(httpMethods.indexOf(method) !== -1, `Method '${method}' is not an http method.`)\n\n  const params = []\n  var j = 0\n\n  this.routes.push({\n    method: method,\n    path: path,\n    opts: opts,\n    handler: handler,\n    store: store\n  })\n\n  const version = opts.version\n\n  for (var i = 0, len = path.length; i < len; i++) {\n    // search for parametric or wildcard routes\n    // parametric route\n    if (path.charCodeAt(i) === 58) {\n      var nodeType = NODE_TYPES.PARAM\n      j = i + 1\n      var staticPart = path.slice(0, i)\n\n      if (this.caseSensitive === false) {\n        staticPart = staticPart.toLowerCase()\n      }\n\n      // add the static part of the route to the tree\n      this._insert(method, staticPart, 0, null, null, null, null, version)\n\n      // isolate the parameter name\n      var isRegex = false\n      while (i < len && path.charCodeAt(i) !== 47) {\n        isRegex = isRegex || path[i] === '('\n        if (isRegex) {\n          i = getClosingParenthensePosition(path, i) + 1\n          break\n        } else if (path.charCodeAt(i) !== 45) {\n          i++\n        } else {\n          break\n        }\n      }\n\n      if (isRegex && (i === len || path.charCodeAt(i) === 47)) {\n        nodeType = NODE_TYPES.REGEX\n      } else if (i < len && path.charCodeAt(i) !== 47) {\n        nodeType = NODE_TYPES.MULTI_PARAM\n      }\n\n      var parameter = path.slice(j, i)\n      var regex = isRegex ? parameter.slice(parameter.indexOf('('), i) : null\n      if (isRegex) {\n        regex = new RegExp(regex)\n        if (!this.allowUnsafeRegex) {\n          assert(isRegexSafe(regex), `The regex '${regex.toString()}' is not safe!`)\n        }\n      }\n      params.push(parameter.slice(0, isRegex ? parameter.indexOf('(') : i))\n\n      path = path.slice(0, j) + path.slice(i)\n      i = j\n      len = path.length\n\n      // if the path is ended\n      if (i === len) {\n        var completedPath = path.slice(0, i)\n        if (this.caseSensitive === false) {\n          completedPath = completedPath.toLowerCase()\n        }\n        return this._insert(method, completedPath, nodeType, params, handler, store, regex, version)\n      }\n      // add the parameter and continue with the search\n      this._insert(method, path.slice(0, i), nodeType, params, null, null, regex, version)\n\n      i--\n    // wildcard route\n    } else if (path.charCodeAt(i) === 42) {\n      this._insert(method, path.slice(0, i), 0, null, null, null, null, version)\n      // add the wildcard parameter\n      params.push('*')\n      return this._insert(method, path.slice(0, len), 2, params, handler, store, null, version)\n    }\n  }\n\n  if (this.caseSensitive === false) {\n    path = path.toLowerCase()\n  }\n\n  // static route\n  this._insert(method, path, 0, params, handler, store, null, version)\n}\n\nRouter.prototype._insert = function _insert (method, path, kind, params, handler, store, regex, version) {\n  const route = path\n  var currentNode = this.tree\n  var prefix = ''\n  var pathLen = 0\n  var prefixLen = 0\n  var len = 0\n  var max = 0\n  var node = null\n\n  while (true) {\n    prefix = currentNode.prefix\n    prefixLen = prefix.length\n    pathLen = path.length\n    len = 0\n\n    // search for the longest common prefix\n    max = pathLen < prefixLen ? pathLen : prefixLen\n    while (len < max && path[len] === prefix[len]) len++\n\n    // the longest common prefix is smaller than the current prefix\n    // let's split the node and add a new child\n    if (len < prefixLen) {\n      node = new Node(\n        { prefix: prefix.slice(len),\n          children: currentNode.children,\n          kind: currentNode.kind,\n          handlers: new Node.Handlers(currentNode.handlers),\n          regex: currentNode.regex,\n          versions: currentNode.versions }\n      )\n      if (currentNode.wildcardChild !== null) {\n        node.wildcardChild = currentNode.wildcardChild\n      }\n\n      // reset the parent\n      currentNode\n        .reset(prefix.slice(0, len), this.versioning.storage())\n        .addChild(node)\n\n      // if the longest common prefix has the same length of the current path\n      // the handler should be added to the current node, to a child otherwise\n      if (len === pathLen) {\n        if (version) {\n          assert(!currentNode.getVersionHandler(version, method), `Method '${method}' already declared for route '${route}' version '${version}'`)\n          currentNode.setVersionHandler(version, method, handler, params, store)\n        } else {\n          assert(!currentNode.getHandler(method), `Method '${method}' already declared for route '${route}'`)\n          currentNode.setHandler(method, handler, params, store)\n        }\n        currentNode.kind = kind\n      } else {\n        node = new Node({\n          prefix: path.slice(len),\n          kind: kind,\n          handlers: null,\n          regex: regex,\n          versions: this.versioning.storage()\n        })\n        if (version) {\n          node.setVersionHandler(version, method, handler, params, store)\n        } else {\n          node.setHandler(method, handler, params, store)\n        }\n        currentNode.addChild(node)\n      }\n\n    // the longest common prefix is smaller than the path length,\n    // but is higher than the prefix\n    } else if (len < pathLen) {\n      // remove the prefix\n      path = path.slice(len)\n      // check if there is a child with the label extracted from the new path\n      node = currentNode.findByLabel(path)\n      // there is a child within the given label, we must go deepen in the tree\n      if (node) {\n        currentNode = node\n        continue\n      }\n      // there are not children within the given label, let's create a new one!\n      node = new Node({ prefix: path, kind: kind, handlers: null, regex: regex, versions: this.versioning.storage() })\n      if (version) {\n        node.setVersionHandler(version, method, handler, params, store)\n      } else {\n        node.setHandler(method, handler, params, store)\n      }\n\n      currentNode.addChild(node)\n\n    // the node already exist\n    } else if (handler) {\n      if (version) {\n        assert(!currentNode.getVersionHandler(version, method), `Method '${method}' already declared for route '${route}' version '${version}'`)\n        currentNode.setVersionHandler(version, method, handler, params, store)\n      } else {\n        assert(!currentNode.getHandler(method), `Method '${method}' already declared for route '${route}'`)\n        currentNode.setHandler(method, handler, params, store)\n      }\n    }\n    return\n  }\n}\n\nRouter.prototype.reset = function reset () {\n  this.tree = new Node({ versions: this.versioning.storage() })\n  this.routes = []\n}\n\nRouter.prototype.off = function off (method, path) {\n  var self = this\n\n  if (Array.isArray(method)) {\n    return method.map(function (method) {\n      return self.off(method, path)\n    })\n  }\n\n  // method validation\n  assert(typeof method === 'string', 'Method should be a string')\n  assert(httpMethods.indexOf(method) !== -1, `Method '${method}' is not an http method.`)\n  // path validation\n  assert(typeof path === 'string', 'Path should be a string')\n  assert(path.length > 0, 'The path could not be empty')\n  assert(path[0] === '/' || path[0] === '*', 'The first character of a path should be `/` or `*`')\n\n  // Rebuild tree without the specific route\n  const ignoreTrailingSlash = this.ignoreTrailingSlash\n  var newRoutes = self.routes.filter(function (route) {\n    if (!ignoreTrailingSlash) {\n      return !(method === route.method && path === route.path)\n    }\n    if (path.endsWith('/')) {\n      const routeMatches = path === route.path || path.slice(0, -1) === route.path\n      return !(method === route.method && routeMatches)\n    }\n    const routeMatches = path === route.path || (path + '/') === route.path\n    return !(method === route.method && routeMatches)\n  })\n  if (ignoreTrailingSlash) {\n    newRoutes = newRoutes.filter(function (route, i, ar) {\n      if (route.path.endsWith('/') && i < ar.length - 1) {\n        return route.path.slice(0, -1) !== ar[i + 1].path\n      } else if (route.path.endsWith('/') === false && i < ar.length - 1) {\n        return (route.path + '/') !== ar[i + 1].path\n      }\n      return true\n    })\n  }\n  self.reset()\n  newRoutes.forEach(function (route) {\n    self.on(route.method, route.path, route.opts, route.handler, route.store)\n  })\n}\n\nRouter.prototype.lookup = function lookup (req, res, ctx) {\n  var handle = this.find(req.method, sanitizeUrl(req.url), this.versioning.deriveVersion(req, ctx))\n  if (handle === null) return this._defaultRoute(req, res, ctx)\n  return ctx === undefined\n    ? handle.handler(req, res, handle.params, handle.store)\n    : handle.handler.call(ctx, req, res, handle.params, handle.store)\n}\n\nRouter.prototype.find = function find (method, path, version) {\n  if (path.charCodeAt(0) !== 47) { // 47 is '/'\n    path = path.replace(FULL_PATH_REGEXP, '/')\n  }\n\n  var originalPath = path\n  var originalPathLength = path.length\n\n  if (this.caseSensitive === false) {\n    path = path.toLowerCase()\n  }\n\n  var maxParamLength = this.maxParamLength\n  var currentNode = this.tree\n  var wildcardNode = null\n  var pathLenWildcard = 0\n  var decoded = null\n  var pindex = 0\n  var params = []\n  var i = 0\n  var idxInOriginalPath = 0\n\n  while (true) {\n    var pathLen = path.length\n    var prefix = currentNode.prefix\n    var prefixLen = prefix.length\n    var len = 0\n    var previousPath = path\n    // found the route\n    if (pathLen === 0 || path === prefix) {\n      var handle = version === undefined\n        ? currentNode.handlers[method]\n        : currentNode.getVersionHandler(version, method)\n      if (handle !== null && handle !== undefined) {\n        var paramsObj = {}\n        if (handle.paramsLength > 0) {\n          var paramNames = handle.params\n\n          for (i = 0; i < handle.paramsLength; i++) {\n            paramsObj[paramNames[i]] = params[i]\n          }\n        }\n\n        return {\n          handler: handle.handler,\n          params: paramsObj,\n          store: handle.store\n        }\n      }\n    }\n\n    // search for the longest common prefix\n    i = pathLen < prefixLen ? pathLen : prefixLen\n    while (len < i && path.charCodeAt(len) === prefix.charCodeAt(len)) len++\n\n    if (len === prefixLen) {\n      path = path.slice(len)\n      pathLen = path.length\n      idxInOriginalPath += len\n    }\n\n    var node = version === undefined\n      ? currentNode.findChild(path, method)\n      : currentNode.findVersionChild(version, path, method)\n\n    if (node === null) {\n      node = currentNode.parametricBrother\n      if (node === null) {\n        return getWildcardNode(wildcardNode, method, originalPath, pathLenWildcard)\n      }\n\n      if (originalPath.indexOf('/' + previousPath) === -1) {\n        // we need to know the outstanding path so far from the originalPath since the last encountered \"/\" and assign it to previousPath.\n        // e.g originalPath: /aa/bbb/cc, path: bb/cc\n        // outstanding path: /bbb/cc\n        var pathDiff = originalPath.slice(0, originalPathLength - pathLen)\n        previousPath = pathDiff.slice(pathDiff.lastIndexOf('/') + 1, pathDiff.length) + path\n      }\n      idxInOriginalPath = idxInOriginalPath -\n        (previousPath.length - path.length)\n      path = previousPath\n      pathLen = previousPath.length\n      len = prefixLen\n    }\n\n    var kind = node.kind\n\n    // static route\n    if (kind === NODE_TYPES.STATIC) {\n      // if exist, save the wildcard child\n      if (currentNode.wildcardChild !== null) {\n        wildcardNode = currentNode.wildcardChild\n        pathLenWildcard = pathLen\n      }\n      currentNode = node\n      continue\n    }\n\n    if (len !== prefixLen) {\n      return getWildcardNode(wildcardNode, method, originalPath, pathLenWildcard)\n    }\n\n    // if exist, save the wildcard child\n    if (currentNode.wildcardChild !== null) {\n      wildcardNode = currentNode.wildcardChild\n      pathLenWildcard = pathLen\n    }\n\n    // parametric route\n    if (kind === NODE_TYPES.PARAM) {\n      currentNode = node\n      i = path.indexOf('/')\n      if (i === -1) i = pathLen\n      if (i > maxParamLength) return null\n      decoded = fastDecode(originalPath.slice(idxInOriginalPath, idxInOriginalPath + i))\n      if (decoded === null) return null\n      params[pindex++] = decoded\n      path = path.slice(i)\n      idxInOriginalPath += i\n      continue\n    }\n\n    // wildcard route\n    if (kind === NODE_TYPES.MATCH_ALL) {\n      decoded = fastDecode(originalPath.slice(idxInOriginalPath))\n      if (decoded === null) return null\n      params[pindex] = decoded\n      currentNode = node\n      path = ''\n      continue\n    }\n\n    // parametric(regex) route\n    if (kind === NODE_TYPES.REGEX) {\n      currentNode = node\n      i = path.indexOf('/')\n      if (i === -1) i = pathLen\n      if (i > maxParamLength) return null\n      decoded = fastDecode(originalPath.slice(idxInOriginalPath, idxInOriginalPath + i))\n      if (decoded === null) return null\n      if (!node.regex.test(decoded)) return null\n      params[pindex++] = decoded\n      path = path.slice(i)\n      idxInOriginalPath += i\n      continue\n    }\n\n    // multiparametric route\n    if (kind === NODE_TYPES.MULTI_PARAM) {\n      currentNode = node\n      i = 0\n      if (node.regex !== null) {\n        var matchedParameter = path.match(node.regex)\n        if (matchedParameter === null) return null\n        i = matchedParameter[1].length\n      } else {\n        while (i < pathLen && path.charCodeAt(i) !== 47 && path.charCodeAt(i) !== 45) i++\n        if (i > maxParamLength) return null\n      }\n      decoded = fastDecode(originalPath.slice(idxInOriginalPath, idxInOriginalPath + i))\n      if (decoded === null) return null\n      params[pindex++] = decoded\n      path = path.slice(i)\n      idxInOriginalPath += i\n      continue\n    }\n\n    wildcardNode = null\n  }\n}\n\nRouter.prototype._defaultRoute = function (req, res, ctx) {\n  if (this.defaultRoute !== null) {\n    return ctx === undefined\n      ? this.defaultRoute(req, res)\n      : this.defaultRoute.call(ctx, req, res)\n  } else {\n    res.statusCode = 404\n    res.end()\n  }\n}\n\nRouter.prototype.prettyPrint = function () {\n  return this.tree.prettyPrint('', true)\n}\n\nfor (var i in http.METHODS) {\n  if (!http.METHODS.hasOwnProperty(i)) continue\n  const m = http.METHODS[i]\n  const methodName = m.toLowerCase()\n\n  if (Router.prototype[methodName]) throw new Error('Method already exists: ' + methodName)\n\n  Router.prototype[methodName] = function (path, handler, store) {\n    return this.on(m, path, handler, store)\n  }\n}\n\nRouter.prototype.all = function (path, handler, store) {\n  this.on(httpMethods, path, handler, store)\n}\n\nmodule.exports = Router\n\nfunction sanitizeUrl (url) {\n  for (var i = 0, len = url.length; i < len; i++) {\n    var charCode = url.charCodeAt(i)\n    // Some systems do not follow RFC and separate the path and query\n    // string with a `;` character (code 59), e.g. `/foo;jsessionid=123456`.\n    // Thus, we need to split on `;` as well as `?` and `#`.\n    if (charCode === 63 || charCode === 59 || charCode === 35) {\n      return url.slice(0, i)\n    }\n  }\n  return url\n}\n\nfunction getWildcardNode (node, method, path, len) {\n  if (node === null) return null\n  var decoded = fastDecode(path.slice(-len))\n  if (decoded === null) return null\n  var handle = node.handlers[method]\n  if (handle !== null && handle !== undefined) {\n    return {\n      handler: handle.handler,\n      params: { '*': decoded },\n      store: handle.store\n    }\n  }\n  return null\n}\n\nfunction getClosingParenthensePosition (path, idx) {\n  // `path.indexOf()` will always return the first position of the closing parenthese,\n  // but it's inefficient for grouped or wrong regexp expressions.\n  // see issues #62 and #63 for more info\n\n  var parentheses = 1\n\n  while (idx < path.length) {\n    idx++\n\n    // ignore skipped chars\n    if (path[idx] === '\\\\') {\n      idx++\n      continue\n    }\n\n    if (path[idx] === ')') {\n      parentheses--\n    } else if (path[idx] === '(') {\n      parentheses++\n    }\n\n    if (!parentheses) return idx\n  }\n\n  throw new TypeError('Invalid regexp expression in \"' + path + '\"')\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 697357,
		"size": 4096,
		"blocks": 8,
		"atimeMs": 1551819275985.1636,
		"mtimeMs": 1551819275985.1636,
		"ctimeMs": 1551819275985.1636,
		"birthtimeMs": 1551819275985.1636,
		"atime": "2019-03-05T20:54:35.985Z",
		"mtime": "2019-03-05T20:54:35.985Z",
		"ctime": "2019-03-05T20:54:35.985Z",
		"birthtime": "2019-03-05T20:54:35.985Z",
		"isdirectory": true
	},
	"filename": "lib"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696177,
		"size": 188,
		"blocks": 8,
		"atimeMs": 1551819275992,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819275985.1636,
		"birthtimeMs": 1551819275985.1636,
		"atime": "2019-03-05T20:54:35.992Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:35.985Z",
		"birthtime": "2019-03-05T20:54:35.985Z",
		"isfile": true
	},
	"filename": "lib/accept-version.js",
	"content": "'use strict'\n\nconst SemVerStore = require('semver-store')\n\nmodule.exports = {\n  storage: SemVerStore,\n  deriveVersion: function (req, ctx) {\n    return req.headers['accept-version']\n  }\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696175,
		"size": 6328,
		"blocks": 16,
		"atimeMs": 1551819275991,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819275985.1636,
		"birthtimeMs": 1551819275985.1636,
		"atime": "2019-03-05T20:54:35.991Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:35.985Z",
		"birthtime": "2019-03-05T20:54:35.985Z",
		"isfile": true
	},
	"filename": "node.js",
	"content": "'use strict'\n\nconst assert = require('assert')\nconst http = require('http')\nconst Handlers = buildHandlers()\n\nconst types = {\n  STATIC: 0,\n  PARAM: 1,\n  MATCH_ALL: 2,\n  REGEX: 3,\n  // It's used for a parameter, that is followed by another parameter in the same part\n  MULTI_PARAM: 4\n}\n\nfunction Node (options) {\n  // former arguments order: prefix, children, kind, handlers, regex, versions\n  options = options || {}\n  this.prefix = options.prefix || '/'\n  this.label = this.prefix[0]\n  this.children = options.children || {}\n  this.numberOfChildren = Object.keys(this.children).length\n  this.kind = options.kind || this.types.STATIC\n  this.handlers = new Handlers(options.handlers)\n  this.regex = options.regex || null\n  this.wildcardChild = null\n  this.parametricBrother = null\n  this.versions = options.versions\n}\n\nObject.defineProperty(Node.prototype, 'types', {\n  value: types\n})\n\nNode.prototype.getLabel = function () {\n  return this.prefix[0]\n}\n\nNode.prototype.addChild = function (node) {\n  var label = ''\n  switch (node.kind) {\n    case this.types.STATIC:\n      label = node.getLabel()\n      break\n    case this.types.PARAM:\n    case this.types.REGEX:\n    case this.types.MULTI_PARAM:\n      label = ':'\n      break\n    case this.types.MATCH_ALL:\n      this.wildcardChild = node\n      label = '*'\n      break\n    default:\n      throw new Error(`Unknown node kind: ${node.kind}`)\n  }\n\n  assert(\n    this.children[label] === undefined,\n    `There is already a child with label '${label}'`\n  )\n\n  this.children[label] = node\n  this.numberOfChildren = Object.keys(this.children).length\n\n  const labels = Object.keys(this.children)\n  var parametricBrother = this.parametricBrother\n  for (var i = 0; i < labels.length; i++) {\n    const child = this.children[labels[i]]\n    if (child.label === ':') {\n      parametricBrother = child\n      break\n    }\n  }\n\n  // Save the parametric brother inside static children\n  const iterate = (node) => {\n    if (!node) {\n      return\n    }\n\n    if (node.kind !== this.types.STATIC) {\n      return\n    }\n\n    if (node !== this) {\n      node.parametricBrother = parametricBrother || node.parametricBrother\n    }\n\n    const labels = Object.keys(node.children)\n    for (var i = 0; i < labels.length; i++) {\n      iterate(node.children[labels[i]])\n    }\n  }\n\n  iterate(this)\n\n  return this\n}\n\nNode.prototype.reset = function (prefix, versions) {\n  this.prefix = prefix\n  this.children = {}\n  this.kind = this.types.STATIC\n  this.handlers = new Handlers()\n  this.numberOfChildren = 0\n  this.regex = null\n  this.wildcardChild = null\n  this.versions = versions\n  return this\n}\n\nNode.prototype.findByLabel = function (path) {\n  return this.children[path[0]]\n}\n\nNode.prototype.findChild = function (path, method) {\n  var child = this.children[path[0]]\n  if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null)) {\n    if (path.slice(0, child.prefix.length) === child.prefix) {\n      return child\n    }\n  }\n\n  child = this.children[':'] || this.children['*']\n  if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null)) {\n    return child\n  }\n\n  return null\n}\n\nNode.prototype.findVersionChild = function (version, path, method) {\n  var child = this.children[path[0]]\n  if (child !== undefined && (child.numberOfChildren > 0 || child.getVersionHandler(version, method) !== null)) {\n    if (path.slice(0, child.prefix.length) === child.prefix) {\n      return child\n    }\n  }\n\n  child = this.children[':'] || this.children['*']\n  if (child !== undefined && (child.numberOfChildren > 0 || child.getVersionHandler(version, method) !== null)) {\n    return child\n  }\n\n  return null\n}\n\nNode.prototype.setHandler = function (method, handler, params, store) {\n  if (!handler) return\n\n  assert(\n    this.handlers[method] !== undefined,\n    `There is already an handler with method '${method}'`\n  )\n\n  this.handlers[method] = {\n    handler: handler,\n    params: params,\n    store: store || null,\n    paramsLength: params.length\n  }\n}\n\nNode.prototype.setVersionHandler = function (version, method, handler, params, store) {\n  if (!handler) return\n\n  const handlers = this.versions.get(version) || new Handlers()\n  assert(\n    handlers[method] === null,\n    `There is already an handler with version '${version}' and method '${method}'`\n  )\n\n  handlers[method] = {\n    handler: handler,\n    params: params,\n    store: store || null,\n    paramsLength: params.length\n  }\n  this.versions.set(version, handlers)\n}\n\nNode.prototype.getHandler = function (method) {\n  return this.handlers[method]\n}\n\nNode.prototype.getVersionHandler = function (version, method) {\n  var handlers = this.versions.get(version)\n  return handlers === null ? handlers : handlers[method]\n}\n\nNode.prototype.prettyPrint = function (prefix, tail) {\n  var paramName = ''\n  var handlers = this.handlers || {}\n  var methods = Object.keys(handlers).filter(method => handlers[method] && handlers[method].handler)\n\n  if (this.prefix === ':') {\n    methods.forEach((method, index) => {\n      var params = this.handlers[method].params\n      var param = params[params.length - 1]\n      if (methods.length > 1) {\n        if (index === 0) {\n          paramName += param + ` (${method})\\n`\n          return\n        }\n        paramName += '    ' + prefix + ':' + param + ` (${method})`\n        paramName += (index === methods.length - 1 ? '' : '\\n')\n      } else {\n        paramName = params[params.length - 1] + ` (${method})`\n      }\n    })\n  } else if (methods.length) {\n    paramName = ` (${methods.join('|')})`\n  }\n\n  var tree = `${prefix}${tail ? '└── ' : '├── '}${this.prefix}${paramName}\\n`\n\n  prefix = `${prefix}${tail ? '    ' : '│   '}`\n  const labels = Object.keys(this.children)\n  for (var i = 0; i < labels.length - 1; i++) {\n    tree += this.children[labels[i]].prettyPrint(prefix, false)\n  }\n  if (labels.length > 0) {\n    tree += this.children[labels[labels.length - 1]].prettyPrint(prefix, true)\n  }\n  return tree\n}\n\nfunction buildHandlers (handlers) {\n  var code = `handlers = handlers || {}\n  `\n  for (var i = 0; i < http.METHODS.length; i++) {\n    var m = http.METHODS[i]\n    code += `this['${m}'] = handlers['${m}'] || null\n    `\n  }\n  return new Function('handlers', code) // eslint-disable-line\n}\n\nmodule.exports = Node\nmodule.exports.Handlers = Handlers\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 16893,
		"nlink": 6,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 697355,
		"size": 4096,
		"blocks": 8,
		"atimeMs": 1551819275993.1638,
		"mtimeMs": 1551819277233.1865,
		"ctimeMs": 1551819277233.1865,
		"birthtimeMs": 1551819277233.1865,
		"atime": "2019-03-05T20:54:35.993Z",
		"mtime": "2019-03-05T20:54:37.233Z",
		"ctime": "2019-03-05T20:54:37.233Z",
		"birthtime": "2019-03-05T20:54:37.233Z",
		"isdirectory": true
	},
	"filename": "node_modules"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 697361,
		"size": 4096,
		"blocks": 8,
		"atimeMs": 1551819276125.1663,
		"mtimeMs": 1551819276125.1663,
		"ctimeMs": 1551819276125.1663,
		"birthtimeMs": 1551819276125.1663,
		"atime": "2019-03-05T20:54:36.125Z",
		"mtime": "2019-03-05T20:54:36.125Z",
		"ctime": "2019-03-05T20:54:36.125Z",
		"birthtime": "2019-03-05T20:54:36.125Z",
		"isdirectory": true
	},
	"filename": "node_modules/fast-decode-uri-component"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696212,
		"size": 941,
		"blocks": 8,
		"atimeMs": 1551819276131,
		"mtimeMs": 1521393769000,
		"ctimeMs": 1551819276125.1663,
		"birthtimeMs": 1551819276125.1663,
		"atime": "2019-03-05T20:54:36.131Z",
		"mtime": "2018-03-18T17:22:49.000Z",
		"ctime": "2019-03-05T20:54:36.125Z",
		"birthtime": "2019-03-05T20:54:36.125Z",
		"isfile": true
	},
	"filename": "node_modules/fast-decode-uri-component/bench.js",
	"content": "'use strict'\n\nconst bench = require('nanobench')\nconst fastDecode = require('./index')\n\nconst uri = [\n  'test', 'a+b+c+d', '=a', '%25', '%%25%%', 'st%C3%A5le', 'st%C3%A5le%', '%st%C3%A5le%', '%%7Bst%C3%A5le%7D%',\n  '%ab%C3%A5le%', '%C3%A5%able%', '%7B%ab%7C%de%7D', '%7B%ab%%7C%de%%7D', '%7 B%ab%%7C%de%%7 D', '%61+%4d%4D',\n  '\\uFEFFtest', '\\uFEFF', '%EF%BB%BFtest', '%EF%BB%BF', '†', '%C2%B5', '%C2%B5%', '%%C2%B5%', '%ab', '%ab%ab%ab',\n  '%', '%E0%A4%A', '/test/hel%\"Flo', '/test/hel%2Flo'\n]\n\nconst uriLen = uri.length\n\nbench('fast-decode-uri-component', b => {\n  b.start()\n  for (var round = 0; round < 100000; round++) {\n    for (var i = 0; i < uriLen; i++) {\n      fastDecode(uri[i])\n    }\n  }\n  b.end()\n})\n\nbench('decodeURIComponent', b => {\n  b.start()\n  for (var round = 0; round < 100000; round++) {\n    for (var i = 0; i < uriLen; i++) {\n      try {\n        decodeURIComponent(uri[i])\n      } catch (e) {}\n    }\n  }\n  b.end()\n})\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696213,
		"size": 3227,
		"blocks": 8,
		"atimeMs": 1551819276131,
		"mtimeMs": 1521455159000,
		"ctimeMs": 1551819276125.1663,
		"birthtimeMs": 1551819276125.1663,
		"atime": "2019-03-05T20:54:36.131Z",
		"mtime": "2018-03-19T10:25:59.000Z",
		"ctime": "2019-03-05T20:54:36.125Z",
		"birthtime": "2019-03-05T20:54:36.125Z",
		"isfile": true
	},
	"filename": "node_modules/fast-decode-uri-component/index.js",
	"content": "'use strict'\n\nconst UTF8_ACCEPT = 12\nconst UTF8_REJECT = 0\nconst UTF8_DATA = [\n  // The first part of the table maps bytes to character to a transition.\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,\n  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,\n  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,\n  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,\n  4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,\n  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,\n  6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,\n  10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,\n\n  // The second part of the table maps a state to a new state when adding a\n  // transition.\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96,\n  0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,\n  0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n\n  // The third part maps the current transition to a mask that needs to apply\n  // to the byte.\n  0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07\n]\n\nfunction decodeURIComponent (uri) {\n  var percentPosition = uri.indexOf('%')\n  if (percentPosition === -1) return uri\n\n  var length = uri.length\n  var decoded = ''\n  var last = 0\n  var codepoint = 0\n  var startOfOctets = percentPosition\n  var state = UTF8_ACCEPT\n\n  while (percentPosition > -1 && percentPosition < length) {\n    var high = hexCodeToInt(uri[percentPosition + 1], 4)\n    var low = hexCodeToInt(uri[percentPosition + 2], 0)\n    var byte = high | low\n    var type = UTF8_DATA[byte]\n    state = UTF8_DATA[256 + state + type]\n    codepoint = (codepoint << 6) | (byte & UTF8_DATA[364 + type])\n\n    if (state === UTF8_ACCEPT) {\n      decoded += uri.slice(last, startOfOctets)\n\n      decoded += (codepoint <= 0xFFFF)\n        ? String.fromCharCode(codepoint)\n        : String.fromCharCode(\n          (0xD7C0 + (codepoint >> 10)),\n          (0xDC00 + (codepoint & 0x3FF))\n        )\n\n      codepoint = 0\n      last = percentPosition + 3\n      percentPosition = startOfOctets = uri.indexOf('%', last)\n    } else if (state === UTF8_REJECT) {\n      return null\n    } else {\n      percentPosition += 3\n      if (percentPosition < length && uri.charCodeAt(percentPosition) === 37) continue\n      return null\n    }\n  }\n\n  return decoded + uri.slice(last)\n}\n\nconst HEX = {\n  '0': 0,\n  '1': 1,\n  '2': 2,\n  '3': 3,\n  '4': 4,\n  '5': 5,\n  '6': 6,\n  '7': 7,\n  '8': 8,\n  '9': 9,\n  'a': 10,\n  'A': 10,\n  'b': 11,\n  'B': 11,\n  'c': 12,\n  'C': 12,\n  'd': 13,\n  'D': 13,\n  'e': 14,\n  'E': 14,\n  'f': 15,\n  'F': 15\n}\n\nfunction hexCodeToInt (c, shift) {\n  var i = HEX[c]\n  return i === undefined ? 255 : i << shift\n}\n\nmodule.exports = decodeURIComponent\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696210,
		"size": 818,
		"blocks": 8,
		"atimeMs": 1551819276130,
		"mtimeMs": 1521394295000,
		"ctimeMs": 1551819276125.1663,
		"birthtimeMs": 1551819276125.1663,
		"atime": "2019-03-05T20:54:36.130Z",
		"mtime": "2018-03-18T17:31:35.000Z",
		"ctime": "2019-03-05T20:54:36.125Z",
		"birthtime": "2019-03-05T20:54:36.125Z",
		"isfile": true
	},
	"filename": "node_modules/fast-decode-uri-component/package.json",
	"content": "{\n  \"name\": \"fast-decode-uri-component\",\n  \"version\": \"1.0.0\",\n  \"description\": \"Fast and safe decodeURIComponent\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"test\": \"standard && tap test.js\",\n    \"bench\": \"node bench.js\"\n  },\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/delvedor/fast-decode-uri-component.git\"\n  },\n  \"keywords\": [\n    \"decode\",\n    \"uri\",\n    \"component\",\n    \"fast\",\n    \"safe\"\n  ],\n  \"author\": \"Tomas Della Vedova - @delvedor (http://delved.org)\",\n  \"license\": \"MIT\",\n  \"bugs\": {\n    \"url\": \"https://github.com/delvedor/fast-decode-uri-component/issues\"\n  },\n  \"homepage\": \"https://github.com/delvedor/fast-decode-uri-component#readme\",\n  \"devDependencies\": {\n    \"nanobench\": \"^2.1.1\",\n    \"randomstring\": \"^1.1.5\",\n    \"standard\": \"^11.0.1\",\n    \"tap\": \"^11.1.2\"\n  }\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696216,
		"size": 1007,
		"blocks": 8,
		"atimeMs": 1551819276131,
		"mtimeMs": 1521452799000,
		"ctimeMs": 1551819276125.1663,
		"birthtimeMs": 1551819276125.1663,
		"atime": "2019-03-05T20:54:36.131Z",
		"mtime": "2018-03-19T09:46:39.000Z",
		"ctime": "2019-03-05T20:54:36.125Z",
		"birthtime": "2019-03-05T20:54:36.125Z",
		"isfile": true
	},
	"filename": "node_modules/fast-decode-uri-component/test.js",
	"content": "'use strict'\n\nconst { test } = require('tap')\nconst randomstring = require('randomstring')\nconst fastDecode = require('./index')\n\nconst charset = 'abcdef_ghilmn%opqrstu-vzxywjk%ABCDEF_HGILMN%OPQRSTU-VZXYWJK%0123456789.-_~%'\n\ntest('Basic', t => {\n  // base test\n  const uri = [\n    'test', 'a+b+c+d', '=a', '%25', '%%25%%', 'st%C3%A5le', 'st%C3%A5le%', '%st%C3%A5le%', '%%7Bst%C3%A5le%7D%',\n    '%ab%C3%A5le%', '%C3%A5%able%', '%7B%ab%7C%de%7D', '%7B%ab%%7C%de%%7D', '%7 B%ab%%7C%de%%7 D', '%61+%4d%4D',\n    '\\uFEFFtest', '\\uFEFF', '%EF%BB%BFtest', '%EF%BB%BF', '†', '%C2%B5', '%C2%B5%', '%%C2%B5%', '%ab', '%ab%ab%ab',\n    '%', '%2', '%E0%A4%A', '/test/hel%\"Flo', '/test/hel%2Flo'\n  ]\n\n  // random generated uri\n  for (var i = 0; i < 20000; i++) {\n    uri.push(randomstring.generate({ charset }))\n  }\n\n  for (i = 0; i < uri.length; i++) {\n    try {\n      t.strictEqual(decodeURIComponent(uri[i]), fastDecode(uri[i]))\n    } catch (e) {\n      t.strictEqual(fastDecode(uri[i]), null)\n    }\n  }\n\n  t.end()\n})\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 16893,
		"nlink": 3,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 697365,
		"size": 4096,
		"blocks": 8,
		"atimeMs": 1551819277101.184,
		"mtimeMs": 1551819277105.184,
		"ctimeMs": 1551819277105.184,
		"birthtimeMs": 1551819277105.184,
		"atime": "2019-03-05T20:54:37.101Z",
		"mtime": "2019-03-05T20:54:37.105Z",
		"ctime": "2019-03-05T20:54:37.105Z",
		"birthtime": "2019-03-05T20:54:37.105Z",
		"isdirectory": true
	},
	"filename": "node_modules/ret"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 697366,
		"size": 4096,
		"blocks": 8,
		"atimeMs": 1551819277105.184,
		"mtimeMs": 1551819277105.184,
		"ctimeMs": 1551819277105.184,
		"birthtimeMs": 1551819277105.184,
		"atime": "2019-03-05T20:54:37.105Z",
		"mtime": "2019-03-05T20:54:37.105Z",
		"ctime": "2019-03-05T20:54:37.105Z",
		"birthtime": "2019-03-05T20:54:37.105Z",
		"isdirectory": true
	},
	"filename": "node_modules/ret/lib"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696231,
		"size": 6514,
		"blocks": 16,
		"atimeMs": 1551819277109,
		"mtimeMs": 1509421994000,
		"ctimeMs": 1551819277105.184,
		"birthtimeMs": 1551819277105.184,
		"atime": "2019-03-05T20:54:37.109Z",
		"mtime": "2017-10-31T03:53:14.000Z",
		"ctime": "2019-03-05T20:54:37.105Z",
		"birthtime": "2019-03-05T20:54:37.105Z",
		"isfile": true
	},
	"filename": "node_modules/ret/lib/index.js",
	"content": "const util      = require('./util');\nconst types     = require('./types');\nconst sets      = require('./sets');\nconst positions = require('./positions');\n\n\nmodule.exports = (regexpStr) => {\n  var i = 0, l, c,\n    start = { type: types.ROOT, stack: []},\n\n    // Keep track of last clause/group and stack.\n    lastGroup = start,\n    last = start.stack,\n    groupStack = [];\n\n\n  var repeatErr = (i) => {\n    util.error(regexpStr, `Nothing to repeat at column ${i - 1}`);\n  };\n\n  // Decode a few escaped characters.\n  var str = util.strToChars(regexpStr);\n  l = str.length;\n\n  // Iterate through each character in string.\n  while (i < l) {\n    c = str[i++];\n\n    switch (c) {\n      // Handle escaped characters, inclues a few sets.\n      case '\\\\':\n        c = str[i++];\n\n        switch (c) {\n          case 'b':\n            last.push(positions.wordBoundary());\n            break;\n\n          case 'B':\n            last.push(positions.nonWordBoundary());\n            break;\n\n          case 'w':\n            last.push(sets.words());\n            break;\n\n          case 'W':\n            last.push(sets.notWords());\n            break;\n\n          case 'd':\n            last.push(sets.ints());\n            break;\n\n          case 'D':\n            last.push(sets.notInts());\n            break;\n\n          case 's':\n            last.push(sets.whitespace());\n            break;\n\n          case 'S':\n            last.push(sets.notWhitespace());\n            break;\n\n          default:\n            // Check if c is integer.\n            // In which case it's a reference.\n            if (/\\d/.test(c)) {\n              last.push({ type: types.REFERENCE, value: parseInt(c, 10) });\n\n            // Escaped character.\n            } else {\n              last.push({ type: types.CHAR, value: c.charCodeAt(0) });\n            }\n        }\n\n        break;\n\n\n      // Positionals.\n      case '^':\n        last.push(positions.begin());\n        break;\n\n      case '$':\n        last.push(positions.end());\n        break;\n\n\n      // Handle custom sets.\n      case '[':\n        // Check if this class is 'anti' i.e. [^abc].\n        var not;\n        if (str[i] === '^') {\n          not = true;\n          i++;\n        } else {\n          not = false;\n        }\n\n        // Get all the characters in class.\n        var classTokens = util.tokenizeClass(str.slice(i), regexpStr);\n\n        // Increase index by length of class.\n        i += classTokens[1];\n        last.push({\n          type: types.SET,\n          set: classTokens[0],\n          not,\n        });\n\n        break;\n\n\n      // Class of any character except \\n.\n      case '.':\n        last.push(sets.anyChar());\n        break;\n\n\n      // Push group onto stack.\n      case '(':\n        // Create group.\n        var group = {\n          type: types.GROUP,\n          stack: [],\n          remember: true,\n        };\n\n        c = str[i];\n\n        // If if this is a special kind of group.\n        if (c === '?') {\n          c = str[i + 1];\n          i += 2;\n\n          // Match if followed by.\n          if (c === '=') {\n            group.followedBy = true;\n\n          // Match if not followed by.\n          } else if (c === '!') {\n            group.notFollowedBy = true;\n\n          } else if (c !== ':') {\n            util.error(regexpStr,\n              `Invalid group, character '${c}'` +\n              ` after '?' at column ${i - 1}`);\n          }\n\n          group.remember = false;\n        }\n\n        // Insert subgroup into current group stack.\n        last.push(group);\n\n        // Remember the current group for when the group closes.\n        groupStack.push(lastGroup);\n\n        // Make this new group the current group.\n        lastGroup = group;\n        last = group.stack;\n        break;\n\n\n      // Pop group out of stack.\n      case ')':\n        if (groupStack.length === 0) {\n          util.error(regexpStr, `Unmatched ) at column ${i - 1}`);\n        }\n        lastGroup = groupStack.pop();\n\n        // Check if this group has a PIPE.\n        // To get back the correct last stack.\n        last = lastGroup.options ?\n          lastGroup.options[lastGroup.options.length - 1] : lastGroup.stack;\n        break;\n\n\n      // Use pipe character to give more choices.\n      case '|':\n        // Create array where options are if this is the first PIPE\n        // in this clause.\n        if (!lastGroup.options) {\n          lastGroup.options = [lastGroup.stack];\n          delete lastGroup.stack;\n        }\n\n        // Create a new stack and add to options for rest of clause.\n        var stack = [];\n        lastGroup.options.push(stack);\n        last = stack;\n        break;\n\n\n      // Repetition.\n      // For every repetition, remove last element from last stack\n      // then insert back a RANGE object.\n      // This design is chosen because there could be more than\n      // one repetition symbols in a regex i.e. `a?+{2,3}`.\n      case '{':\n        var rs = /^(\\d+)(,(\\d+)?)?\\}/.exec(str.slice(i)), min, max;\n        if (rs !== null) {\n          if (last.length === 0) {\n            repeatErr(i);\n          }\n          min = parseInt(rs[1], 10);\n          max = rs[2] ? rs[3] ? parseInt(rs[3], 10) : Infinity : min;\n          i += rs[0].length;\n\n          last.push({\n            type: types.REPETITION,\n            min,\n            max,\n            value: last.pop(),\n          });\n        } else {\n          last.push({\n            type: types.CHAR,\n            value: 123,\n          });\n        }\n        break;\n\n      case '?':\n        if (last.length === 0) {\n          repeatErr(i);\n        }\n        last.push({\n          type: types.REPETITION,\n          min: 0,\n          max: 1,\n          value: last.pop(),\n        });\n        break;\n\n      case '+':\n        if (last.length === 0) {\n          repeatErr(i);\n        }\n        last.push({\n          type: types.REPETITION,\n          min: 1,\n          max: Infinity,\n          value: last.pop(),\n        });\n        break;\n\n      case '*':\n        if (last.length === 0) {\n          repeatErr(i);\n        }\n        last.push({\n          type: types.REPETITION,\n          min: 0,\n          max: Infinity,\n          value: last.pop(),\n        });\n        break;\n\n\n      // Default is a character that is not `\\[](){}?+*^$`.\n      default:\n        last.push({\n          type: types.CHAR,\n          value: c.charCodeAt(0),\n        });\n    }\n\n  }\n\n  // Check if any groups have not been closed.\n  if (groupStack.length !== 0) {\n    util.error(regexpStr, 'Unterminated group');\n  }\n\n  return start;\n};\n\nmodule.exports.types = types;\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696232,
		"size": 297,
		"blocks": 8,
		"atimeMs": 1551819277109,
		"mtimeMs": 1509421994000,
		"ctimeMs": 1551819277105.184,
		"birthtimeMs": 1551819277105.184,
		"atime": "2019-03-05T20:54:37.109Z",
		"mtime": "2017-10-31T03:53:14.000Z",
		"ctime": "2019-03-05T20:54:37.105Z",
		"birthtime": "2019-03-05T20:54:37.105Z",
		"isfile": true
	},
	"filename": "node_modules/ret/lib/positions.js",
	"content": "const types = require('./types');\nexports.wordBoundary = () => ({ type: types.POSITION, value: 'b' });\nexports.nonWordBoundary = () => ({ type: types.POSITION, value: 'B' });\nexports.begin = () => ({ type: types.POSITION, value: '^' });\nexports.end = () => ({ type: types.POSITION, value: '$' });\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696233,
		"size": 1665,
		"blocks": 8,
		"atimeMs": 1551819277109,
		"mtimeMs": 1509502563000,
		"ctimeMs": 1551819277105.184,
		"birthtimeMs": 1551819277105.184,
		"atime": "2019-03-05T20:54:37.109Z",
		"mtime": "2017-11-01T02:16:03.000Z",
		"ctime": "2019-03-05T20:54:37.105Z",
		"birthtime": "2019-03-05T20:54:37.105Z",
		"isfile": true
	},
	"filename": "node_modules/ret/lib/sets.js",
	"content": "const types = require('./types');\n\nconst INTS = () => [{ type: types.RANGE , from: 48, to: 57 }];\n\nconst WORDS = () => {\n  return [\n    { type: types.CHAR, value: 95 },\n    { type: types.RANGE, from: 97, to: 122 },\n    { type: types.RANGE, from: 65, to: 90 }\n  ].concat(INTS());\n};\n\nconst WHITESPACE = () => {\n  return [\n    { type: types.CHAR, value: 9 },\n    { type: types.CHAR, value: 10 },\n    { type: types.CHAR, value: 11 },\n    { type: types.CHAR, value: 12 },\n    { type: types.CHAR, value: 13 },\n    { type: types.CHAR, value: 32 },\n    { type: types.CHAR, value: 160 },\n    { type: types.CHAR, value: 5760 },\n    { type: types.RANGE, from: 8192, to: 8202 },\n    { type: types.CHAR, value: 8232 },\n    { type: types.CHAR, value: 8233 },\n    { type: types.CHAR, value: 8239 },\n    { type: types.CHAR, value: 8287 },\n    { type: types.CHAR, value: 12288 },\n    { type: types.CHAR, value: 65279 }\n  ];\n};\n\nconst NOTANYCHAR = () => {\n  return [\n    { type: types.CHAR, value: 10 },\n    { type: types.CHAR, value: 13 },\n    { type: types.CHAR, value: 8232 },\n    { type: types.CHAR, value: 8233 },\n  ];\n};\n\n// Predefined class objects.\nexports.words = () => ({ type: types.SET, set: WORDS(), not: false });\nexports.notWords = () => ({ type: types.SET, set: WORDS(), not: true });\nexports.ints = () => ({ type: types.SET, set: INTS(), not: false });\nexports.notInts = () => ({ type: types.SET, set: INTS(), not: true });\nexports.whitespace = () => ({ type: types.SET, set: WHITESPACE(), not: false });\nexports.notWhitespace = () => ({ type: types.SET, set: WHITESPACE(), not: true });\nexports.anyChar = () => ({ type: types.SET, set: NOTANYCHAR(), not: true });\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696234,
		"size": 166,
		"blocks": 8,
		"atimeMs": 1551819277109,
		"mtimeMs": 1468733447000,
		"ctimeMs": 1551819277105.184,
		"birthtimeMs": 1551819277105.184,
		"atime": "2019-03-05T20:54:37.109Z",
		"mtime": "2016-07-17T05:30:47.000Z",
		"ctime": "2019-03-05T20:54:37.105Z",
		"birthtime": "2019-03-05T20:54:37.105Z",
		"isfile": true
	},
	"filename": "node_modules/ret/lib/types.js",
	"content": "module.exports = {\n  ROOT       : 0,\n  GROUP      : 1,\n  POSITION   : 2,\n  SET        : 3,\n  RANGE      : 4,\n  REPETITION : 5,\n  REFERENCE  : 6,\n  CHAR       : 7,\n};\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696235,
		"size": 2436,
		"blocks": 8,
		"atimeMs": 1551819277109,
		"mtimeMs": 1519358994000,
		"ctimeMs": 1551819277105.184,
		"birthtimeMs": 1551819277105.184,
		"atime": "2019-03-05T20:54:37.109Z",
		"mtime": "2018-02-23T04:09:54.000Z",
		"ctime": "2019-03-05T20:54:37.105Z",
		"birthtime": "2019-03-05T20:54:37.105Z",
		"isfile": true
	},
	"filename": "node_modules/ret/lib/util.js",
	"content": "const types = require('./types');\nconst sets  = require('./sets');\n\n\nconst CTRL = '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]^ ?';\nconst SLSH = { '0': 0, 't': 9, 'n': 10, 'v': 11, 'f': 12, 'r': 13 };\n\n/**\n * Finds character representations in str and convert all to\n * their respective characters\n *\n * @param {String} str\n * @return {String}\n */\nexports.strToChars = function(str) {\n  /* jshint maxlen: false */\n  var chars_regex = /(\\[\\\\b\\])|(\\\\)?\\\\(?:u([A-F0-9]{4})|x([A-F0-9]{2})|(0?[0-7]{2})|c([@A-Z[\\\\\\]^?])|([0tnvfr]))/g;\n  str = str.replace(chars_regex, function(s, b, lbs, a16, b16, c8, dctrl, eslsh) {\n    if (lbs) {\n      return s;\n    }\n\n    var code = b ? 8 :\n      a16   ? parseInt(a16, 16) :\n      b16   ? parseInt(b16, 16) :\n      c8    ? parseInt(c8,   8) :\n      dctrl ? CTRL.indexOf(dctrl) :\n      SLSH[eslsh];\n\n    var c = String.fromCharCode(code);\n\n    // Escape special regex characters.\n    if (/[[\\]{}^$.|?*+()]/.test(c)) {\n      c = '\\\\' + c;\n    }\n\n    return c;\n  });\n\n  return str;\n};\n\n\n/**\n * turns class into tokens\n * reads str until it encounters a ] not preceeded by a \\\n *\n * @param {String} str\n * @param {String} regexpStr\n * @return {Array.<Array.<Object>, Number>}\n */\nexports.tokenizeClass = (str, regexpStr) => {\n  /* jshint maxlen: false */\n  var tokens = [];\n  var regexp = /\\\\(?:(w)|(d)|(s)|(W)|(D)|(S))|((?:(?:\\\\)(.)|([^\\]\\\\]))-(?:\\\\)?([^\\]]))|(\\])|(?:\\\\)?([^])/g;\n  var rs, c;\n\n\n  while ((rs = regexp.exec(str)) != null) {\n    if (rs[1]) {\n      tokens.push(sets.words());\n\n    } else if (rs[2]) {\n      tokens.push(sets.ints());\n\n    } else if (rs[3]) {\n      tokens.push(sets.whitespace());\n\n    } else if (rs[4]) {\n      tokens.push(sets.notWords());\n\n    } else if (rs[5]) {\n      tokens.push(sets.notInts());\n\n    } else if (rs[6]) {\n      tokens.push(sets.notWhitespace());\n\n    } else if (rs[7]) {\n      tokens.push({\n        type: types.RANGE,\n        from: (rs[8] || rs[9]).charCodeAt(0),\n        to: rs[10].charCodeAt(0),\n      });\n\n    } else if ((c = rs[12])) {\n      tokens.push({\n        type: types.CHAR,\n        value: c.charCodeAt(0),\n      });\n\n    } else {\n      return [tokens, regexp.lastIndex];\n    }\n  }\n\n  exports.error(regexpStr, 'Unterminated character class');\n};\n\n\n/**\n * Shortcut to throw errors.\n *\n * @param {String} regexp\n * @param {String} msg\n */\nexports.error = (regexp, msg) => {\n  throw new SyntaxError('Invalid regular expression: /' + regexp + '/: ' + msg);\n};\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696228,
		"size": 668,
		"blocks": 8,
		"atimeMs": 1551819277108,
		"mtimeMs": 1519359062000,
		"ctimeMs": 1551819277105.184,
		"birthtimeMs": 1551819277105.184,
		"atime": "2019-03-05T20:54:37.108Z",
		"mtime": "2018-02-23T04:11:02.000Z",
		"ctime": "2019-03-05T20:54:37.105Z",
		"birthtime": "2019-03-05T20:54:37.105Z",
		"isfile": true
	},
	"filename": "node_modules/ret/package.json",
	"content": "{\n  \"name\": \"ret\",\n  \"description\": \"Tokenizes a string that represents a regular expression.\",\n  \"keywords\": [\n    \"regex\",\n    \"regexp\",\n    \"regular expression\",\n    \"parser\",\n    \"tokenizer\"\n  ],\n  \"version\": \"0.2.2\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git://github.com/fent/ret.js.git\"\n  },\n  \"author\": \"fent (https://github.com/fent)\",\n  \"main\": \"./lib/index.js\",\n  \"files\": [\n    \"lib\"\n  ],\n  \"scripts\": {\n    \"test\": \"istanbul cover vows -- --spec test/*-test.js\"\n  },\n  \"directories\": {\n    \"lib\": \"./lib\"\n  },\n  \"devDependencies\": {\n    \"istanbul\": \"^0.4.5\",\n    \"vows\": \"^0.8.1\"\n  },\n  \"engines\": {\n    \"node\": \">=4\"\n  },\n  \"license\": \"MIT\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 16893,
		"nlink": 4,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 697362,
		"size": 4096,
		"blocks": 8,
		"atimeMs": 1551819276917.1807,
		"mtimeMs": 1551819276925.181,
		"ctimeMs": 1551819276925.181,
		"birthtimeMs": 1551819276925.181,
		"atime": "2019-03-05T20:54:36.917Z",
		"mtime": "2019-03-05T20:54:36.925Z",
		"ctime": "2019-03-05T20:54:36.925Z",
		"birthtime": "2019-03-05T20:54:36.925Z",
		"isdirectory": true
	},
	"filename": "node_modules/safe-regex2"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 697363,
		"size": 4096,
		"blocks": 8,
		"atimeMs": 1551819276925.181,
		"mtimeMs": 1551819276925.181,
		"ctimeMs": 1551819276925.181,
		"birthtimeMs": 1551819276925.181,
		"atime": "2019-03-05T20:54:36.925Z",
		"mtime": "2019-03-05T20:54:36.925Z",
		"ctime": "2019-03-05T20:54:36.925Z",
		"birthtime": "2019-03-05T20:54:36.925Z",
		"isdirectory": true
	},
	"filename": "node_modules/safe-regex2/example"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696224,
		"size": 95,
		"blocks": 8,
		"atimeMs": 1551819276929,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819276925.181,
		"birthtimeMs": 1551819276925.181,
		"atime": "2019-03-05T20:54:36.929Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:36.925Z",
		"birthtime": "2019-03-05T20:54:36.925Z",
		"isfile": true
	},
	"filename": "node_modules/safe-regex2/example/safe.js",
	"content": "var safe = require('../')\nvar regex = process.argv.slice(2).join(' ')\nconsole.log(safe(regex))\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696221,
		"size": 1086,
		"blocks": 8,
		"atimeMs": 1551819276927,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819276921.1807,
		"birthtimeMs": 1551819276921.1807,
		"atime": "2019-03-05T20:54:36.927Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:36.921Z",
		"birthtime": "2019-03-05T20:54:36.921Z",
		"isfile": true
	},
	"filename": "node_modules/safe-regex2/index.js",
	"content": "'use strict'\n\nvar parse = require('ret')\nvar types = parse.types\n\nmodule.exports = function (re, opts) {\n  if (!opts) opts = {}\n  var replimit = opts.limit === undefined ? 25 : opts.limit\n\n  if (isRegExp(re)) re = re.source\n  else if (typeof re !== 'string') re = String(re)\n\n  try { re = parse(re) } catch (err) { return false }\n\n  var reps = 0\n  return (function walk (node, starHeight) {\n    var i\n    var ok\n    var len\n\n    if (node.type === types.REPETITION) {\n      starHeight++\n      reps++\n      if (starHeight > 1) return false\n      if (reps > replimit) return false\n    }\n\n    if (node.options) {\n      for (i = 0, len = node.options.length; i < len; i++) {\n        ok = walk({ stack: node.options[i] }, starHeight)\n        if (!ok) return false\n      }\n    }\n    var stack = node.stack || (node.value && node.value.stack)\n    if (!stack) return true\n\n    for (i = 0; i < stack.length; i++) {\n      ok = walk(stack[i], starHeight)\n      if (!ok) return false\n    }\n\n    return true\n  })(re, 0)\n}\n\nfunction isRegExp (x) {\n  return {}.toString.call(x) === '[object RegExp]'\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696219,
		"size": 798,
		"blocks": 8,
		"atimeMs": 1551819276927,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819276921.1807,
		"birthtimeMs": 1551819276921.1807,
		"atime": "2019-03-05T20:54:36.927Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:36.921Z",
		"birthtime": "2019-03-05T20:54:36.921Z",
		"isfile": true
	},
	"filename": "node_modules/safe-regex2/package.json",
	"content": "{\n  \"name\": \"safe-regex2\",\n  \"version\": \"2.0.0\",\n  \"description\": \"detect possibly catastrophic, exponential-time regular expressions\",\n  \"main\": \"index.js\",\n  \"dependencies\": {\n    \"ret\": \"~0.2.0\"\n  },\n  \"devDependencies\": {\n    \"standard\": \"^12.0.1\",\n    \"tape\": \"^4.0.0\"\n  },\n  \"scripts\": {\n    \"test\": \"standard && tape test/*.js\"\n  },\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git://github.com/fastify/safe-regex.git\"\n  },\n  \"homepage\": \"https://github.com/fastify/safe-regex\",\n  \"keywords\": [\n    \"catastrophic\",\n    \"exponential\",\n    \"regex\",\n    \"safe\",\n    \"sandbox\"\n  ],\n  \"author\": {\n    \"name\": \"James Halliday\",\n    \"email\": \"mail@substack.net\",\n    \"url\": \"http://substack.net\"\n  },\n  \"contributors\": [\n    \"Matteo Collina <hello@matteocollina.com>\"\n  ],\n  \"license\": \"MIT\"\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696223,
		"size": 1403,
		"blocks": 8,
		"atimeMs": 1551819276928,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819276925.181,
		"birthtimeMs": 1551819276925.181,
		"atime": "2019-03-05T20:54:36.928Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:36.925Z",
		"birthtime": "2019-03-05T20:54:36.925Z",
		"isfile": true
	},
	"filename": "node_modules/safe-regex2/readme.markdown",
	"content": "# safe-regex2\n\n[![Build Status](https://travis-ci.com/fastify/safe-regex.svg?branch=master)](https://travis-ci.com/fastify/safe-regex)\n\ndetect potentially\n[catastrophic](http://regular-expressions.mobi/catastrophic.html)\n[exponential-time](http://perlgeek.de/blog-en/perl-tips/in-search-of-an-exponetial-regexp.html)\nregular expressions by limiting the\n[star height](https://en.wikipedia.org/wiki/Star_height) to 1\n\nThis is a fork of https://github.com/substack/safe-regex at 1.1.0.\n\nWARNING: This module has both false positives and false negatives.\nIt is not meant as a full checker, but it detect basic cases.\n\n# example\n\n``` js\nvar safe = require('safe-regex2');\nvar regex = process.argv.slice(2).join(' ');\nconsole.log(safe(regex));\n```\n\n```\n$ node safe.js '(x+x+)+y'\nfalse\n$ node safe.js '(beep|boop)*'\ntrue\n$ node safe.js '(a+){10}'\nfalse\n$ node safe.js '\\blocation\\s*:[^:\\n]+\\b(Oakland|San Francisco)\\b'\ntrue\n```\n\n# methods\n\n``` js\nvar safe = require('safe-regex')\n```\n\n## var ok = safe(re, opts={})\n\nReturn a boolean `ok` whether or not the regex `re` is safe and not possibly\ncatastrophic.\n\n`re` can be a `RegExp` object or just a string.\n\nIf the `re` is a string and is an invalid regex, returns `false`.\n\n* `opts.limit` - maximum number of allowed repetitions in the entire regex.\nDefault: `25`.\n\n# install\n\nWith [npm](https://npmjs.org) do:\n\n```\nnpm install safe-regex2\n```\n\n# license\n\nMIT\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 16893,
		"nlink": 2,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 697367,
		"size": 4096,
		"blocks": 8,
		"atimeMs": 1551819277233.1865,
		"mtimeMs": 1551819277233.1865,
		"ctimeMs": 1551819277233.1865,
		"birthtimeMs": 1551819277233.1865,
		"atime": "2019-03-05T20:54:37.233Z",
		"mtime": "2019-03-05T20:54:37.233Z",
		"ctime": "2019-03-05T20:54:37.233Z",
		"birthtime": "2019-03-05T20:54:37.233Z",
		"isdirectory": true
	},
	"filename": "node_modules/semver-store"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696240,
		"size": 1356,
		"blocks": 8,
		"atimeMs": 1551819277238,
		"mtimeMs": 1530564246000,
		"ctimeMs": 1551819277233.1865,
		"birthtimeMs": 1551819277233.1865,
		"atime": "2019-03-05T20:54:37.238Z",
		"mtime": "2018-07-02T20:44:06.000Z",
		"ctime": "2019-03-05T20:54:37.233Z",
		"birthtime": "2019-03-05T20:54:37.233Z",
		"isfile": true
	},
	"filename": "node_modules/semver-store/bench.js",
	"content": "'use strict'\n\nconst Benchmark = require('benchmark')\nconst suite = Benchmark.Suite()\n\nconst SemVerStore = require('./index')\nconst store1 = SemVerStore()\nconst store2 = SemVerStore()\n\nstore2\n  .set('1.1.1', 1)\n  .set('1.1.2', 1)\n  .set('1.1.3', 1)\n  .set('1.2.1', 1)\n  .set('1.2.2', 1)\n  .set('1.2.3', 1)\n  .set('2.1.1', 1)\n  .set('2.1.2', 1)\n  .set('2.1.3', 1)\n  .set('3.2.1', 1)\n  .set('3.2.2', 1)\n  .set('3.2.3', 1)\n\nsuite\n  .add('set', function () {\n    store1.set('1.2.3', 1)\n  })\n  .add('get', function () {\n    store1.get('1.2.3')\n  })\n  .add('get (wildcard)', function () {\n    store1.get('*')\n  })\n  .add('get (minor wildcard)', function () {\n    store1.get('1.x')\n  })\n  .add('get (patch wildcard)', function () {\n    store1.get('1.2.x')\n  })\n  .add('del + set', function () {\n    store1.del('1.2.3')\n    store1.set('1.2.3', 1)\n  })\n  .add('del (minor wildcard) + set', function () {\n    store1.del('1.x')\n    store1.set('1.2.3', 1)\n  })\n  .add('del (patch wildcard) + set', function () {\n    store1.del('1.2.x')\n    store1.set('1.2.3', 1)\n  })\n  .add('set with other keys already present', function () {\n    store2.set('1.2.4', 1)\n  })\n  .add('get with other keys already present', function () {\n    store2.get('1.2.4')\n  })\n  .on('cycle', function (event) {\n    console.log(String(event.target))\n  })\n  .on('complete', function () {})\n  .run()\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696241,
		"size": 4423,
		"blocks": 16,
		"atimeMs": 1551819277238,
		"mtimeMs": 1530564246000,
		"ctimeMs": 1551819277233.1865,
		"birthtimeMs": 1551819277233.1865,
		"atime": "2019-03-05T20:54:37.238Z",
		"mtime": "2018-07-02T20:44:06.000Z",
		"ctime": "2019-03-05T20:54:37.233Z",
		"birthtime": "2019-03-05T20:54:37.233Z",
		"isfile": true
	},
	"filename": "node_modules/semver-store/index.js",
	"content": "'use strict'\n\nfunction SemVerStore () {\n  if (!(this instanceof SemVerStore)) {\n    return new SemVerStore()\n  }\n  this.tree = new Node()\n}\n\nSemVerStore.prototype.set = function (version, store) {\n  if (typeof version !== 'string') {\n    throw new TypeError('Version should be a string')\n  }\n  var currentNode = this.tree\n  version = version.split('.')\n  while (version.length) {\n    currentNode = currentNode.addChild(\n      new Node(version.shift())\n    )\n  }\n  currentNode.setStore(store)\n  return this\n}\n\nSemVerStore.prototype.get = function (version) {\n  if (typeof version !== 'string') return null\n  if (version === '*') version = 'x.x.x'\n  var node = this.tree\n  var firstDot = version.indexOf('.')\n  var secondDot = version.indexOf('.', firstDot + 1)\n  var major = version.slice(0, firstDot)\n  var minor = secondDot === -1\n    ? version.slice(firstDot + 1)\n    : version.slice(firstDot + 1, secondDot)\n  var patch = secondDot === -1\n    ? 'x'\n    : version.slice(secondDot + 1)\n\n  node = node.getChild(major)\n  if (node === null) return null\n  node = node.getChild(minor)\n  if (node === null) return null\n  node = node.getChild(patch)\n  if (node === null) return null\n  return node.store\n}\n\nSemVerStore.prototype.del = function (version) {\n  if (typeof version !== 'string') {\n    throw new TypeError('Version should be a string')\n  }\n  var firstDot = version.indexOf('.')\n  var secondDot = version.indexOf('.', firstDot + 1)\n  var major = version.slice(0, firstDot)\n  var minor = secondDot === -1\n    ? version.slice(firstDot + 1)\n    : version.slice(firstDot + 1, secondDot)\n  var patch = secondDot === -1\n    ? 'x'\n    : version.slice(secondDot + 1)\n\n  // check existence of major node\n  var majorNode = this.tree.children[major]\n  if (majorNode == null) return this\n\n  // if minor is the wildcard, then remove the full major node\n  if (minor === 'x') {\n    this.tree.removeChild(major)\n    return this\n  }\n\n  // check existence of minor node\n  var minorNode = majorNode.children[minor]\n  if (minorNode == null) return this\n\n  // if patch is the wildcard, then remove the full minor node\n  // and also the major if there are no more children\n  if (patch === 'x') {\n    this.tree.children[major].removeChild(minor)\n    if (this.tree.children[major].length === 0) {\n      this.tree.removeChild(major)\n    }\n    return this\n  }\n\n  // check existence of patch node\n  var patchNode = minorNode.children[patch]\n  if (patchNode == null) return this\n\n  // Specific delete\n  this.tree\n    .children[major]\n    .children[minor]\n    .removeChild(patch)\n\n  // check if the minor node has no more children, if so removes it\n  // same for the major node\n  if (this.tree.children[major].children[minor].length === 0) {\n    this.tree.children[major].removeChild(minor)\n    if (this.tree.children[major].length === 0) {\n      this.tree.removeChild(major)\n    }\n  }\n\n  return this\n}\n\nSemVerStore.prototype.empty = function () {\n  this.tree = new Node()\n  return this\n}\n\nfunction getMax (arr) {\n  var l = arr.length\n  var max = arr[0]\n  for (var i = 1; i < l; i++) {\n    if (arr[i] > max) {\n      max = arr[i]\n    }\n  }\n  return max\n}\n\nfunction Node (prefix, children, store) {\n  this.prefix = Number(prefix) || 0\n  this.children = children || null\n  this.childrenPrefixes = children ? Object.keys(children) : []\n  this.store = store || null\n}\n\nNode.prototype.getChild = function (prefix) {\n  if (this.children === null) return null\n  if (prefix === 'x') {\n    var max = getMax(this.childrenPrefixes)\n    return this.children[max]\n  }\n  return this.children[prefix] || null\n}\n\nNode.prototype.addChild = function (node) {\n  this.children = this.children || {}\n  var child = this.getChild(node.prefix)\n  if (child === null) {\n    this.children[node.prefix] = node\n    this.childrenPrefixes.push(node.prefix)\n  }\n  return child || node\n}\n\nNode.prototype.removeChild = function (prefix) {\n  if (prefix === 'x') {\n    this.children = null\n    this.childrenPrefixes = []\n    return this\n  }\n  if (this.children[prefix] !== undefined) {\n    prefix = Number(prefix)\n    delete this.children[prefix]\n    this.childrenPrefixes.splice(\n      this.childrenPrefixes.indexOf(prefix), 1\n    )\n  }\n  return this\n}\n\nNode.prototype.setStore = function (store) {\n  this.store = store\n  return this\n}\n\nObject.defineProperty(Node.prototype, 'length', {\n  get: function () {\n    return this.childrenPrefixes.length\n  }\n})\n\nmodule.exports = SemVerStore\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696238,
		"size": 711,
		"blocks": 8,
		"atimeMs": 1551819277237,
		"mtimeMs": 1530564258000,
		"ctimeMs": 1551819277233.1865,
		"birthtimeMs": 1551819277233.1865,
		"atime": "2019-03-05T20:54:37.237Z",
		"mtime": "2018-07-02T20:44:18.000Z",
		"ctime": "2019-03-05T20:54:37.233Z",
		"birthtime": "2019-03-05T20:54:37.233Z",
		"isfile": true
	},
	"filename": "node_modules/semver-store/package.json",
	"content": "{\n  \"name\": \"semver-store\",\n  \"version\": \"0.3.0\",\n  \"description\": \"An extremely fast semver based store\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"test\": \"standard && tap test.js\"\n  },\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/delvedor/semver-store.git\"\n  },\n  \"keywords\": [\n    \"semver\",\n    \"store\",\n    \"tree\"\n  ],\n  \"author\": \"Tomas Della Vedova - @delvedor (http://delved.org)\",\n  \"license\": \"MIT\",\n  \"bugs\": {\n    \"url\": \"https://github.com/delvedor/semver-store/issues\"\n  },\n  \"homepage\": \"https://github.com/delvedor/semver-store#readme\",\n  \"devDependencies\": {\n    \"benchmark\": \"^2.1.4\",\n    \"pre-commit\": \"^1.2.2\",\n    \"standard\": \"^11.0.1\",\n    \"tap\": \"^12.0.1\"\n  }\n}\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696244,
		"size": 9516,
		"blocks": 24,
		"atimeMs": 1551819277238,
		"mtimeMs": 1530564246000,
		"ctimeMs": 1551819277233.1865,
		"birthtimeMs": 1551819277233.1865,
		"atime": "2019-03-05T20:54:37.238Z",
		"mtime": "2018-07-02T20:44:06.000Z",
		"ctime": "2019-03-05T20:54:37.233Z",
		"birthtime": "2019-03-05T20:54:37.233Z",
		"isfile": true
	},
	"filename": "node_modules/semver-store/test.js",
	"content": "'use strict'\n\nconst { test } = require('tap')\nconst SemVerStore = require('./index')\n\ntest('Should create a store', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.deepEqual(store.tree, {\n    prefix: 0,\n    store: null,\n    childrenPrefixes: [1],\n    children: {\n      1: {\n        prefix: 1,\n        store: null,\n        childrenPrefixes: [2, 3],\n        children: {\n          2: {\n            prefix: 2,\n            store: null,\n            childrenPrefixes: [3, 4],\n            children: {\n              3: {\n                prefix: 3,\n                store: 1,\n                childrenPrefixes: [],\n                children: null\n              },\n              4: {\n                prefix: 4,\n                store: 2,\n                childrenPrefixes: [],\n                children: null\n              }\n            }\n          },\n          3: {\n            prefix: 3,\n            store: null,\n            childrenPrefixes: [0],\n            children: {\n              0: {\n                prefix: 0,\n                store: 3,\n                childrenPrefixes: [],\n                children: null\n              }\n            }\n          }\n        }\n      }\n    }\n  })\n})\n\ntest('Should get the leaf', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.strictEqual(store.get('1.2.4'), 2)\n})\n\ntest('Should get the leaf (wildcard) / 1', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.strictEqual(store.get('1.2.x'), 2)\n})\n\ntest('Should get the leaf (wildcard) / 2', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.strictEqual(store.get('1.x'), 3)\n})\n\ntest('Should get the leaf (wildcard) / 3', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.strictEqual(store.get('2.2.x'), null)\n})\n\ntest('Should get the leaf (wildcard) / 4', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.strictEqual(store.get('2.x'), null)\n})\n\ntest('Should get the leaf (wildcard) / 5', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.0.0', 1)\n    .set('1.0.1', 2)\n    .set('1.0.2', 3)\n\n  t.strictEqual(store.get('*'), 3)\n})\n\ntest('Should get the leaf (wildcard) / 6', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.0.0', 1)\n    .set('1.1.0', 2)\n    .set('1.0.2', 3)\n\n  t.strictEqual(store.get('*'), 2)\n})\n\ntest('Should get the leaf (wildcard) / 7', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('2.0.0', 1)\n    .set('1.1.0', 2)\n    .set('2.0.2', 3)\n\n  t.strictEqual(store.get('*'), 3)\n})\n\ntest('Missing patch', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.strictEqual(store.get('1.2'), 2)\n})\n\ntest('Should get the leaf - 404', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.strictEqual(store.get('1.2.5'), null)\n})\n\ntest('Should get the leaf (bad formatted semver) / 1', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.strictEqual(store.get('1.2.a'), null)\n})\n\ntest('Should get the leaf (bad formatted semver) / 2', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n    .set('1.3.0', 3)\n\n  t.strictEqual(store.get('1.a'), null)\n})\n\ntest('Big numbers', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.22.34', 1)\n    .set('2.32.456', 2)\n    .set('345.432.34', 3)\n    .set('343.432.36', 4)\n    .set('343.432.342', 5)\n    .set('343.435.367', 6)\n    .set('342.435.34', 7)\n    .set('341.432.34', 8)\n\n  t.strictEqual(store.get('343.x'), 6)\n})\n\ntest('Delete a version / 1', t => {\n  t.plan(4)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n\n  t.strictEqual(store.get('1.2.3'), 1)\n  t.strictEqual(store.get('1.2.4'), 2)\n\n  store.del('1.2.3')\n\n  t.strictEqual(store.get('1.2.3'), null)\n  t.strictEqual(store.get('1.2.4'), 2)\n})\n\ntest('Delete a version / 2', t => {\n  t.plan(2)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.2.4', 2)\n\n  t.deepEqual(store.tree, {\n    prefix: 0,\n    store: null,\n    childrenPrefixes: [1],\n    children: {\n      1: {\n        prefix: 1,\n        store: null,\n        childrenPrefixes: [2],\n        children: {\n          2: {\n            prefix: 2,\n            store: null,\n            childrenPrefixes: [3, 4],\n            children: {\n              3: {\n                prefix: 3,\n                store: 1,\n                childrenPrefixes: [],\n                children: null\n              },\n              4: {\n                prefix: 4,\n                store: 2,\n                childrenPrefixes: [],\n                children: null\n              }\n            }\n          }\n        }\n      }\n    }\n  })\n\n  store.del('1.2.3')\n\n  t.deepEqual(store.tree, {\n    prefix: 0,\n    store: null,\n    childrenPrefixes: [1],\n    children: {\n      1: {\n        prefix: 1,\n        store: null,\n        childrenPrefixes: [2],\n        children: {\n          2: {\n            prefix: 2,\n            store: null,\n            childrenPrefixes: [4],\n            children: {\n              4: {\n                prefix: 4,\n                store: 2,\n                childrenPrefixes: [],\n                children: null\n              }\n            }\n          }\n        }\n      }\n    }\n  })\n})\n\ntest('Delete a version / 3', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .del('1.2.3')\n\n  t.deepEqual(store.tree, {\n    prefix: 0,\n    store: null,\n    childrenPrefixes: [],\n    children: {}\n  })\n})\n\ntest('Delete a version / 4', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('2.2.3', 2)\n    .del('1.2.3')\n\n  t.deepEqual(store.tree, {\n    prefix: 0,\n    store: null,\n    childrenPrefixes: [2],\n    children: {\n      2: {\n        prefix: 2,\n        store: null,\n        childrenPrefixes: [2],\n        children: {\n          2: {\n            prefix: 2,\n            store: null,\n            childrenPrefixes: [3],\n            children: {\n              3: {\n                prefix: 3,\n                store: 2,\n                childrenPrefixes: [],\n                children: null\n              }\n            }\n          }\n        }\n      }\n    }\n  })\n})\n\ntest('Delete a version / 5', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.3.3', 2)\n    .set('2.2.3', 3)\n    .del('1.2.x')\n\n  t.deepEqual(store.tree, {\n    prefix: 0,\n    store: null,\n    childrenPrefixes: [1, 2],\n    children: {\n      1: {\n        prefix: 1,\n        store: null,\n        childrenPrefixes: [3],\n        children: {\n          3: {\n            prefix: 3,\n            store: null,\n            childrenPrefixes: [3],\n            children: {\n              3: {\n                prefix: 3,\n                store: 2,\n                childrenPrefixes: [],\n                children: null\n              }\n            }\n          }\n        }\n      },\n      2: {\n        prefix: 2,\n        store: null,\n        childrenPrefixes: [2],\n        children: {\n          2: {\n            prefix: 2,\n            store: null,\n            childrenPrefixes: [3],\n            children: {\n              3: {\n                prefix: 3,\n                store: 3,\n                childrenPrefixes: [],\n                children: null\n              }\n            }\n          }\n        }\n      }\n    }\n  })\n})\n\ntest('Delete a version / 6', t => {\n  t.plan(2)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.3.3', 2)\n    .set('2.2.3', 3)\n    .del('1.x')\n\n  t.deepEqual(store.tree, {\n    prefix: 0,\n    store: null,\n    childrenPrefixes: [2],\n    children: {\n      2: {\n        prefix: 2,\n        store: null,\n        childrenPrefixes: [2],\n        children: {\n          2: {\n            prefix: 2,\n            store: null,\n            childrenPrefixes: [3],\n            children: {\n              3: {\n                prefix: 3,\n                store: 3,\n                childrenPrefixes: [],\n                children: null\n              }\n            }\n          }\n        }\n      }\n    }\n  })\n\n  store.del('2.x')\n\n  t.deepEqual(store.tree, {\n    prefix: 0,\n    store: null,\n    childrenPrefixes: [],\n    children: {}\n  })\n})\n\ntest('Empty store', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store\n    .set('1.2.3', 1)\n    .set('1.3.3', 2)\n    .set('2.2.3', 3)\n    .empty()\n\n  t.deepEqual(store.tree, {\n    prefix: 0,\n    store: null,\n    childrenPrefixes: [],\n    children: null\n  })\n})\n\ntest('get with bad type', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  store.set('1.2.3', 1)\n\n  t.strictEqual(store.get(5), null)\n})\n\ntest('set with bad type', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  try {\n    store.set(1, 1)\n    t.fail('Should fail')\n  } catch (err) {\n    t.is(err.message, 'Version should be a string')\n  }\n})\n\ntest('del with bad type', t => {\n  t.plan(1)\n\n  const store = SemVerStore()\n\n  try {\n    store.del(1)\n    t.fail('Should fail')\n  } catch (err) {\n    t.is(err.message, 'Version should be a string')\n  }\n})\n"
}})
	fileData.push(function(){return {
	"stat": {
		"dev": 64515,
		"mode": 33188,
		"nlink": 1,
		"uid": 1001,
		"gid": 1001,
		"rdev": 0,
		"blksize": 4096,
		"ino": 696168,
		"size": 1257,
		"blocks": 8,
		"atimeMs": 1551819275989,
		"mtimeMs": 499162500000,
		"ctimeMs": 1551819275985.1636,
		"birthtimeMs": 1551819275985.1636,
		"atime": "2019-03-05T20:54:35.989Z",
		"mtime": "1985-10-26T08:15:00.000Z",
		"ctime": "2019-03-05T20:54:35.985Z",
		"birthtime": "2019-03-05T20:54:35.985Z",
		"isfile": true
	},
	"filename": "package.json",
	"content": "{\n  \"name\": \"find-my-way\",\n  \"version\": \"2.0.1\",\n  \"description\": \"Crazy fast http radix based router\",\n  \"main\": \"index.js\",\n  \"typings\": \"index.d.ts\",\n  \"scripts\": {\n    \"bench\": \"node bench.js\",\n    \"test:typescript\": \"tsc --project ./test/types/tsconfig.json\",\n    \"test\": \"standard && tap -j4 test/*.test.js && npm run test:typescript\",\n    \"coveralls\": \"tap -j4 test/*.test.js --cov --coverage-report=text-lcov | coveralls;\"\n  },\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/delvedor/find-my-way.git\"\n  },\n  \"keywords\": [\n    \"http\",\n    \"router\",\n    \"radix\",\n    \"fast\",\n    \"speed\"\n  ],\n  \"engines\": {\n    \"node\": \">=6\"\n  },\n  \"author\": \"Tomas Della Vedova - @delvedor (http://delved.org)\",\n  \"license\": \"MIT\",\n  \"bugs\": {\n    \"url\": \"https://github.com/delvedor/find-my-way/issues\"\n  },\n  \"homepage\": \"https://github.com/delvedor/find-my-way#readme\",\n  \"devDependencies\": {\n    \"@types/node\": \"^11.9.4\",\n    \"benchmark\": \"^2.1.4\",\n    \"coveralls\": \"^3.0.2\",\n    \"pre-commit\": \"^1.2.2\",\n    \"request\": \"^2.88.0\",\n    \"standard\": \"^12.0.1\",\n    \"tap\": \"^12.5.3\",\n    \"typescript\": \"^3.3.3\"\n  },\n  \"dependencies\": {\n    \"fast-decode-uri-component\": \"^1.0.0\",\n    \"safe-regex2\": \"^2.0.0\",\n    \"semver-store\": \"^0.3.0\"\n  }\n}\n"
}})
	var filenames={
	"": 0,
	"bench.js": 1,
	"example.js": 2,
	"index.d.ts": 3,
	"index.js": 4,
	"lib": 5,
	"lib/accept-version.js": 6,
	"node.js": 7,
	"node_modules": 8,
	"node_modules/fast-decode-uri-component": 9,
	"node_modules/fast-decode-uri-component/bench.js": 10,
	"node_modules/fast-decode-uri-component/index.js": 11,
	"node_modules/fast-decode-uri-component/package.json": 12,
	"node_modules/fast-decode-uri-component/test.js": 13,
	"node_modules/ret": 14,
	"node_modules/ret/lib": 15,
	"node_modules/ret/lib/index.js": 16,
	"node_modules/ret/lib/positions.js": 17,
	"node_modules/ret/lib/sets.js": 18,
	"node_modules/ret/lib/types.js": 19,
	"node_modules/ret/lib/util.js": 20,
	"node_modules/ret/package.json": 21,
	"node_modules/safe-regex2": 22,
	"node_modules/safe-regex2/example": 23,
	"node_modules/safe-regex2/example/safe.js": 24,
	"node_modules/safe-regex2/index.js": 25,
	"node_modules/safe-regex2/package.json": 26,
	"node_modules/safe-regex2/readme.markdown": 27,
	"node_modules/semver-store": 28,
	"node_modules/semver-store/bench.js": 29,
	"node_modules/semver-store/index.js": 30,
	"node_modules/semver-store/package.json": 31,
	"node_modules/semver-store/test.js": 32,
	"package.json": 33
}
        var mod1= function(KModule, exports){
            var i=0, main, pe, filecount, pjson
            for(var id in filenames){
                if(typeof module == "object"){
                    
                    if(id == "package.json"){
                        pjson= fileData[i]()
                        pjson= JSON.parse(pjson.content)
                    }
                                 
                }
                KModule.addVirtualFile("find-my-way$v$2.0.1/node_modules" + (id ? ("/"+id) : ""), fileData[i])
                i++
            }
            if(pjson){
                main= pjson.main
                if(!main){
                    main= "index.js"
                }
                if(main.substring(0,2)=="./"){
                    main= main.substring(2)
                }
                main= "find-my-way$v$2.0.1/node_modules" + (main ? ("/" + main) : "")
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