let argv = process.argv.slice(2)
let appArguments = []
let optionArguments = []
let force = false 
let version = null 

for(let i=2;i<process.argv.length;i++){
    let arg = process.argv[i]    
    if(!appArguments.length && arg.startsWith("-")){
        optionArguments.push(arg)
        if (arg == "--original-file") {
            optionArguments.push(process.argv[++i])
        }
        else if (arg == "--map") {
            optionArguments.push(process.argv[++i])
        }
        else if (arg == "--force") {
            force = true 
        }
        else if (arg == "--use") {
            version = (process.argv[++i])
        }
    }
    else{
        appArguments.push(arg)
    }
}

if(version){
    let newFile = __dirname + "/../../core." + version + "/bin/cli"
    require(newFile)
    return 
}

var Kawix = require("../main")
if(force){
    Kawix.KModule.defaultOptions = {
        force: true
    }
}


Kawix.argv = argv
Kawix.appArguments = appArguments
Kawix.optionArguments = optionArguments
Kawix.startupArguments = Kawix.appArguments.slice(1)
// NOW LOAD TRANSPILED CLI
return Kawix.KModule.import(__dirname + "/pcli")