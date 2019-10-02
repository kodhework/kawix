
// kweb is a specific format
// to use in kwcore 

import * as async from '../../util/async'
import fs from 'fs'
import _fs from '../../fs/mod'
import Zlib from 'zlib'
import Os from 'os'


let FDs = {

}

let FDFiles = {

}

fs.open = async function(path, flags){
    let cont = true  
    if(path && path.startsWith("kweb+/")){
        cont = false 
        let parts = path.split(">")
        let id = parts[0]
        id = id.substring(6)
        if(!FDFiles[id]){
            FDFiles[id] = {
                file: id,
                fd: await _fs.openAsync(id, "r")
            }
        }

        let fd0 = FDFiles[id]

        if(!fd0.header){
            // READ THE FIRST 4 BYTES TO DETERMINE THE HEADER SIZE
            let bf0 = Buffer.allocUnsafe(4)
            let leido0 = await _fs.readAsync(fd0.fd, bf0, 0, 4, 0)
            if(leido0.bytesRead < 4)
                throw new Error("Failed to open kweb file")

            let hcount = bf0.readInt32LE(0)

            // read HCOUNT
            bf0 = Buffer.allocUnsafe(hcount)
            leido0 = await _fs.readAsync(fd0.fd, bf0, 0, bf0.length, 4)
            if (leido0.bytesRead < 4)
                throw new Error("Failed to open kweb file")
            let head0 =  Zlib.gunzipSync(bf0)
            let head = head0.toString()
            try{
                head = JSON.parse(head)
            }catch(e){
                throw new Error("Failed to parse kweb file")
            }

            fd0.header = head
        }

        let path = parts[1]
        if(Os.platform() == "win32"){
            path = path.replace(/\//g,"/")
        }

        if(fd0.header[path]){

            // open from path 
            let fid = FDs[id + "-" + path]
            if(!fid){
                
            }

        }else{
            cont = true 
        }

    }
}