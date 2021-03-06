import './base_import'
import Bundler from '/virtual/@kawix/std/package/bundle'
import Registry from '/virtual/@kawix/std/package/registry'
import Path from 'path'

var init = async function () {
    var reg = new Registry()
    var path = Path.join(__dirname, "..","..","parse5","packages","parse5")

    var outfile = Path.join(__dirname, "parse5.js")

    var bundler = new Bundler(path)
    bundler.disableTranspile = true
    bundler.packageJsonSupport = true
    bundler.virtualName = `parse5_mod`
    await bundler.writeToFile(outfile).bundle()
}

init()
