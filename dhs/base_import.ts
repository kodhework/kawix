
export async function kawixPreload(){

	try{
		await import("/virtual/@kawix/std/package.json")
	}catch(e){
		// import from URL
		await import("https://kwx.kodhe.com/x/v/0.9.0/std/dist/register")
	}

}
