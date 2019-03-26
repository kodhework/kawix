import Bundler from '../../bundle.js'
import Registry from '../../registry.js'
import Path from 'path'

var init = async function () {
	var reg = new Registry()
	var moduleinfo = await reg.resolve("pug-runtime@^2.0.4")
	var path = moduleinfo.folder

	var outfile = Path.join(__dirname, "runtime.js")

	var bundler = new Bundler(path)
	bundler.disableTranspile = true
	bundler.packageJsonSupport = true
	bundler.virtualName = `pug-runtime_2`
	await bundler.writeToFile(outfile).bundle()
}

init()