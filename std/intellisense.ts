import Os from 'os'
import Path from 'path'
import fs from 'fs'
main()
function main(){
    if(Os.platform() == "win32"){
        var virtual = Path.join(process.env.SYSTEMDRIVE, "virtual")
        if(!fs.existsSync(virtual)){
            fs.mkdirSync(virtual)
        }
        virtual = Path.join(virtual, "@kawix")
        fs.symlinkSync(Path.dirname(__dirname), virtual, "junction")
    }
}