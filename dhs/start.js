import './src/mod.js'
import Service from './src/service'
import Config from './src/config'
import Path from 'path'


init()

async function init(){
    try{
        if(!process.env.KAWIX_O_CONFIG)
            process.env.KAWIX_O_CONFIG = Path.join(__dirname, "src", "default.cson")
        
        var service = new Service(new Config(process.env.KAWIX_O_CONFIG))
        await service.start()
    }catch(e){
        console.error("ERROR: ", e)
    }
}