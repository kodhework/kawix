var arg, kawix, n, id
for(var i=0;i<process.argv.length;i++){
	arg= process.argv[i]
	if(arg.indexOf("kawix")>=0){
		// require kawix core
		kawix= require(arg)
		n= true
	}else if(n){
		id= arg 
		break 
	}
}


var init1= function(){
	if(kawix){
		kawix.KModule.injectImport()
		kawix.KModule.import(__dirname + "/start.js").then(function(response){
			response.default(id).then(function(){

			}).catch(function(e){
				console.error("Failed execute: ", e)
				process.exit(10)	
			})
		}).catch(function(e){
			console.error("Failed execute: ", e)
			process.exit(10)	
		})
	}
}
require("electron").app.once("ready", init1)