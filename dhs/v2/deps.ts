if(global.kawix ){

	let redirs = {}
	if(process.env.DHS_LIBRARY_LOCATIONS)
		redirs = JSON.parse(process.env.DHS_LIBRARY_LOCATIONS)

	let dhs = module.realPathResolve("..")
	if(!dhs.startsWith("/virtual")){ 
		var redirs0= kawix.KModule._virtualredirect
		var a
		a= redirs0.filter(function(a){
			return a.isdirectory && a.resolvedpath == "/virtual/@kawix/dhs"
		})
		if(!a.length){		
			let r = redirs["@kawix/dhs"] || {
				redirect: dhs,
				isdirectory: true
			}
			kawix.KModule.addVirtualFile("@kawix/dhs", r)
		}
		else{
			redirs["@kawix/dhs"] = {
				redirect: a[0].redirect,
				isdirectory: true
			}
		}

		a = redirs0.filter(function (a) {
			return a.isdirectory && a.resolvedpath == "/virtual/@kawix/std"
		})
		if(!a.length){
			let r = redirs["@kawix/std"] || {
				redirect:module.realPathResolve("../../std"),
				isdirectory: true
			}
			kawix.KModule.addVirtualFile("@kawix/std", r)
		}
		else{
			redirs["@kawix/std"] = {
				redirect: a[0].redirect,
				isdirectory: true
			}
		}

		a = redirs0.filter(function (a) {
			return a.isdirectory && a.resolvedpath == "/virtual/@kawix/kivi"
		})
		if(!a.length){
			let r = redirs["@kawix/kivi"] || {
				redirect:module.realPathResolve("../../kivi"),
				isdirectory: true
			}
			kawix.KModule.addVirtualFile("@kawix/kivi", r)
		}else{
			redirs["@kawix/kivi"] = {
				redirect: a[0].redirect,
				isdirectory: true
			}
		}


		a = redirs0.filter(function (a) {
			return a.isdirectory && a.resolvedpath == "/virtual/@kawix/gix"
		})
		if(!a.length){
			let r = redirs["@kawix/gix"] || {
				redirect:module.realPathResolve("../../gix"),
				isdirectory: true
			}
			kawix.KModule.addVirtualFile("@kawix/gix", r)
		}else{
			redirs["@kawix/gix"] = {
				redirect: a[0].redirect,
				isdirectory: true
			}
		}

		process.env.DHS_LIBRARY_LOCATIONS = JSON.stringify(redirs)
	}
}
