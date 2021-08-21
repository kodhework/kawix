

import {Service} from './service'
import Os from 'os'


let service = null


export async function create(config){

    if(typeof config == "string"){
        config = await import(config)
        config = config.default || config.config || config
    }

    return {
        service: new Service(config),
        config
    }
}


export async function start(config, service){


    if(typeof config == "string"){
        process.env.DHS_CONFIG_FILE = config
        config = await import(config)
        config = config.default || config.config || config
    }

    if(!service){
        let props = await create(config)
        service = props.service
    }


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
    init()
    //console.info("HERE...")
    /*
    setTimeout(() => {
        return service.restart()
    }, 20000)
    */
}

if(process.env.DHS_CONFIG_FILE){
    start(process.env.DHS_CONFIG_FILE)
}
