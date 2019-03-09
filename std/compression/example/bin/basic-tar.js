#!/usr/bin/env kwcore
import tar from '../../tar.js'
init()


async function init(){
    var args= process.argv.slice(3)
    var options= args[0]
    var files= args.slice(1)
    var file , obj={}

    if(!options){
        console.log("Try 'tar --help' or 'tar --usage' for more information")
        return 
    }
    else if(options == "--help" || options == "--usage"){
        console.log(`A basic replication of linux tar command, written using @kawix/core
Usage: tar [options] [path/to/out/tarball] [file1, file2, ...]
Example: 

tar czf archive.tar.gz foo bar  # create archive.tar from files foo and bar
tar xf archive.tar              # extract all files from archive.tar
tar xvf archive.tar              # extract all files from archive.tar with verbose


[options]
c create tarball 
f specify file
z compress (gzip)
x extract tarball (uncompress if required)
        `)
    }

    else if(options.indexOf("c")>=0){
        // compress 
        if(options.indexOf("f") >= 0){
            obj.file= files[0]
            files= files.slice(1)
        }
        if(options.indexOf("v") >= 0){
            obj.filter= function(path){
                console.log(path)
                return true 
            }
        }
        if(options.indexOf("z") >= 0){
            obj.gzip= true 
        }
        if(obj.file){
            await tar.c(obj, files)
        }else{
            console.error("Output to stdout is disabled")
        }
    }
    else if(options.indexOf("x") >= 0){
        if(options.indexOf("f") >= 0){
            obj.file= files[0]
            files=[]
        }
        if(options.indexOf("v") >= 0){
            obj.filter= function(path){
                console.log(path)
                return true 
            }
        }
        if(obj.file){
            await tar.x(obj)
        }
        else{

            console.log(" > Reading from stdin")
            process.stdin.pipe(tar.x(obj))
            process.stdin.resume()
            await (new Promise(function(resolve,reject){
                process.stdin.on("finish", resolve)
            }))
            
        }
    }

}