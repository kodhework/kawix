if(global.kawix ){

	let dhs = module.realPathResolve("..")
	if(!dhs.startsWith("/virtual")){ 

		var redirs= kawix.KModule._virtualredirect
		var a
		a= redirs.filter(function(a){
			return a.isdirectory && a.resolvedpath == "/virtual/@kawix/dhs"
		})
		if(!a.length){		
			kawix.KModule.addVirtualFile("@kawix/dhs", {
				redirect: dhs,
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

		a = redirs.filter(function (a) {
			return a.isdirectory && a.resolvedpath == "/virtual/@kawix/kivi"
		})
		if(!a.length){
			kawix.KModule.addVirtualFile("@kawix/kivi", {
				redirect:module.realPathResolve("../../kivi"),
				isdirectory: true
			})
		}
	}
}
