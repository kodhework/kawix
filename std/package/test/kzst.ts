import {Archiver} from '../../compression/kzt/Archiver'
import {Unarchiver} from '../../compression/kzt/Unarchiver'
import fs from '/virtual/@kawix/std/fs/mod'
main()
async function main(){
    try{
        /*
        let archiver= new Archiver()
        archiver.filter = function(path){
            if(path.startsWith(".") && path != ".") return false 
            if(path.startsWith("database/")) return false 
        }
        let out = fs.createWriteStream(__dirname + "/File.zst")
        archiver.pipe(out)
        await archiver.addFile("/home/james/developer/educarte", ".")
        await archiver.write()
*/
        


        let unarchiver = new Unarchiver(__dirname + "/File.zst")
        let metadata = await unarchiver.readMetadata()
        console.info("metadata: ",metadata)
        let content = await unarchiver.getFileContent("ui/index.kivi.html")
        console.info("data: ",content.toString())

        await unarchiver.extractAllTo("/home/james/educarte2")
    }catch(e){
        console.error(e)
    }

}