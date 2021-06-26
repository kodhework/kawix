import fs from '../../fs/mod'
import Exception from '../../util/exception'
import * as async from  '../../util/async'
import Path from 'path'
import { Readable } from 'stream'
import uniqid from '../../util/uniqid'
import Os from 'os'
import Zlib from 'zlib'

let ZstdCodec = null

export class Unarchiver{
	file:string
	_opened = false
    _fd = -1

    _Streaming = null
    _zstd = null
    metadata = null
    _tempfile = false
    _cacheBlocks = {}

    method = "zstd"
	props = {}
	$propJson = ''

	constructor(file:string){
		this.file = file
    }


    static async fromStream(stream: Readable){
        let path = Path.join(Os.homedir(),".kawi", "kzt")
        if(!fs.existsSync(path)){
            await fs.mkdirAsync(path)
        }
        path = Path.join(path, uniqid() + ".kzt")
        let stout = fs.createWriteStream(path)
        let def = new async.Deferred<void>()
        stream.on("error", def.reject)
        stout.on("finish", def.resolve)
        stout.on("error", def.reject)
        stream.pipe(stout)

        await def.promise

        let archiver = new Unarchiver(path)
        archiver._tempfile = true
        return archiver
    }


    async dispose(){
        if(this._fd){
            await fs.closeAsync(this._fd)
        }
        if(this._tempfile){
            await fs.unlinkAsync(this.file)
        }
    }

	async open(){
		if(!this._opened){
			this._fd = await fs.openAsync(this.file, "r")
			this._opened = true
		}
    }

    async $decompress(bytes: Buffer){
        if(this.method == "zstd"){
            let streaming = await this.zstd()
            let content = streaming.decompress(bytes)
            return Buffer.from(content)
        }
        else if(this.method == "brotli"){
            let buf = Zlib.brotliDecompressSync(bytes)
            return buf
        }
        else if(this.method == "gzip"){
            return Zlib.gunzipSync(bytes)
        }
    }

    async zstd(){
        if(!this._zstd){
            let def = new async.Deferred<any>()
            if(!ZstdCodec){
                ZstdCodec = (await import(__dirname + "/../zstd")).ZstdCodec
            }
            ZstdCodec.run((a)=> def.resolve(a))
            this._zstd = await def.promise
            this._Streaming = new this._zstd.Streaming()
        }
        return this._Streaming
    }

    async isValid(){
        await this.open()
        let stat = await fs.fstatAsync(this._fd)
		let buf = Buffer.allocUnsafe(21)
		let response = await this._read_async(buf, 21, stat.size - 21)
		if(buf.slice(12,17).toString() == "#kzst"){
            return true
        }
		if(buf.slice(0,7).toString() == "#2-kzst"){
            return true
        }

		if(buf.slice(10,17).toString() == "#3-kzst"){
            return true
        }
    }


    async _read_async(buf: Buffer, length:number, position:number){
        if(this._fd){
            return await fs.readAsync(this._fd, buf, 0, length, position)
        }
    }

	async readMetadata(){


        if(!this.metadata){
			let fv = 1

            await this.open()
            let stat = await fs.fstatAsync(this._fd)
            let buf = Buffer.allocUnsafe(21)
            let response = await this._read_async(buf, 21, stat.size - 21)
            let fixedCount = 9, offsetCount = 17

            if(buf.slice(12, 17).toString() != "#kzst"){

                if(buf.slice(0, 7).toString() == "#2-kzst"){
					fv = 2
					fixedCount = 21
					offsetCount = 17
                    this.method = buf.slice(7, 17).toString().trim()
                }else{

					/*
					if(buf.slice(10, 17).toString() == "#3-kzst"){
						fixedCount = 0
						fv = 3
					}
					else{
						*/
                    	throw Exception.create("The file format is not kzst").putCode("INVALID_FORMAT")
					//}
                }
            }


			let count = buf.readUInt32LE(offsetCount)

            buf = Buffer.allocUnsafe(count)

            response = await this._read_async(buf, count, stat.size - fixedCount - count)
            if(response.bytesRead != count)
                throw Exception.create("The file format is not kzst. Failed to read metadata").putCode("INVALID_FORMAT")


            let content = await this.$decompress(buf)
            this.metadata = JSON.parse(content.toString()) || {}

			if(this.metadata){
				if(this.metadata.method) this.method = this.metadata.method
			}

        }
        return this.metadata
    }


    get entries(){
        return this.metadata && this.metadata.files
    }

    async getFileContent(path: string){

        await this.readMetadata()
        let file = this.metadata.files.filter((a)=>a.path == path)[0]
        if(!file){
            throw Exception.create(`Entry with filename ${path} not found`).putCode("FILE_ERROR")
        }

        if(file.stat.isdirectory){
            return null
        }

        if(file.stat.issymlink){
            return {
                link: file.stat.link
            }
        }

        let length = 0, offset = file.offset, total = [], block = file.block
        while(length < file.length){

            let blockcontent = await this.getBlockContent(block)
            let roffset = offset - blockcontent.offset
            let buf = blockcontent.data.slice(roffset, roffset+ Math.min(file.length - length, blockcontent.data.length))

            total.push(buf)
            length += buf.length
            block++
            offset += buf.length

        }
        return Buffer.concat(total)

    }

    async getBlockContent(number:number){
        await this.readMetadata()
        let cached = this._cacheBlocks[number]
        if(!cached){
            let Streaming = this._Streaming
            cached = this.metadata.blocks[number]
            let buf = Buffer.allocUnsafe(cached.compressedLength)

            await this._read_async(buf, cached.compressedLength, cached.compressedOffset)
            let dec = await this.$decompress(buf)
            if(!dec)
                throw Exception.create("Failed to read block: " + number).putCode("FILE_ERROR")

            cached.data = Buffer.from(dec)
            this._cacheBlocks[number] = cached
        }
        return cached
    }


    async extractAllTo(folder: string){

        await this.readMetadata()
        let entries = this.entries
        if(!fs.existsSync(folder)) await fs.mkdirAsync(folder)
        for(let entry of entries){
            if(entry.path != "."){

                let out = Path.join(folder, entry.path)
                if(entry.stat.isdirectory){
                    if(!fs.existsSync(out))await fs.mkdirAsync(out)
                }else if(entry.stat.issymlink){
                    await fs.symlinkAsync(entry.link, out)
                }else{

                    let buf = await this.getFileContent(entry.path)
                    await fs.writeFileAsync(out, buf)
                    await fs.utimesAsync(out, new Date(entry.stat.mtimeMs || Date.now()), new Date(entry.stat.mtimeMs || Date.now()))
                }
            }
        }

    }



}
