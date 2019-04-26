import fs from './fs/mod.js'
import Path from 'path'
import Zlib from 'zlib'

// empaquetar kwcore en un solo archivo que se auto extrae 

class Generator{
	constructor(){
		this.dir= Path.resolve(Path.join(__dirname, "..", "core"))
		var pack = Path.resolve(Path.join(__dirname, "..", "core","package.json"))
		var config= require(pack)
		this.corefolder= "core." + config.version
		this.content= []
		this.commands= []
		this.files= []
	}

	async gzipContent(buffer){
		return new Promise(function(a,b){
			Zlib.gzip(buffer, function (err, data) {
				if(err) return b(err)
				return a(data)
			})
		})		
	}

	async read(dir){
		if(!dir)
			dir = this.dir 
		var files= await fs.readdirAsync(dir)
		var file, ufile, stat , v, content
		v= Path.relative(this.dir, dir)
		if( v == "example" || v== "dist"){
			return 
		}

		for(var i=0;i<files.length;i++){
			file= files[i]
			ufile= Path.join(dir, file)
			stat= await fs.statAsync(ufile)
			if(stat.isDirectory()){
				v = JSON.stringify(Path.relative(this.dir, ufile))
				this.commands.push(`if(!fs.existsSync(Path.join(out,${v}))) fs.mkdirSync(Path.join(out,${v}))`)

				await this.read(ufile)
			}else{
				this.files.push(Path.relative(this.dir, ufile))
				content= await this.gzipContent(await fs.readFileAsync(ufile))
				this.content.push(content.toString('base64'))
			}
		}
	}


	getString(){
		var code = `#!/usr/bin/env node

var Os= require('os')
var Path= require('path')
var fs= require('fs')
var Zlib= require('zlib')
var home= Os.homedir()
var corefolder= ${JSON.stringify(this.corefolder)}
var verification= Path.join(home,"Kawix",corefolder, "verification.file")


if(fs.existsSync(verification)){
	module.exports= require(Path.join(home,"Kawix",corefolder))
	return 
}

var out= Path.join(home, "Kawix")
if(!fs.existsSync(out)){
	fs.mkdirSync(out)
}

out= Path.join(out, corefolder)
if(!fs.existsSync(out)){
	fs.mkdirSync(out)
}


${this.commands.join("\n")}

var files= ${JSON.stringify(this.files)}
var contents= contentData()

var file, content
for(var i=0;i<files.length;i++){
	file= files[i]
	content= contents[i]
	content= Buffer.from(content,'base64')
	content= Zlib.gunzipSync(content)
	fs.writeFileSync(Path.join(out, file), content)
}

if(process.env.INSTALL_KWCORE){
	//XXX
}

fs.writeFileSync(verification, Date.now().toString())
if(process.env.KWCORE_EXECUTE == 1){
	out= Path.join(out,"bin", "cli.js")
}
module.exports= require(out)

function contentData(){
	return ${JSON.stringify(this.content)}
}
		`
		return code 
	}

	async writeToFile(file){
		await fs.writeFileAsync(file, this.getString())
	}

}

init()
async function init(){
	var generator= new Generator() 
	await generator.read()
	await generator.writeToFile(__dirname + "/../core/dist/kwcore.app.js")
}