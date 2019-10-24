
import fs from './fs/mod'
import Path from 'path'
import Zlib from 'zlib'
// empaquetar kwcore en un solo archivo que se auto extrae 

class Generator {

	private content: Array<string>;
	private commands: Array<string>;
	private files: Array<string>;
	private libname: string;
	private dir: string;
	private version: string
	private corefolder: string
	constructor(dirname, libname, basename) {
		this.libname = libname
		this.dir = dirname
		var pack = Path.resolve(Path.join(__dirname, "..", "std", "package.json"))
		var config = require(pack)
		this.version = config.version
		this.corefolder = (basename || libname) + "." + config.version
		this.content = []
		this.commands = []
		this.files = []
	}

	async gzipContent(buffer) {
		return new Promise(function (a, b) {
			Zlib.gzip(buffer, function (err, data) {
				if (err) return b(err)
				return a(data)
			})
		})
	}

	async read(dir?:string) {
		if (!dir)
			dir = this.dir
		var files = await fs.readdirAsync(dir)
		var file, ufile, stat, v, content
		v = Path.relative(this.dir, dir)
		if (v == "example" || v == "test" || v == "dist" || v == "core" || v == "icons" || v == "sites") {
			return
		}

		var rfile, content
		for (var i = 0; i < files.length; i++) {
			file = files[i]
			ufile = Path.join(dir, file)
			stat = await fs.statAsync(ufile)
			if (stat.isDirectory()) {
				v = JSON.stringify(Path.relative(this.dir, ufile))
				this.commands.push(`if(!fs.existsSync(Path.join(out,${v}))) fs.mkdirSync(Path.join(out,${v}))`)

				await this.read(ufile)
			} else {
				rfile = Path.relative(this.dir, ufile)
				
				content = await fs.readFileAsync(ufile)
				if(ufile.endsWith(".ts") || ufile.endsWith(".js")){
					// TRANSPILE? 
					content = content.toString('utf8')
					let transpilerOptions = {
						presets: ["typescript", 'es2015', 'es2016', 'es2017', ['stage-2', {
							decoratorsBeforeExport: false
						}]],
						sourceMaps: true,
						comments: true,
						filename: ufile
					}
					let ast = global.kawix.NextJavascript.transpile(content, transpilerOptions)
					//let changed = global.kawix.KModule.injectImports(ast.code)
					//content = Buffer.from(changed.source)
					content = Buffer.from(ast.code)
				}

				this.files.push(rfile)
				content = await this.gzipContent(content)
				this.content.push(content.toString('base64'))
			}
		}
	}


	getString() {
		var code = `#!/usr/bin/env node
var Os= require('os')
var Path= require('path')
var fs= require('fs')
var Zlib= require('zlib')
var home= Os.homedir()

var corefolder= ${JSON.stringify(this.corefolder)}
var coredefault= Path.join(home, "Kawix", "${this.libname}")
var corevdefault= Path.join(home, "Kawix", "${this.libname}", "verification.file")
var verification= Path.join(home, "Kawix", corefolder,  "${this.libname}", "verification.file")
var out, installed

kawix.KModule.addVirtualFile("@kawix/${this.libname}", {
	redirect: Path.join(home, "Kawix", corefolder,  "${this.libname}"),
	isdirectory: true
})

main()

function _export(out){
	module.exports = {
		filename: out ,
		dirname: Path.dirname(out)
	}
}

function main(){
	
	/* this is commented, because the idea is load specific version

	if(fs.existsSync(corevdefault)){
		installed= fs.readFileSync(corevdefault,'utf8')
		if(installed >= ${JSON.stringify(this.version)}){
			out= Path.join(home,"Kawix", "${this.libname}")
			out= Path.join(out,"mod")
			_export(out)
			return 
		}
	}*/


	if(fs.existsSync(verification)){
		out= Path.join(home,"Kawix", corefolder, "${this.libname}")
		out= Path.join(out,"mod")
		_export(out)
		return 
	}

	out= Path.join(home, "Kawix")
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}

	out= Path.join(out, corefolder)
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}

	out= Path.join(out, "${this.libname}")
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
	fs.writeFileSync(verification, ${JSON.stringify(this.version)})


	/*
	// make a junction or symlink 
	if(fs.existsSync(coredefault)){
		fs.unlinkSync(coredefault)
	}
	if(Os.platform() == "win32")
		fs.symlinkSync(out, coredefault,"junction")
	else 
		fs.symlinkSync(out, coredefault)

	*/


	out= Path.join(out, "mod")
	_export(out)
}

function contentData(){
	return ${JSON.stringify(this.content)}
}
		`
		return code
	}

	async writeToFile(file) {
		await fs.writeFileAsync(file, this.getString())
	}
}

init()
async function init() {
	var generator = new Generator(__dirname, 'std', 'stdlib')
	await generator.read()
	await generator.writeToFile(__dirname + "/dist/stdlib.js")


	generator = new Generator(__dirname + "/../dhs", 'dhs', 'stdlib')
	await generator.read()
	await generator.writeToFile(__dirname + "/../dhs/dist/dhs.js")


	generator = new Generator(__dirname + "/../gix", 'gix', 'stdlib')
	await generator.read()
	await generator.writeToFile(__dirname + "/../gix/dist/gix.js")


	generator = new Generator(__dirname + "/../kivi", 'kivi', 'stdlib')
	await generator.read()
	await generator.writeToFile(__dirname + "/../kivi/dist/kivi.js")
}