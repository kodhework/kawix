

import {Service} from './service'
import Os from 'os'

if(process.env.DHS_CONFIG_FILE){
    start(process.env.DHS_CONFIG_FILE)
}


export async function start(config){

    if(typeof config == "string"){
        config = await import(config)
        config = config.default || config.config || config
    }

    // start from config.
    // generate forks
    let service = new Service(config)
    let init = async function(){
        try{

            if(config.singleprocess){
                await service.start()
            }
            else{

                for(let i=0;i<config.cluster.length;i++){
                    let cluster = config.cluster[i]
                    cluster.count = (cluster.count == "all") ? Os.cpus().length : cluster.count
                    if(cluster.max)cluster.count = Math.min(cluster.count, cluster.max)
                    if(cluster.min)cluster.count = Math.max(cluster.count, cluster.min)
                    let type = (cluster.count <= 1) ? "fork" : "cluster"
                    for(let y=0;y<cluster.count; y++){
                        await service.fork(cluster.purpose, type, cluster)
                    }
                }
                await service.start()
            }
        }catch(e){
            console.error("[ERROR] Failed starting DHS:", e.message)
            process.exit(1)
        }
    }

    service.configureStart(init)
    await init()

    /*
    setTimeout(() => {
        return service.restart()
    }, 20000)
    */
}
