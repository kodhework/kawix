(function(){
	var fileData=[]
	fileData.push(function(){return {
	"stat": {
		"mtime": "2019-03-08T17:20:24.198Z",
		"mtimeMs": 1552065624197.989,
		"atime": "2019-03-08T17:20:24.190Z",
		"atimeMs": 1552065624189.989,
		"isdirectory": true
	},
	"filename": ""
}})
	fileData.push(function(){ var item= {
	"stat": {
		"mtime": "1985-10-26T08:15:00.000Z",
		"mtimeMs": 499162500000,
		"atime": "2019-03-08T17:20:24.201Z",
		"atimeMs": 1552065624201,
		"isfile": true
	},
	"filename": "Readme.md",
	"content": "![uniqid logo](http://i.imgur.com/OrZC1lc.png)\n\n![unqiid npm badge](http://img.shields.io/npm/v/uniqid.svg) ![uniqid npm downloads badge](https://img.shields.io/npm/dm/uniqid.svg) \n\n### A Unique Hexatridecimal ID generator. \nIt will always create unique id's based on the current time, process and machine name.\n\n```\nnpm install uniqid\n```\n\n## Usage\n```js\nvar uniqid = require('uniqid');\n\nconsole.log(uniqid()); // -> 4n5pxq24kpiob12og9\nconsole.log(uniqid(), uniqid()); // -> 4n5pxq24kriob12ogd, 4n5pxq24ksiob12ogl\n```\n\n## Features\n- Very fast\n- Generates unique id's on multiple processes and machines even if called at the same time.\n- Shorter 8 and 12 byte versions with less uniqueness.\n\n\n# How it works\n- With the current time the ID's are always unique in a single process.\n- With the Process ID the ID's are unique even if called at the same time from multiple processes.\n- With the MAC Address the ID's are unique even if called at the same time from multiple machines and processes.\n\n## API:\n####  **uniqid(** prefix *optional string* **)** \nGenerate 18 byte unique id's based on the time, process id and mac address. Works on multiple processes and machines. \n\n```js\nuniqid() -> \"4n5pxq24kpiob12og9\"\nuniqid('hello-') -> \"hello-4n5pxq24kpiob12og9\"\n```\n\n####  **uniqid.process(** prefix *optional string* **)** \nGenerate 12 byte unique id's based on the time and the process id. Works on multiple processes within a single machine but not on multiple machines.\n```js\nuniqid.process() -> \"24ieiob0te82\"\n```\n\n####  **uniqid.time(** prefix *optional string* **)** \nGenerate 8 byte unique id's based on the current time only. Recommended only on a single process on a single machine.\n\n```js\nuniqid.time() -> \"iob0ucoj\"\n```\n\n## Webpack and Browserify\nSince browsers don't provide a Process ID and in most cases neither give a Mac Address using uniqid from Webpack and Browserify falls back to `uniqid.time()` for all the other methods too. The browser is the single process, single machine case anyway.\n\n## Debug\nDebug messages are turned of by default as of `v4.1.0`. To turn on debug messages you'll need to set `uniqid_debug` to `true` before you require the module.\n\n```js\n// enable debug messages\nmodule.uniqid_debug = true\n\n// require the module\nvar uniqid = require('uniqid')\n```\n\n## **License**\n\n(The MIT License)\n\nCopyright (c) 2014 HalÃ¡sz ÃdÃ¡m <mail@adamhalasz.com>\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
	"transpiled": true
}; item.content= Buffer.from(item.content,'binary'); return item; })
	fileData.push(function(){ var item= {
	"stat": {
		"mtime": "1985-10-26T08:15:00.000Z",
		"mtimeMs": 499162500000,
		"atime": "2019-03-08T17:20:24.201Z",
		"atimeMs": 1552065624201,
		"isfile": true
	},
	"filename": "index.js",
	"content": "/* \n(The MIT License)\nCopyright (c) 2014 HalÃ¡sz ÃdÃ¡m <mail@adamhalasz.com>\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the \"Software\"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n*/\n\n//  Unique Hexatridecimal ID Generator\n// ================================================\n\n//  Dependencies\n// ================================================\nvar pid = process && process.pid ? process.pid.toString(36) : '' ;\nvar address = '';\nif(typeof __webpack_require__ !== 'function'){\n    var mac = '', networkInterfaces = require('os').networkInterfaces();\n    for(interface_key in networkInterfaces){\n        const networkInterface = networkInterfaces[interface_key];\n        const length = networkInterface.length;\n        for(var i = 0; i < length; i++){\n            if(networkInterface[i].mac && networkInterface[i].mac != '00:00:00:00:00:00'){\n                mac = networkInterface[i].mac; break;\n            }\n        }\n    }\n    address = mac ? parseInt(mac.replace(/\\:|\\D+/gi, '')).toString(36) : '' ;\n} \n\n//  Exports\n// ================================================\nmodule.exports = module.exports.default = function(prefix){ return (prefix || '') + address + pid + now().toString(36); }\nmodule.exports.process = function(prefix){ return (prefix || '') + pid + now().toString(36); }\nmodule.exports.time    = function(prefix){ return (prefix || '') + now().toString(36); }\n\n//  Helpers\n// ================================================\nfunction now(){\n    var time = Date.now();\n    var last = now.last || time;\n    return now.last = time > last ? time : last + 1;\n}\n",
	"transpiled": true
}; item.content= Buffer.from(item.content,'binary'); return item; })
	fileData.push(function(){return {
	"stat": {
		"mtime": "2019-03-08T17:20:24.198Z",
		"mtimeMs": 1552065624197.989,
		"atime": "2019-03-08T17:20:24.198Z",
		"atimeMs": 1552065624197.989,
		"isdirectory": true
	},
	"filename": "node_modules"
}})
	fileData.push(function(){ var item= {
	"stat": {
		"mtime": "1985-10-26T08:15:00.000Z",
		"mtimeMs": 499162500000,
		"atime": "2019-03-08T17:20:24.200Z",
		"atimeMs": 1552065624200,
		"isfile": true
	},
	"filename": "package.json",
	"content": "{\n  \"name\": \"uniqid\",\n  \"version\": \"5.0.3\",\n  \"description\": \"Unique ID Generator\",\n  \"homepage\": \"http://github.com/adamhalasz/uniqid/\",\n  \"keywords\": [\n    \"unique id\",\n    \"uniqid\",\n    \"unique identifier\",\n    \"hexatridecimal\"\n  ],\n  \"bugs\": {\n    \"url\": \"http://github.com/adamhalasz/uniqid/issues\",\n    \"email\": \"mail@adamhalasz.com\"\n  },\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"https://github.com/adamhalasz/uniqid.git\"\n  },\n  \"files\": [\n    \"index.js\"\n  ],\n  \"license\": \"MIT\",\n  \"author\": {\n    \"name\": \"HalÃ¡sz ÃdÃ¡m\",\n    \"email\": \"mail@adamhalasz.com\",\n    \"url\": \"http://adamhalasz.com/\"\n  },\n  \"main\": \"index.js\",\n  \"dependencies\": {},\n  \"devDependencies\": {}\n}\n",
	"transpiled": true
}; item.content= Buffer.from(item.content,'binary'); return item; })
	var filenames={
	"": 0,
	"Readme.md": 1,
	"index.js": 2,
	"node_modules": 3,
	"package.json": 4
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
                KModule.addVirtualFile("uniqid$v$5.0.3" + (id ? ("/"+id) : ""), fileData[i])
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
                main= "uniqid$v$5.0.3" + (main ? ("/" + main) : "")
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