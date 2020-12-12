import {Unarchiver} from  '../../kzt/Unarchiver'
import Path from 'path'

main()
async function main(){

    let un = new Unarchiver(__dirname + "/kzt-code.kzt")
    await un.extractAllTo(Path.join(__dirname, "data"))



}