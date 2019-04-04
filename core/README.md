# @kawix/core

### The next generation module loader for nodejs

### no-webpack, no-rollup, no-dependencies

**@kawix/core** allows requiring modules in async and more elegant way, and use last features of EcmaScript (for example async/await) without requiring a lot of dependencies, packagers or build scripts

## What is new in 0.3.13

* Environment variable ```KAWIX_CACHE_DIR```. You can override the cache directory for save compilated files and modules


## What is new in 0.3.12

* Fixed bugs, on importing. Improved async imports
* Now working again on browser


## What is new in 0.3.9

* Fix bug invalid filenames when importing from npm on windows


## What is new in 0.3.7

* Fix bug *again* on windows, loading some imports



## What is new in 0.3.5

* Fix bug ```asynchelper not defined```
* Fix bug ```module $1 not found``` when importing from npm
* You can now require modules that dependes on **native** using ```npmi``` protocol. Example:

```javascript
import dmg from 'npmi://appdmg@^0.5.2'
```

## What is new in 0.3.0 [IMPORTANT FIXED BUGS]

* Fix bug with caching on modules imported.
* Now imports are synchronized too between same process avoiding concurrency issues
* Stable version near, I will be glad if anyone contribute to report bugs or add functionality


## What is new in 0.2.1

**Compilation** are now synchronized between processes, using a file lock. This is important, because avoid errors when you launch concurrent scripts that uses the same files.


## What is new in 0.1.8

Starting in version **0.1.8** was added *browser* support. You need add the file ```crossplatform/dist/main.js``` to your webpage for start using this module on browser.

You can add also support for typescript and all transpilation features of this packages, adding ```crossplatform/async/dist/main.js```


> **IMPORTANT**: In version **0.1.6** solve the bug on Windows when loading a local file. If you are a windows user, you can now test this version using **--force** parameter.

```bash
> npm install -g @kawix/core@latest
> kwcore --force "https://kwx.kodhe.com/x/core/example/http.js"
```




## More info

Please go to [https://raw.githubusercontent.com/voxsoftware/kawix](https://raw.githubusercontent.com/voxsoftware/kawix) for see the full **kawix** project


## Get started


```bash
> npm install -g @kawix/core@latest
> kwcore "https://kwx.kodhe.com/x/core/example/http.js"
```


If you run the previous example, you will see and HTTP server example running.
Look the [https://kwx.kodhe.com/x/core/example/http.js](https://kwx.kodhe.com/x/core/example/http.js) content


```javascript
import httpServer from './http-async.js'

var server= new httpServer()
server.listen(8081)
console.info("Open in browser: 127.0.0.1:8081")

var handle= async function(){
	var conn
	while(conn = await server.acceptAsync()){
		conn.res.write("Hello world! from URL: " + conn.req.url)
		conn.res.end()
	}
	console.info("Http server stopped")
}

handle()

```

Yes, you can import from urls or files, and inside *Kawi required files* you can import relative urls or file in the normal way using **import** and access to all **async/await** features


```javascript

// require a url
import httpServer from 'https://kwx.kodhe.com/x/core/example/http-async.js'

// require a file
import test from './test.js'

```



## Programatically

You can run all scripts (including the examples here) using **kwcore** executable installed with npm. If you want run programatically you need include a file like this and execute with node.js

```javascript
var Kawix= require("@kawix/core")

// Kawix.KModule.import returns a promise
Kawix.KModule.import("https://kwx.kodhe.com/x/core/example/http.js", {
    // allow find path relative to this module
    parent: module
})
```

## Why @kawix/core instead of esm

* Imports are async
* Imports from http:// and https:// urls
* Imports dynamically npm packages (npm://package@version)
* Cache compilation secure between processes
* Support Typescript
* Support spread operators and other EcmaScript 2018 syntax on Node 6+


## Runtime options

* Flag ```--force``` allows you to ignore the cache of your remote files and recompile
* Environment variable ```KAWIX_CACHE_DIR``` allows you to specify the folder when compiled/cached files are saved. Is good for example if you want flexibility in development, but in production want include all dependencies (remote,npm) in the distributable


## Features

### 1. Imports are async, imports from URL

Create an **.js** with following content

```javascript

import httpServer from 'https://kwx.kodhe.com/x/core/example/http-async.js'

var server= new httpServer()
server.listen(8081)
console.info("Open in browser: 127.0.0.1:8081")

var handle= async function(){
	var conn
	while(conn = await server.acceptAsync()){
		conn.res.write("Hello world! from URL: " + conn.req.url)
		conn.res.end()
	}
	console.info("Http server stopped")
}

handle()

```

**IMPORTANT:**

1. *@kawix/core* doesn't resolve dependencies like node.js. For example, this code *import xx from 'request'* will fallback to *node.js* internal resolve method requiring package *request*. The idea of *@kawix/core* is be simplier, and inspired in *deno* allow imports from absolute, relative and URL paths. Also, like *@kawix/core* doesn't resolve dependencies like node.js, you cannot expect that importer search *package.json* or *index.js* if you import a folder. You should specify imports to files no folders


2. *@kawix/core* execute imports before all other code. This means, that you should not call any function or make any operations between imports

Think in this code:

```javascript
// is builtin module, this line is untouched
import fs from 'fs'
// is processed by kawix
import http from 'https://kwx.kodhe.com/x/core/example/http.js'
// this is BAD, not recommended
makeAnyOperation()

import other from './other.js'

export default function(){
	// any operation
	return action()
}
```

Will be translated to something like this (before transpiling):

```javascript
import fs from 'fs'
import http from 'cached_result_on_1'

makeAnyOperation()

import other from 'cached_result_on_2'


export default function(){
	// any operation
	return action()
}

// THIS will be executed before all file code
var __kawi_async= async function(){
	await KModule.import('https://kwx.kodhe.com/x/core/example/http.js', {
		// this ensure create a cache for be usable later with import
		uid: 'cached_result_on_1'
	})
	await KModule.import('./other.js', {
		// this ensure create a cache for be usable later with import
		uid: 'cached_result_on_2'
	})
}
```

### 2. Full Ecmascript 2018 (async/await)

Create an .es6 or .js with following content and import with KModule

```javascript

let value1= 7 ** 2
let arr= [10,23,4,NaN]

console.log(value1)
console.log(arr.includes(4))

let cars= {
	"BMW": 3,
	"Tesla": 2,
	"Toyota": 1
}
let values= Object.values(cars)
console.log(values)


for(let [key,value] of Object.entries(cars)){
	console.log(`key: ${key} value: ${value}`)
}


printInfo(1)


function getUser(userId){
	return new Promise((resolve)=>{
		setTimeout(resolve.bind(null, 'John'), 1000)
	})
}

async function printInfo(userId){
	let user= await getUser(userId)
	console.log(user)
}

```

### 3. Support dynamic import

Create an **.js** with following content

```javascript
init()
async function init(){

    var mod= await import('https://kwx.kodhe.com/x/core/example/http-async.js')
    var httpServer= mod.default

    var server= new httpServer()
    server.listen(8081)
    console.info("Open in browser: 127.0.0.1:8081")

    var handle= async function(){
    	var conn
    	while(conn = await server.acceptAsync()){
    		conn.res.write("Hello world! from URL: " + conn.req.url)
    		conn.res.end()
    	}
    	console.info("Http server stopped")
    }
    handle()
}
```

### 4. Typescript support

Create an .ts with following content and import with KModule

```typescript
function greeter(person: string) {
	return "Hello, " + person;
}


function sleep(timeout?: number){
	timeout= timeout || 0
	return new Promise(function(resolve, reject){
		setTimeout(resolve, timeout)
	})
}


async function foo() {
    try {
        var val = greeter("World!");
		console.log(val);

		console.log("Simulating async action... please wait 1 second")
		await sleep(1000)
		console.log("Finished")

    }
    catch(err) {
        console.log('Error: ', err.message);
    }
}

foo()
```


### 5. Imports npm packages (dinamycally)

Consider the following example

```javascript

// this will download the npm module with dependencies, and make a local cache
import express from 'npm://express@^4.16.4'


var app = express()
app.get('/', function (req, res) {
  res.send('Hello World')
})
app.listen(3000)
console.log("Listening on 3000")

```

Test yourself from your terminal

```bash
> npm install -g @kawix/core@latest

> kwcore "https://kwx.kodhe.com/x/core/example/npmrequire/express.js"

# take care that this project is in active development, if fails use --force for invalidate cache
> kwcore --force "https://kwx.kodhe.com/x/core/example/npmrequire/express.js"
```

**Use cases for dynamic loading?**
* You need/want decrease or have zero *installation/update* effort (for example in a web service balanced on multiple servers)

* You are testing development

* You sell scripts to your clients *no developers* that have not idea how move mouse :v

* You want decreases memory, and you want multiple secure apps sharing process/cluster

* You want portability

* For little tools that you can make for your projects

* For fun :)

**When not use dynamic loading?**

* Just now, only with native bindings module, because currently **@kawix/core** doesn't have ability to compile. But will be available using *npm* package for this purpose

**Is secure hot loading?**

Maybe you think that this is not good or practical, because can give version inconsistency. Ok, that's not true, because each module version is respected.

* This means if you require module *A* that depends on *B* version 1 and on module *C*, that depends on *B* version 2, each version will be downloaded, and each module will use the version for which was made

* If you require module *A* version 1, and later in same process require module *A* version 2, each module version will be cached in different folder, avoiding file inconsistency cross versions

* If you require module *A* that depends on module *B* version 1, and later in your code you require module *B* version 1, will be resolved to the same module *B* path, installed for *A*, avoiding so much duplicates, but if you request a different version, will be downloaded and cached on different folder


### 6. Register language loaders

**@kawix/core** allows register additional language loaders. For example, you can easily start to write *coffeescript* importing the loader available in github. Just see the example:

Create a *test.js* file

```javascript
// register coffeescript loader
import 'https://kwx.kodhe.com/x/std/coffeescript/register.js'

// You can now import .coffee files
import {start} from 'https://kwx.kodhe.com/x/std/coffeescript/example.coffee'

start()
```

Run with **@kawix/core**

```bash
> kwcore ./test.js
```

There is available a loader also for *cson* at [https://kwx.kodhe.com/x/std/coffeescript/cson/register.js](https://kwx.kodhe.com/x/std/coffeescript/cson/register.js)

This is only an example you can create your own loaders


### 7. Generate a **single file bundle** from a **npm package**

Yes, in some cases you may prefer have a single .js file instead of loading an entire npm package with a ton of modules. Consider this practical example

* Create a *bundler.js* file

```javascript
import Bundler from 'https://kwx.kodhe.com/x/std/package/bundle.js'
import Registry from 'https://kwx.kodhe.com/x/std/package/registry.js'
import Path from 'path'

init()
async function init(){
	// caching a npm package: express 4.16.4
	var reg= new Registry()
	var moduleinfo= await reg.resolve("express@^4.16.4")
	var path= moduleinfo.folder


	var outfile= Path.join(__dirname, "express.js")

	var bundler= new Bundler(path)
	// packageJsonSupport should be true for npm packages
	bundler.packageJsonSupport= true
	bundler.virtualName= `express`
	await bundler.writeToFile(outfile).bundle()
}
```

* Execute with **@kawix/core**, will generate an *express.js* file containing all the package.

```bash
> kwcore ./bundler.js
```

* Now you can import from other files. Create a *server.js* file:

```javascript
import express from './express.js'
var app = express()
app.get('/', function (req, res) {
  res.send('Hello World')
})
app.listen(3000)
console.log("Listening on 3000")
// go to browser and open 127.0.0.1:3000
```

* Now execute the *server.js* file and go to browser: 127.0.0.1:3000

```bash
> kwcore ./server.js
  Listening on 3000
```



**Why generate a single file package?**

* Faster installation times when you distribute scripts or packages

* You want generate a distributable file from your package

* You want create packages with zero or almost zero dependencies

* You want avoid module version collision

* Use in browser (coming soon)

* If you are like me, that hates that one simple module downloads a tons of dependencies :v



## Do you want contribute?

You can contribute testing the code and report issues: [https://github.com/voxsoftware/kawix/issues](https://github.com/voxsoftware/kawix/issues)

Do you think that can write better some parts of this README? Feel free to check and contribute

Do you have any idea that can be great for this project?

If you are a developer with time, can contribute adding functionality or fixing some bugs that can appears

If you cannot contribute in last two ways, why not donate? Contact us: contacto@kodhe.com

Do you want appears on README section like a continous financial collaborator, contact us for patronate this project with monthly donations
