import * as Installer from '../electron-install'

main()
async function main(){
    try{

        var text = ` ██████╗ ██╗██╗  ██╗    
██╔════╝ ██║╚██╗██╔╝    
██║  ███╗██║ ╚███╔╝     
██║   ██║██║ ██╔██╗     
╚██████╔╝██║██╔╝ ██╗    
 ╚═════╝ ╚═╝╚═╝  ╚═      
 `
        var lines= text.split("\n")
        console.info("\n")
        for(var i=0;i<lines.length;i++){
            let line= lines[i]
            let count = parseInt(((process.stdout.columns - line.length) / 2).toString())
            
            let y= 0
            while(y < count){
                process.stdout.write(" ")
                y++
            }
            console.info(line)
        }
        
        console.info("\n  Installing ...")
        await Installer.install()


    }catch(e){
        console.error("  > Failed installing module: ", e)
        console.info("  Press ENTER for exit")
        process.stdin.on("data", function(){
            process.exit()
        })
        setTimeout(function(){}, 500000)
    }
}