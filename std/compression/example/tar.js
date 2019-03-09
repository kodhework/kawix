
// cli basic example using tar
import tar from '../tar.js'
import fs from '../../fs/mod.js'
var cli= async function(){
    
    try{
        var stdInBuf= [], resolve
        process.stdin.on("data", function(buf){
            stdInBuf.push(buf)
            if(resolve){
                var c= resolve 
                resolve= null 
                c()
            }
        })
        var read= async function(){
            var b 
            var getData= function(){
                if(stdInBuf.length){
                    b= stdInBuf 
                    stdInBuf = []
                    return Buffer.concat(b).toString('utf8').trim()
                }
                return ''
            }
            if(stdInBuf.length){
                return getData()
            }
            else{
                return new Promise(function(r){
                    resolve= function(){
                        r(getData())
                    }
                })
            }
        }

        console.log(" > Please specify an action: x (extract) | c (compress)")
        process.stdin.resume()
        var path1, path2
        var action= await read() 
        process.stdin.pause()

        var goodActions= ["c","x","extract","compress"]
        if(goodActions.indexOf(action) < 0){
            throw new Error("Action is not valid")
        }

        if(action == "x" || action== "extract"){
            console.log(" > Please write the path to the .tar.gz file")
            process.stdin.resume()
            path1= await read()
            console.log(" > Please write the destination path")
            path2= await read()
            
            console.log(` > Ok, you selected extract ${path1} onto ${path2}. Type y for confirm:`)
            if((await read())[0] == "y"){
                console.log(" > Trying to extracting. Please wait ...")
                try{
                    await fs.mkdirAsync(path2)
                }catch(e){}
                await tar.x({
                    C: path2,
                    file: path1
                })
                console.log(" > Finished")
            }
             
        }

        if(action == "c" || action== "compress"){
            console.log(" > Please write the path to the .tar.gz file")
            process.stdin.resume()
            path1= await read()
            console.log(" > Please write the path to compress")
            path2= await read()
            
            console.log(` > Ok, you selected compress ${path2} to file ${path1}. Type y for confirm:`)
            if((await read())[0] == "y"){

                console.log(" > Trying to compressing. Please wait ...")
                await tar.c({
                    C: path2,
                    file: path1,
                    gzip: true
                },['.'])
                console.log(" > Finished")
            }
        }
        
    }catch(e){
        console.error(" > ERROR: ",e.message)
    }
    process.exit()
}
cli()



