import '../mod'
import Watcher from '../watcher'

init()
async function init() {
	var wat = new Watcher()
	wat.watch("/home/$USER/projects/*/app.config.*")
	console.log(await wat._getpaths("/home/james/projects/*/functions/*"))
}