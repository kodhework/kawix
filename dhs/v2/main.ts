import {Service} from './service'
import Path from 'path'

main()
async function main(){

    process.env.DHS_BASE_DIR = '/home/james/tdhs'
    let serv = new Service({
        id: 'kowix.https',
        cluster: [{
            "address": process.env.DHS_HTTP_ADDRESS || "0.0.0.0:8080",
            "purpose": "default",
            "count": process.env.CLUSTER_CPUS ? parseInt(process.env.CLUSTER_CPUS) : 'all'
        }, {
            "address": process.env.DHS_HTTPS_ADDRESS || "0.0.0.0:4430",
            "purpose": "default",
            "count": process.env.CLUSTER_CPUS ? parseInt(process.env.CLUSTER_CPUS) : 'all',
            "httpOptions": {
            ssl: true,
            keyFile: Path.join(__dirname, "functions", "nginx", "kowix.dev.key"),
            certFile: Path.join(__dirname, "functions", "nginx", "kowix.dev.crt")
            }
        }, {
            "address": "0.0.0.0:44001",
            "purpose": "tasks",
            "count": 1,
            "env": {
            "CRON_ENABLED": 1,
            "MEMSHARING": 1
            }
        }],
        "maxqueuecount": 50,
        "maxconcurrent": 100000,
        include: ["./*/app.config.*", "./sites/*/app.config.*", "./*.kwa"]
    })
    
    //await serv.$startManager()
    //await serv.start()
    await serv.fork("control")

    await serv.fork("http", "cluster")
    await serv.fork("http", "cluster")
    await serv.fork("http", "cluster")

    await serv.start()

    //await serv.fork("http", "cluster")

    

}