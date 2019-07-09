
/* Copyright 2019 Kodhe contacto@kodhe.com*/
/** returns a promisified version of fs */
import fs from 'fs'
import util from 'util'

//import Promisify from '../util/promisify'
var fs1 = Object.assign({}, fs,{
    accessAsync: util.promisify(fs.access),
    appendFileAsync: util.promisify(fs.appendFile),
    chmodAsync: util.promisify(fs.chmod),
    chownAsync: util.promisify(fs.chown),
    closeAsync: util.promisify(fs.close),
    copyFileAsync: util.promisify(fs.copyFile),
    existsAsync: function(file : fs.PathLike): Promise<boolean>{
        return new Promise((resolve, reject)=>{
            fs.access(file, fs.constants.F_OK, (err) => {
                if(err) return resolve(false)
                return resolve(true)
            })            
        })
    },
    fchmodAsync: util.promisify(fs.fchmod),
    fchownAsync: util.promisify(fs.fchown),
    fdatasyncAsync: util.promisify(fs.fdatasync),
    fstatAsync: util.promisify(fs.fstat),
    fsyncAsync: util.promisify(fs.fsync),
    ftruncateAsync: util.promisify(fs.ftruncate),
    
    futimesAsync: util.promisify(fs.futimes),
    lchmodAsync: fs.lchmod && util.promisify(fs.lchmod),
    lchownAsync: fs.lchown && util.promisify(fs.lchown),
    linkAsync: util.promisify(fs.link),
    lstatAsync: util.promisify(fs.lstat),
    mkdirAsync: util.promisify(fs.mkdir),
    mkdtempAsync: util.promisify(fs.mkdtemp),
    openAsync: util.promisify(fs.open),
    readAsync: util.promisify(fs.read),
    readdirAsync: util.promisify(fs.readdir),
    readFileAsync: util.promisify(fs.readFile),
    readlinkAsync: util.promisify(fs.readlink),
    realpathAsync: util.promisify(fs.realpath),
    renameAsync: util.promisify(fs.rename),
    rmdirAsync: util.promisify(fs.rmdir),
    statAsync: util.promisify(fs.stat),
    symlinkAsync: util.promisify(fs.symlink),
    truncateAsync: util.promisify(fs.truncate),
    unlinkAsync: util.promisify(fs.unlink),
    utimesAsync: util.promisify(fs.utimes),
    writeAsync: util.promisify(fs.write),
    writeFileAsync: util.promisify(fs.writeFile)
})

export default fs1 

