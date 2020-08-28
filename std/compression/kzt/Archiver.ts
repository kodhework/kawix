
// kzst is an archiver based on zstd compression
// allow add files and other thinks 
import fs from '../../fs/mod'
import {Writable, Readable} from 'stream'
//import 'npm://zstd-codec@0.1.2'
//import {ZstdCodec} from 'zstd-codec'
import Path from 'path'
import * as async from '../../util/async'
import {FileStat} from './types'
import { Stats } from 'fs'
// import Glob from '../../../dhs/glob/mod'
let ZstdCodec = null

export class Archiver extends Readable{
    _zstd = null 
    followSymlinks = false 
    _buf = []

    _position = 0
    _cposition = 0
    _files = []
    _blocks = []
    _Streaming = null
    _workingLength = 0
    _uncompressedLength = 0

    filter: Function = null

    constructor(){
        super()
        //this._tempstream = fs.createWriteStream(Path.join(Os.tmpdir(), ))
    }
    
    _read(){

    }

    async addBuffer(content: ArrayBufferLike, stat:FileStat, path:string){


        if(typeof this.filter == "function"){
            if(this.filter(path, content, stat) === false) return 
        }


        let data = Buffer.from(content)
        let start = this._blocks.length 
        let offset = this._uncompressedLength
        this._addBuffer(data)
        this._files.push({
            path,
            stat,
            length: data.length,
            offset,
            block: start
        })
    }
    

    async createDirectory(path: string){
        let stat: FileStat = {
            isdirectory: true,
            mtimeMs: Date.now(),
            atimeMs: Date.now()
        }
        this._files.push({
            path,
            stat,
            length: 0,
            block: -1
        })
    }

    async _addDirectory(directory: string, stat: FileStat, path: string){
        
        let files = await fs.readdirAsync(directory)
        this.createDirectory(path)
        for(let file of files){
            await this.addFile(Path.join(directory, file), Path.join(path,file))
        }
    }

    async addFile(file:string, path: string){

        if(typeof this.filter == "function"){
            if(this.filter(path,file) === false) return 
        }

        let stat:Stats = null
        if(this.followSymlinks){
            stat = await fs.statAsync(file)
        }else{
            stat = await fs.lstatAsync(file)
        }

        let nstat:FileStat = {}
        if(stat.isSymbolicLink()){
            nstat.issymlink = true 
        }
        else if(stat.isFile()){
            nstat.isfile = true 
        }
        else if(stat.isDirectory()){
            nstat.isdirectory = true 
            return this._addDirectory(file, nstat, path)
        }else{
            // not supported file
            return 
        }

        let start = this._blocks.length
        let fsr = fs.createReadStream(file)
        fsr.on("error", (e)=> this.emit("error",e))
        let offset = this._uncompressedLength
        let info = await this._compressStreamToZstd(fsr)

        this._files.push({
            path,
            stat:nstat,
            offset,
            length: info.uncompressedLength,
            block: start
        })

        
    }

    write(){
        if(this._buf.length){
            this._gcompress()
        }

        // writeBlocksAndFiles 
        let json = JSON.stringify({
            blocks: this._blocks,
            files: this._files
        })
        let data = Buffer.from(json)
        this._buf = [data]
        this._gcompress()
        this.push(Buffer.from("#kzst"))
        let len = Buffer.allocUnsafe(4)
        len.writeUInt32LE(this._blocks.pop().compressedLength,0)
        this.push(len)
        this.push(null)

        let def = new async.Deferred<void>()
        this.once("end", def.resolve)
        return def.promise
    }

    _addBuffer(content){
        let portion = 5*1024*1024
        while(content.length){
            let b = content.slice(0,4096) 
            this._buf.push(b)
            this._workingLength += b.length
            this._uncompressedLength += b.length
            content = content.slice(4096)

            if(this._workingLength >= portion){
                this._gcompress()
            }
        }
    }

    _gcompress(){
        let data = this._Streaming.compress(Buffer.concat(this._buf), 5)
        //console.log("h: ", data)
        this._buf.splice(0, this._buf.length)
        this.push(data)
        this._blocks.push({
            number: this._blocks.length,
            offset: this._position,
            length: this._workingLength,
            compressedOffset: this._cposition,
            compressedLength: data.length
        })
        this._position += this._workingLength
        this._cposition += data.length
        this._workingLength = 0
        
    }

    async _compressStreamToZstd(streamin){
        if(!this._zstd){
            let def = new async.Deferred<any>()
            if(!ZstdCodec){
                ZstdCodec = (await import(__dirname + "/../zstd")).ZstdCodec
            }
            ZstdCodec.run((a)=> def.resolve(a))
            this._zstd = await def.promise
            this._Streaming = new this._zstd.Streaming()
        }

        

        let compressedLength = 0, uncompressedLength = 0
        let portion = 5*1024*1024
        let buf = this._buf
        let gcompress = this._gcompress.bind(this)
        streamin.on("data", (b)=>{   
            buf.push(b)
            this._workingLength += b.length 
            this._uncompressedLength += b.length
            uncompressedLength += b.length
            if(this._workingLength >= portion){
                gcompress()
            }
        })

        let def = new async.Deferred<void>()
        streamin.on("error", (e)=>{   
            def.reject(e)
        })        
        streamin.on("end",()=>{
            //gcompress()
            def.resolve()
        })
        await def.promise

        return {
            uncompressedLength
        }
    }



}