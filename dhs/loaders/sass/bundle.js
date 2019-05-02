import Bundler from '../../../std/package/bundle.js'
import Registry from '../../../std/package/registry.js'
import Path from 'path'

var init = async function () {
	var reg = new Registry()
	var moduleinfo = await reg.resolve("sass@1.19.0")
	var path = moduleinfo.folder

	var outfile = Path.join(__dirname, "runtime.js")

	var bundler = new Bundler(path)
	bundler.filter = function (path) {
		return !path.endsWith(".ts")
	}
	bundler.disableTranspile = true
	bundler.packageJsonSupport = true
	bundler.virtualName = `sass@1.19.0`
	await bundler.writeToFile(outfile).bundle()
}

init()