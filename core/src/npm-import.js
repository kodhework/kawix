//import Registry from 'https://raw.githubusercontent.com/voxsoftware/kawix-std/master/package/registry.js'

import Registry from '../../std/package/registry.js'

exports.require= exports.import= async function(module, options){

    var noptions= Object.assign({},options || {})
    delete noptions.url
    var reg= new Registry(noptions)
    return await reg.require(module)

}

exports.resolve= async function(module, options){

    var noptions= Object.assign({},options || {})
    delete noptions.url
    var reg= new Registry(noptions)
    return await reg.resolve(module)

}