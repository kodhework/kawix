import Bundler from '../std/package/bundle.js'
import Registry from '../std/package/registry.js'
import Path from 'path'

var init = async function () {
	var reg = new Registry()
	var moduleinfo = await reg.resolve("extract-zip@1.6.7")
	var path = moduleinfo.folder

	var outfile = Path.join(__dirname, "extract-zip.js")

	var bundler = new Bundler(path)
	bundler.disableTranspile = true
	bundler.packageJsonSupport = true
	bundler.virtualName = `extract-zip@${moduleinfo.version}`
	await bundler.writeToFile(outfile).bundle()
}

init()