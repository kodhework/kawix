import Bundler from '../../package/bundle.js'
import Registry from '../../package/registry.js'
import Path from 'path'

var init = async function () {
	var reg = new Registry()
	var moduleinfo = await reg.resolve("serve-static@^1.13.2")
	var path = moduleinfo.folder

	var outfile = Path.join(__dirname, "mod.js")

	var bundler = new Bundler(path)
	bundler.disableTranspile = true
	bundler.packageJsonSupport = true
	bundler.virtualName = `serve-static$v$${moduleinfo.version}`
	await bundler.writeToFile(outfile).bundle()
}

init()