var Registry

//import Registry from '../../std/package/registry.js'

var load= async function(){
    try{
        Registry= await KModule.import('/virtual/@kawix/std/package/registry.js')
        Registry= Registry.default || Registry
    }catch(e){
        Registry= await KModule.import('https://kwx.kodhe.com/x/std/package/registry.js')
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
