import stdlibPath from './stdlib'
import dhsPath from './../../dhs/dist/dhs'
init()
async function init(){
	
	
	kawix.KModule.addVirtualFile("@kawix/std", {
		redirect: stdlibPath.dirname,
		isdirectory: true
	})
	kawix.KModule.addVirtualFile("@kawix/dhs", {
		redirect: dhsPath.dirname,
		isdirectory: true
	})

	
	
	var Dhs = await import("/virtual/@kawix/dhs/src/mod")
	console.info(Dhs)

	

}