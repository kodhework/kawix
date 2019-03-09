// register coffee
import {register} from './register'
register() 


var init= async function(){
    var Example= await kawix.KModule.import(__dirname + "/example.coffee")
    Example.start()
}
init()