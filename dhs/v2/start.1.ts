import {Service} from './service'
import Cluster from 'cluster'

main()
async function main(){

    let server = new Service(null)
    await server.$register(process.pid)

    if(Cluster.isMaster){
        console.info("Cluster started...")
    }else{
        process.send("Cluster started...")
    }
    

}