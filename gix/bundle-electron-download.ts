import Bundler from '../std/package/bundle'
import Registry from '../std/package/registry'
import Path from 'path'

var init = async function () {
	var reg = new Registry()
	var moduleinfo = await reg.resolve("electron-download@4.1.1")
	var path = moduleinfo.folder

	var outfile = Path.join(__dirname, "electron-download.js")

	var bundler = new Bundler(path)
	bundler.disableTranspile = true
	bundler.packageJsonSupport = true
	bundler.virtualName = `electron-download@${moduleinfo.version}`
	await bundler.writeToFile(outfile).bundle()
}

init()