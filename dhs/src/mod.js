// enable coffeescript and cson

import '../../std/coffeescript/register'
import '../../std/coffeescript/cson/register'
// this is specific of @kawix/core
if(global.kawix ){
	var redirs= kawix.KModule._virtualredirect
	var a
	a= redirs.filter(function(a){
		return a.isdirectory && a.resolvedpath == "/virtual/@kawix/dhs"
	})
	if(!a.length){
		kawix.KModule.addVirtualFile("@kawix/dhs", {
			redirect:module.realPathResolve(".."),
			isdirectory: true
		})
	}

	a = redirs.filter(function (a) {
		return a.isdirectory && a.resolvedpath == "/virtual/@kawix/std"
	})
	if(!a.length){
		kawix.KModule.addVirtualFile("@kawix/std", {
			redirect:module.realPathResolve("../../std"),
			isdirectory: true
		})
	}
	/*
	kawix.KModule.addVirtualFile("@kawix/gix", {
		redirect:module.realPathResolve("../../gix"),
		isdirectory: true
	})*/
	//console.info(kawix.KModule._virtualredirect)
}
