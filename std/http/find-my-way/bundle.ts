import Bundler from '../../package/bundle'
import Registry from '../../package/registry'
import Path from 'path'

var init= async function(){
    var reg= new Registry()
    var moduleinfo= await reg.resolve("find-my-way@^2.0.1")
    var path= moduleinfo.folder 
    
    var outfile= Path.join(__dirname, "mod.js")

    var bundler= new Bundler(path)
    bundler.packageJsonSupport= true 
    bundler.virtualName= `find-my-way$v$${moduleinfo.version}/node_modules`
    await bundler.writeToFile(outfile).bundle()
}

init()