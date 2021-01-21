
if(process.env.DHS_LIBRARY_LOCATIONS){
	let redirs = JSON.parse(process.env.DHS_LIBRARY_LOCATIONS)
	for(let redir of redirs){
		kawix.KModule.addVirtualFile(redir.path, redir.data)
	}
}

else{

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

		a = redirs0.filter(function (a) {
			return a.isdirectory && a.resolvedpath == "/virtual/@kawix/kivi"
		})
		if(!a.length){
			let r = redirs["@kawix/kivi"] || {
				redirect:module.realPathResolve("../../kivi"),
				isdirectory: true
			}
			kawix.KModule.addVirtualFile("@kawix/kivi", r)
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
		}

		
	}
}


let redirs = kawix.KModule._virtualredirect.map(function(a){
	return {
		path: a.resolvedpath.substring(8),
		data: {
			redirect: a.redirect,
			isdirectory: a.isdirectory
		}
	}
})
process.env.DHS_LIBRARY_LOCATIONS = JSON.stringify(redirs)