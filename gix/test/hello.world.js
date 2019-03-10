


import '../src/mod.js'
import Gui from '../src/gui'
import Path from 'path'
import Url from 'url'

init()
async function init() {
	try {
		var ui = new Gui("default")
		if (! await ui.requestSingleInstanceLock())
			return process.exit()

		ui.on("second-instance", function (argv, cwd) {
			console.log("You tried opening another instance: ", argv, cwd)
		})
		
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
				}
			}
		}

		if (!ui.api.main) {
			//console.log('Registering')
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
		//console.log('Invoking')
		await ui.api.main(params)

	} catch (e) {
		console.info("ERROR: ", e.message, e)
		//console.error("Failed running test: ", e)
	}
}
