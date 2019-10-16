# @kawix/gix

A IPC channel for start electron GUI apps (RPA)

**@kawix/gix** expose a module for starting GUI apps using electron, easily without effort. You don't need install or build anything. Exposes an IPC comunication with electron. Electron is automatically downloaded on first boot. 


## Features 

* Wrote for [@kawix/core](../core), you can use last language features
* Exposes an IPC comunication (named @kawix/RPA)
* Automatically downloads electron. You don't need complicated builds or installs
* Accessible from web using [@kawix/sites/x](../sites/x) service

## Example

Look the *test/hello.world.new.js*

```javascript
import {Electron} from '../src/electron'
import Path from 'path'
import Url from 'url'

init()
async function init() {
	try {

		var ui = new Electron("hello.world.example")
		if (! await ui.requestSingleInstanceLock()){
			// only attach ...
			await ui.attachInstance()
		}
		else{
			ui.on("second-instance", function (argv, cwd) {
				console.log("You tried opening another instance: ", argv, cwd)
			})
		}

		
		

		var thisPath= __filename , url
		if(thisPath.startsWith("http:") || thisPath.startsWith("https:")){
			url= Url.resolve(thisPath, '../html/hello.world.html')
		}else{
			url= `file://${Path.join(__dirname, "..", "html", "hello.world.html")}`
		}

		var params = {
			url,
			args: {
				width: 600,
				height: 400,
				webPreferences: {
					nodeIntegration: true
				},
				rpa_plain: true
			}
		}


		let mainWindow = await ui.electron.BrowserWindow.construct(params.args)
		await mainWindow.loadURL(params.url)
		await mainWindow.show()		
		await ui.bridge.addEventListener(mainWindow, "minimize", function () {
			console.info("Window minimized")
		})
		await ui.bridge.addEventListener(mainWindow, "closed", function () {
			console.info("Window closed")
			// close this 
			setTimeout(function(){
				ui.channel.close()
			},100)
		})


	} catch (e) {
		console.info("ERROR: ", e.message, e)
		//console.error("Failed running test: ", e)
	}
}
``` 




You can clone the repo and start testing 

```bash 
git clone https://github.com/kodhework/kawix
cd kawix/gix
./core/bin/kwcore ./gix/test/hello.world.js
```

Or use directly from URL import 

```javascript 
import 'https://kwx.kodhe.com/x/v/0.7.3/std/dist/stdlib'

// After import this, you can use all the module like any other 
// local module using /virtual/@kawix/gix ....
import 'https://kwx.kodhe.com/x/v/0.7.3/gix/dist/gix'


import {Electron} from '/virtual/@kawix/gix/src/electron'

....
```

You can start the example directly from your command without cloning: 

```bash 
kwcore https://kwx.kodhe.com/x/v/0.7.3/gix/test/hello.fromweb
```

