import Path from 'path'
import fs from 'fs'


fs.writeFileSync(Path.join(__dirname, "hotreloading.src.js"),
	fs.readFileSync(Path.join(__dirname, "hotreloading.src.1.js")))


var init= async function(){
	var result= await KModule.import(__dirname + "/hotreloading.src.js")
	console.info("Result: ", result.default)
	

	setTimeout(function(){
		// write new content and will be reloaded
		fs.writeFileSync(Path.join(__dirname, "hotreloading.src.js"),
			fs.readFileSync(Path.join(__dirname, "hotreloading.src.2.js")))
		
		// ensure modify mtime for get reloaded
		fs.utimesSync(Path.join(__dirname, "hotreloading.src.js"),new Date(), new Date())
	}, 1000)

	await new Promise(function(resolve){
		setTimeout(resolve, 6100)
	})
	result = await KModule.import(__dirname + "/hotreloading.src.js")
	console.info("Result: ", result.default)
	
}
init()


