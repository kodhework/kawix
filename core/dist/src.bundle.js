(function(global, context){
	var fileData=[]
	fileData.push(function(){return {
	"stat": {
		"mtime": "2019-03-09T06:56:32.663Z",
		"mtimeMs": 1552114592663.4539,
		"atime": "2019-03-11T07:15:58.711Z",
		"atimeMs": 1552288558711.0588,
		"isdirectory": true
	},
	"filename": ""
}})
	fileData.push(function(){ return {
	"stat": {
		"mtime": "2019-03-05T19:54:40.493Z",
		"mtimeMs": 1551815680493.169,
		"atime": "2019-03-10T22:17:12.829Z",
		"atimeMs": 1552256232829.249,
		"isfile": true
	},
	"filename": "bundle.babel.js",
	"content": "\"use strict\";\n\nvar _bundle = _interopRequireDefault(require(\"___kawi__internal__0MOD_//std/package/bundlejs_0\"));\n\nvar _registry = _interopRequireDefault(require(\"___kawi__internal__0MOD_//std/package/registryjs_1\"));\n\nvar _path = _interopRequireDefault(require(\"path\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }\n\nfunction _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err); } _next(undefined); }); }; }\n\nvar init = function () {\n  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {\n    var reg, moduleinfo, path, outfile, bundler;\n    return regeneratorRuntime.wrap(function _callee$(_context) {\n      while (1) {\n        switch (_context.prev = _context.next) {\n          case 0:\n            reg = new _registry.default();\n            _context.next = 3;\n            return reg.resolve(\"@babel/core\", \"^7.3.4\");\n\n          case 3:\n            moduleinfo = _context.sent;\n            path = moduleinfo.folder;\n            outfile = _path.default.join(__dirname, \"mod.js\");\n            bundler = new _bundle.default(path);\n            bundler.packageJsonSupport = true;\n            bundler.virtualName = \"babel$v$\".concat(moduleinfo.version, \"/node_modules\");\n            _context.next = 11;\n            return bundler.writeToFile(outfile).bundle();\n\n          case 11:\n          case \"end\":\n            return _context.stop();\n        }\n      }\n    }, _callee);\n  }));\n\n  return function init() {\n    return _ref.apply(this, arguments);\n  };\n}();\n\ninit();\n// kawi converted. Preserve this line, Kawi transpiler will not reprocess if this line found\nvar ___kawi__async = \nfunction(KModule){\n\tvar resolve, reject\n\tvar required= [\"../../std/package/bundle.js\",\"../../std/package/registry.js\"]\n\tvar num=0\n\tvar i=-1\n\tvar __load= function () {\n\ti++\n\tvar mod = required[i]\n\tif (!mod) return resolve()\n\tvar unq = \"___kawi__internal__\" + num + \"MOD_\" + mod.replace(/\\./g, \"\") + \"_\" + i\n\tvar promise = KModule.import(mod, {\n\t\tuid: unq,\n\t\tparent: module\n\t})\n\tif (promise && typeof promise.then == \"function\")\n\t\tpromise.then(__load).catch(reject)\n\telse\n\t\t__load()\n}\n\tvar promise= new Promise(function(a,b){ resolve=a; reject=b; })\n\t__load()\n\treturn promise\n}",
	"transpiled": true
} })
	fileData.push(function(){ return {
	"stat": {
		"mtime": "2019-03-10T08:15:40.563Z",
		"mtimeMs": 1552205740562.612,
		"atime": "2019-03-10T11:25:26.731Z",
		"atimeMs": 1552217126731.2888,
		"isfile": true
	},
	"filename": "npm-import.js",
	"content": "\"use strict\";\n\nvar _registry = _interopRequireDefault(require(\"___kawi__internal__1MOD_//std/package/registryjs_0\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }\n\nfunction _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err); } _next(undefined); }); }; }\n\nexports.require = exports.import = function () {\n  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(module, options) {\n    var noptions, reg;\n    return regeneratorRuntime.wrap(function _callee$(_context) {\n      while (1) {\n        switch (_context.prev = _context.next) {\n          case 0:\n            noptions = Object.assign({}, options || {});\n            delete noptions.url;\n            reg = new _registry.default(noptions);\n            _context.next = 5;\n            return reg.require(module);\n\n          case 5:\n            return _context.abrupt(\"return\", _context.sent);\n\n          case 6:\n          case \"end\":\n            return _context.stop();\n        }\n      }\n    }, _callee);\n  }));\n\n  return function (_x, _x2) {\n    return _ref.apply(this, arguments);\n  };\n}();\n\nexports.resolve = function () {\n  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(module, options) {\n    var noptions, reg;\n    return regeneratorRuntime.wrap(function _callee2$(_context2) {\n      while (1) {\n        switch (_context2.prev = _context2.next) {\n          case 0:\n            noptions = Object.assign({}, options || {});\n            delete noptions.url;\n            reg = new _registry.default(noptions);\n            _context2.next = 5;\n            return reg.resolve(module);\n\n          case 5:\n            return _context2.abrupt(\"return\", _context2.sent);\n\n          case 6:\n          case \"end\":\n            return _context2.stop();\n        }\n      }\n    }, _callee2);\n  }));\n\n  return function (_x3, _x4) {\n    return _ref2.apply(this, arguments);\n  };\n}();\n// kawi converted. Preserve this line, Kawi transpiler will not reprocess if this line found\nvar ___kawi__async = \nfunction(KModule){\n\tvar resolve, reject\n\tvar required= [\"../../std/package/registry.js\"]\n\tvar num=1\n\tvar i=-1\n\tvar __load= function () {\n\ti++\n\tvar mod = required[i]\n\tif (!mod) return resolve()\n\tvar unq = \"___kawi__internal__\" + num + \"MOD_\" + mod.replace(/\\./g, \"\") + \"_\" + i\n\tvar promise = KModule.import(mod, {\n\t\tuid: unq,\n\t\tparent: module\n\t})\n\tif (promise && typeof promise.then == \"function\")\n\t\tpromise.then(__load).catch(reject)\n\telse\n\t\t__load()\n}\n\tvar promise= new Promise(function(a,b){ resolve=a; reject=b; })\n\t__load()\n\treturn promise\n}",
	"transpiled": true
} })
	var filenames={
	"": 0,
	"bundle.babel.js": 1,
	"npm-import.js": 2
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
                KModule.addVirtualFile("src" + (id ? ("/"+id) : ""), fileData[i])
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
                main= "src" + (main ? ("/" + main) : "")
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
        if(global.Buffer){
            context.Buffer= global.Buffer
        }

        if(typeof window == "object"){
            if(window.KModuleLoader){
                context.Buffer= global.___kmodule___basic.mod.buffer.Buffer
                context.module= window.KModuleLoader.generateModule()
                context.module.exports= mod1(window.KModuleLoader, context.module.exports)
                return mod1
            }
        }
        if(typeof KModule == "object"){
            module.exports= mod1(KModule, module.exports)
        }
        return mod1
        
})(typeof global == 'object' ? global : window, {})
// kawi converted. Preserve this line, Kawi transpiler will not reprocess if this line found