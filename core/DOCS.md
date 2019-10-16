## Install 

Refer to [INSTALL.md](./INSTALL.md) for instalation instructions.

```@kawix/core``` has its own installer and executable files, but you can still use directly with node installing this package with npm or yarn. Is known to work with node 10+




## Get started

```bash
> kwcore "https://kwx.kodhe.com/x/v/0.7.2/core/example/http"
```


If you run the previous example, you will see and HTTP server example running.
Look the [https://kwx.kodhe.com/x/core/example/http](https://kwx.kodhe.com/x/core/example/http) content


```javascript
import httpServer from './http-async'

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

Yes, you can import from urls or files, and inside *kawix required files* you can import relative urls or file in the normal way using **import** and access to all **async/await** features


```javascript

// require a url
import httpServer from 'https://kwx.kodhe.com/x/v/0.7.2/core/example/http-async'

// require a file
import test from './test'

```



## Programatically

You can run all scripts (including the examples here) using **kwcore** executable installed with npm. If you want run programatically you need include a file like this and execute with node.js

```javascript
var Kawix= require("@kawix/core")

// Kawix.KModule.import returns a promise
Kawix.KModule.import("https://kwx.kodhe.com/x/v/0.7.2/core/example/http", {
    // allow find path relative to this module
    parent: module
})
```


## Why @kawix/core instead of esm

* Imports are async
* Imports from http:// and https:// urls
* Imports dynamically npm packages (npm://package@version)
* Cache compilation secure between processes
* Support Typescript on the fly 


## Runtime options

* Flag ```--force``` allows you to ignore the cache of your remote files and recompile
* Environment variable ```KAWIX_CACHE_DIR``` allows you to specify the folder when compiled/cached files are saved. Is good for example if you want flexibility in development, but in production want include all dependencies (remote,npm) in the distributable


## Features

### 1. Imports are async, imports from URL

Create an **.js** with following content

```javascript

import httpServer from 'https://kwx.kodhe.com/xv/0.7.2/core/example/http-async'

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

1. ```@kawix/core``` doesn't resolve dependencies like node.js. For example, this code ```import xx from 'request'``` will fallback to internal *node.js* resolution method. The idea of ```@kawix/core``` is be simplier, always async, and inspired in *deno* allow imports from absolute, relative and URL paths.

Also, like ```@kawix/core``` doesn't resolve dependencies like node.js, you cannot expect that importer search ```package.json``` or ```index.js``` if you import a folder. You should specify imports to files no folders. 


2. ```@kawix/core``` execute imports before all other code. This means, that you should not call any function or make any operations between imports

Think in this code:

```javascript
// is builtin module, this line is untouched
import fs from 'fs'
// is processed by kawix
import http from 'https://kwx.kodhe.com/x/core/example/http'
// this is BAD, not recommended
makeAnyOperation()

import other from './other'

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
	await KModule.import('https://kwx.kodhe.com/x/core/example/http', {
		// this ensure create a cache for be usable later with import
		uid: 'cached_result_on_1'
	})
	await KModule.import('./other', {
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

    var mod= await import('https://kwx.kodhe.com/x/core/example/http-async')
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
import 'npm://express@^4.16.4'
import express from 'express'


var app = express()
app.get('/', function (req, res) {
  res.send('Hello World')
})
app.listen(3000)
console.log("Listening on 3000")

```

Test yourself from your terminal

```bash
kwcore "https://kwx.kodhe.com/x/v/0.7.2/core/example/npmrequire/express"

# take care that this project is in active development, if fails use --force for invalidate cache
kwcore --force "https://kwx.kodhe.com/x/v/0.7.2/core/example/npmrequire/express"
```


**Use cases for dynamic loading?**


* You need/want decrease or have zero *installation/update* effort (for example in a web service balanced on multiple servers)

* You are testing development

* You sell scripts to your clients *no developers* that have not idea how things works :v

* You want portability

* For little tools that you can make for your projects

* For fun :)


**When not use dynamic loading?**

You can use always dynamic loading. However in Windows for modules with node-pregyp, you should prefer not using this. In Unix you can use dynamic loading for native modules too.

**Is secure hot loading?**

YES! @kawix/core uses internally ```yarn``` a lightweight and very compatible replacement for npm. Each module is isolated in individual folder, so you can expect same results across machines 


### 6. Register language loaders

```@kawix/core``` allows register additional language loaders. For example, you can easily start to write *coffeescript* importing the loader available in github. Just see the example:

Create a *test.js* file

```javascript
// register coffeescript loader
import 'https://kwx.kodhe.com/x/v/0.7.2/std/coffeescript/register'

// You can now import .coffee files
import {start} from 'https://kwx.kodhe.com/x/v/0.7.2/std/coffeescript/example.coffee'

start()
```

Run with ```@kawix/core```

```bash
kwcore ./test
```


There is available a loader also for *cson* at [https://kwx.kodhe.com/x/v/0.7.2/std/coffeescript/cson/register](https://kwx.kodhe.com/x/v/0.7.2/std/coffeescript/cson/register)

This is only an example you can create your own loaders



### 7. Generate a **single file bundle** from a **npm package**

Yes, in some cases you may prefer have a single .js file instead of loading an entire npm package with a ton of modules. Consider this practical example

* Create a *bundler.js* file

```javascript
import Bundler from 'https://kwx.kodhe.com/x/v/0.7.2/std/package/bundle'
import Registry from 'https://kwx.kodhe.com/x/v/0.7.2/std/package/registry'
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

* Execute with ```@kawix/core```, will generate an *express.js* file containing all the package.

```bash
kwcore ./bundler.js
```

* Now you can import from other files. Create a ```server.js``` file:

```javascript
import express from './express'
var app = express()
app.get('/', function (req, res) {
  res.send('Hello World')
})
app.listen(3000)
console.log("Listening on 3000")
// go to browser and open 127.0.0.1:3000
```

* Now execute the ```server.js``` file and go to browser: 127.0.0.1:3000

```bash
kwcore ./server.js
Listening on 3000
```



**Why generate a single file package?**

* Faster installation times when you distribute scripts or packages

* You want generate a distributable file from your package

* You want create packages with zero or almost zero dependencies

* You want avoid module version collision

* Use in browser (coming soon)

* If you are like me, that hates that one simple module downloads a tons of dependencies :v
