# @kawix/gix

A socket IPC channel for start electron GUI apps 

**@kawix/gix** expose a module for starting GUI apps using electron, easily without effort. You don't need install or build anything. Exposes an IPC comunication with electron. Electron is automatically downloaded on first boot. 


## Features 

* Wrote for [@kawix/core](../core), you can use last language features
* Exposes an IPC comunication
* Automatically downloads electron. You don't need complicated builds or installs
* Accessible from web using [@kawix/sites/x](../sites/x) service

## Example

Look the *test/hello.world.js*

```javascript
import '../src/mod.js'
import Gui from '../src/gui'
import Path from 'path'

init()
async function init() {
	try {
		// please use a unique id for your app
		var ui = new Gui("default")
		if (! await ui.requestSingleInstanceLock())
			return process.exit()

		ui.on("second-instance", function (argv, cwd) {
			console.log("You tried opening another instance: ", argv, cwd)
		})
		

		var params = {
			url: `file://${Path.join(__dirname, "..", "html", "hello.world.html")}`,
			args: {
				width: 600,
				height: 400,
				webPreferences: {
					nodeIntegration: true
				}
			}
		}

		if (!ui.api.main) {
			await ui.register("main", function (electron, gix, params) {
				var BrowserWindow = electron.BrowserWindow
				mainWindow = new BrowserWindow(params.args)
				mainWindow.loadURL(params.url)
				mainWindow.show()
				mainWindow.once("closed", function () {
					gix.emit("mainwindow.closed")
					mainWindow = null
				})
				mainWindow.on("minimize", function () {
					gix.emit("mainwindow.minimize")
				})
			})
			ui.once("mainwindow.closed", function () {
				console.log("Event attached on main. Window was closed")
			})
			ui.on("mainwindow.minimize", function () {
				console.log("Event attached on main. Browser window was minimized")
			})
		}
		await ui.api.main(params)

	} catch (e) {
		console.error("ERROR: ", e.message, e)
	}
}
``` 




You can clone the repo and start testing 

```bash 
>  git clone https://github.com/voxsoftware/kawix
> cd kawix/gix
> ./core/bin/kwcore ./gix/test/hello.world.js
```
