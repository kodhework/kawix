import Static from './serve-static/mod'

var deferred= function(){
	var def={}
	def.promise= new Promise(function(a,b){
		def.resolve= a
		def.reject = b
	})
	return def

}
var KHStatic= function(path, options){
	var st= Static(path, options)

	return function(env){

		var def= deferred()
		env.response.once("finish",def.resolve)
		st(env.request, env.response, def.resolve)
		return def.promise
	}
}

export default KHStatic
