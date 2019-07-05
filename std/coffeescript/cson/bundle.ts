import Bundler from '../../package/bundle'
import Registry from '../../package/registry'
import Path from 'path'

var init= async function(){
    var reg= new Registry()
    var moduleinfo= await reg.resolve("cson-parser","^4.0.2")
    var path= moduleinfo.folder 

    
    
    var outfile= Path.join(__dirname, "runtime.js")

    var bundler= new Bundler(path)
    bundler.packageJsonSupport= true 
    bundler.disableTranspile=true
    bundler.virtualName= `cson-parser$v$${moduleinfo.version}`
    await bundler.writeToFile(outfile).bundle()
}

init()