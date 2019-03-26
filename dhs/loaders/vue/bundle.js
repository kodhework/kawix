import Bundler from '../../bundle.js'
import Registry from '../../registry.js'
import Path from 'path'

var init = async function () {
	var reg = new Registry()
	var moduleinfo = await reg.resolve("vue-server-renderer@^2.6.8")
	var path = moduleinfo.folder

	var outfile = Path.join(__dirname, "server.renderer.js")

	var bundler = new Bundler(path)
	bundler.filter= function(path){
		return !path.endsWith(".ts")
	}
	bundler.disableTranspile = true
	bundler.packageJsonSupport = true
	bundler.virtualName = `vue-server-renderer-2.6`
	await bundler.writeToFile(outfile).bundle()
}

init()