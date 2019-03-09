// register coffee
import {register} from './register'
register() 



var init= async function(){
    var data= await kawix.KModule.import(__dirname + "/example.cson")
    console.info(data)
}
init()