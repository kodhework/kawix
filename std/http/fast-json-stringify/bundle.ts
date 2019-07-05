import Bundler from '../../package/bundle'
import Registry from '../../package/registry'
import Path from 'path'

var init= async function(){
    var reg= new Registry()
    var moduleinfo= await reg.resolve("fast-json-stringify@^1.11.3")
    var path= moduleinfo.folder 
    
    var outfile= Path.join(__dirname, "mod.js")

    var bundler= new Bundler(path)
    bundler.packageJsonSupport= true 
    bundler.disableTranspile= true 
    bundler.virtualName= `fast-json-stringify$v$${moduleinfo.version}/node_modules`
    await bundler.writeToFile(outfile).bundle()
}

init()