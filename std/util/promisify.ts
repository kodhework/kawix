//import Util from 'util'
import fs from 'fs'
class Promisify{

    static promisifyAll(object, newobject, suffix ){
        newobject= newobject || {}
        suffix= suffix || ""
        var names= Object.getOwnPropertyNames(object)
        for(var i=0;i<names.length;i++){
            let name= names[i]
            if(!suffix || !name.endsWith(suffix)){
                if(object != fs || (name != "SyncWriteStream" && name!="promises")){
                    if(newobject[name+suffix] === undefined){
                        let func= object[name]
                        if(typeof func == "function"){
                            func= func.bind(object)
                            newobject[name+suffix]= Promisify.promisify(func)
                        }
                    }
                }
            }
        }
        return newobject 
    }

    static promisifyAllWithSuffix(object, suffix = 'Async'){
        return Promisify.promisifyAll(object,object,suffix)
    }


    
    static promisify(func){
        /*
        if(typeof Util.promisify == "function"){
            return Util.promisify(func)
        }
        else{*/
            return function(...args){
                var vm= this
                return new Promise(function(resolve,reject){                
                    args.push(function(err,data){
                        if(err) return reject(err)
                        return resolve(data)
                    })
                    func.call(vm, ...args)
                })
            }
        //}
    }


}
export default Promisify