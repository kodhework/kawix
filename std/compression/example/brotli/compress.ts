import {Archiver} from  '../../kzt/Archiver'
import fs from 'fs'
main()
async function main(){
    const st = fs.createWriteStream(__dirname + "/kzt-code.kzt")
    let archiver = new Archiver()

    archiver.pipe(st)
    await archiver.createDirectory("kzt")
    await archiver.addFile(__dirname + "/../../kzt/Archiver.ts", "kzt/Archiver.ts")
    await archiver.addFile(__dirname + "/../../kzt/Unarchiver.ts", "kzt/Unarchiver.ts")
    await archiver.write()

}