var Registry

//import Registry from '../../std/package/registry.js'

var load= async function(){
    try{
        var pack1 = require("../package.json")
        Registry= await KModule.import('/virtual/@kawix/std/package/registry.yarn')
        Registry= Registry.default || Registry
    }catch(e){

        /* try determine the latest version */
        var pack = await KModule.import("https://kwx.kodhe.com/x/std/package.json", {
            force: true 
        })
        if(pack.version < pack1.version) pack.version = pack1.version

        
        Registry= await KModule.import('https://kwx.kodhe.com/x/v/'+pack.version+'/std/package/registry.yarn')
        Registry= Registry.default || Registry
    }
}

exports.require= exports.import= async function(module, options){
    if(!Registry)
        await load()
    var noptions= Object.assign({},options || {})
    delete noptions.url
    var reg= new Registry(noptions)
    return await reg.require(module)

}

exports.resolve= async function(module, options){
    if(!Registry)
        await load()
    var noptions= Object.assign({},options || {})
    delete noptions.url
    var reg= new Registry(noptions)
    return await reg.resolve(module)

}
