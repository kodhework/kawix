import Static from './serve-static/mod'
import * as async from '../util/async'

var KHStatic= function(path, options){
	var st= Static(path, options)

	return function(env): Promise<void>{

		var def= new async.Deferred<void>()
		env.response.once("finish",def.resolve)
		st(env.request, env.response, def.resolve)
		return def.promise
	}
}

export default KHStatic
