// enable coffeescript and cson
import '../../std/coffeescript/register.js'
import '../../std/coffeescript/cson/register.js'
// this is specific of @kawix/core
if(global.kawix ){
	kawix.KModule.addVirtualFile("@kawix/dhs", {
		redirect:module.realPathResolve(".."),
		isdirectory: true
	})
	kawix.KModule.addVirtualFile("@kawix/std", {
		redirect:module.realPathResolve("../../std"),
		isdirectory: true
	})
	kawix.KModule.addVirtualFile("@kawix/gix", {
		redirect:module.realPathResolve("../../gix"),
		isdirectory: true
	})
	//console.info(kawix.KModule._virtualredirect)

}
