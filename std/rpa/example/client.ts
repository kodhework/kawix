import {Channel} from '../channel.v2'

main()

async function main(){

    let c = new Channel("test.0")
    await c.connectLocal()

    let time = Date.now() , res = 0
    for(let i=0;i<100;i++){
        res = await c.client.create()   
    }
    console.info(res, Date.now()-time)

    c.client.func(function(msg){
        console.log('here:'+msg)
    })

}