var Kawix = require("../main")

Kawix.argv = process.argv.slice(2)
Kawix.appArguments = []
Kawix.optionArguments = []

for(let i=2;i<process.argv.length;i++){
    let arg = process.argv[i]    
    if(!Kawix.appArguments.length && arg.startsWith("-")){
        Kawix.optionArguments.push(arg)
        if (arg == "--original-file") {
            Kawix.optionArguments.push(process.argv[++i])
        }
        else if (arg == "--map") {
            Kawix.optionArguments.push(process.argv[++i])
        }
    }
    else{
        Kawix.appArguments.push(arg)
    }
}

Kawix.startupArguments = Kawix.appArguments.slice(1)

// NOW LOAD TRANSPILED CLI
return Kawix.KModule.import(__dirname + "/pcli")