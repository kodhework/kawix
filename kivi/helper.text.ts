import fs from 'fs'
main()
async function main(){
    var content = fs.readFileSync(__dirname + "/helper.txt", 'utf8')
    var datab= Buffer.from(content).toString('base64')
    
    while(datab){
        let line = datab.substring(0, 128)
        datab= datab.substring(128)
        console.info(line)
    }
}