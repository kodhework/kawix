import Bundler from '../package/bundle.js'
import Registry from '../package/registry.js'
import Path from 'path'

var init= async function(){
    var reg= new Registry()
    var moduleinfo= await reg.resolve("coffeescript","^2.3.2")
    var path= moduleinfo.folder 

    
    
    var outfile= Path.join(__dirname, "runtime.js")

    var bundler= new Bundler(path)
    bundler.packageJsonSupport= true 
    bundler.disableTranspile=true
    bundler.virtualName= `coffeescript$v$${moduleinfo.version}`
    await bundler.writeToFile(outfile).bundle()
}

init()