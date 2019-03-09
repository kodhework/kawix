import '../mod.js'
import Watcher from '../watcher.coffee'

init()
async function init() {
	var wat = new Watcher()
	wat.watch("/home/$USER/projects/*/app.config.*")
	console.log(await wat._getpaths("/home/james/projects/*/functions/*"))
}