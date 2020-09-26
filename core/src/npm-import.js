var Registry

//import Registry from '../../std/package/registry.js'

var load= async function(){
    var pack1 = require("../package.json")
    try{
        Registry= await KModule.import('/virtual/@kawix/std/package/registry.yarn')
        Registry= Registry.default || Registry
    }catch(e){

        /* try determine the latest version */
        //var pack = await KModule.import("gh+/kodhework/kawix/std/package.json")
        //if(pack.version < pack1.stdVersion) pack.version = pack1.stdVersion

		// LOADLIB FROM GITHUB
        await KModule.import('gh+/kodhework/kawix@std'+pack1.stdVersion+'/std/dist/register.js')

		Registry= await KModule.import('/virtual/@kawix/std/package/registry.yarn')
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
