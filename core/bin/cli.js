let argv = process.argv.slice(2)
let appArguments = []
let optionArguments = []
let force = false 
let version = null 
let useSplice = -1

let originalArgv = [].concat(process.argv)

for(let i=2;i<process.argv.length;i++){
    let arg = process.argv[i]    
    if(!appArguments.length && arg.startsWith("-")){
        optionArguments.push(arg)
        process.argv[i] = undefined 
        if (arg == "--original-file") {
            optionArguments.push(process.argv[++i])
            process.argv[i] = undefined 
        }
        else if (arg == "--map") {
            optionArguments.push(process.argv[++i])
            process.argv[i] = undefined 
        }
        else if (arg == "--force") {
            force = true 
        }
        else if (arg == "--use") {
            useSplice = i
            version = (process.argv[++i])
            process.argv[i] = undefined 
        }
    }
    else{
        appArguments.push(arg)
    }
}

if(version){
    originalArgv.splice(useSplice, 2)
    process.argv = originalArgv
    let newFile = __dirname + "/../../core." + version + "/bin/cli.js"
    require(newFile)
    return 
}

process.argv = process.argv.filter((a)=>!!a)
var Kawix = require("../main")
if(force){
    Kawix.KModule.defaultOptions = {
        force: true
    }
}


Kawix.argv = argv
Kawix.originalArgv = originalArgv
Kawix.appArguments = appArguments
Kawix.optionArguments = optionArguments
Kawix.startupArguments = Kawix.appArguments.slice(1)
// NOW LOAD TRANSPILED CLI
return Kawix.KModule.import(__dirname + "/pcli")