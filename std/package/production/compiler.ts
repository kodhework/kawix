// Copyright Kodhe 2019
import fs from '../../fs/mod'
import Path from 'path'

var names=["isBlockDevice","isCharacterDevice","isDirectory","isFIFO",""]
class Compiler{

	/** Bundle a folder of files, like one unique file*/
	constructor(path, options={}){
		if(path)
			this._path= Path.normalize(path)
		this._filenames= {}
		this._fcount= 0
		this.options= options
		if(options.ignoreIrrelevantFiles == undefined){
			options.ignoreIrrelevantFiles= true
		}
		this._extensions= {}
	}



	writeToFolder(folder){
		this._dir= folder
		return this
	}



	get virtualName(){
		if(!this.options.virtualName){
			this.options.virtualName= Path.basename(this._path)
		}
		return this.options.virtualName
	}

	set virtualName(name){
		return this.options.virtualName= name
	}

	get type(){
		return this.options.type
	}
	set type(value){
		return this.options.type= value
	}

	get packageJsonSupport(){
		return this.options.packageJsonSupport
	}
	set packageJsonSupport(value){
		return this.options.packageJsonSupport= value
	}

	get mainScript(){
		return this.options.mainScript
	}

	set mainScript(value){
		return this.options.mainScript= value
	}

	get transpile(){
		return this.options.transpile
	}

	set transpile(value){
		return this.options.transpile= value
	}

	get disableTranspile(){
		return this.options.disableTranspile
	}

	set disableTranspile(value){
		return this.options.disableTranspile= value
	}

	get translation() {
		return this.options.translation
	}
	set translation(value) {
		return this.options.translation = value
	}

	get ignoreIrrelevantFiles() {
		return this.options.ignoreIrrelevantFiles
	}
	set ignoreIrrelevantFiles(value) {
		return this.options.ignoreIrrelevantFiles = value
	}
	get filter() {
		return this.options.filter
	}
	set filter(value) {
		return this.options.filter = value
	}
	get passthrough() {
		return this.options.passthrough
	}
	set passthrough(value) {
		return this.options.passthrough = value
	}
	get profile() {
		return this.options.profile
	}
	set profile(value) {
		return this.options.profile = value
	}

	async _fileExists(file){
		return new Promise(function(resolve, reject){
			fs.access(file, fs.constants.F_OK, function(err){
				if (err) resolve(false)
				resolve(true)
			})
		})
	}

	async generate(path){

		if(!(await this._fileExists(this._dir))){
			await fs.mkdirAsync(this._dir)
		}
		this._path = path || this._path
		await this._generate(this._path, this._dir)
		return this
	}

	async _generate(path, dest){
		var files= await fs.readdirAsync(path)
		var file, ufile, stat, destu, transoptions, ast, content, transpile, rep

		transoptions = {
			comments: false
		}
		this.type = this.type || "kwsh"
		for(var i=0;i<files.length;i++){
			file= files[i]
			ufile= Path.join(path, file)
			rep= Path.relative(this._path, ufile)

			if(this.filter){
				if(!this.filter(rep)){
					continue
				}
			}

			if(this.ignoreIrrelevantFiles){
				if(file.startsWith(".") || file.toUpperCase().endsWith("LICENSE.MD")
					|| file.toUpperCase().endsWith("README.MD")
					|| file == "test" || file == "tests" || file == "example" || file=="examples")
					continue
			}
			stat= await fs.statAsync(ufile)
			if(stat.isDirectory()){
				destu= Path.join(dest, file)
				if(! ( await this._fileExists(destu) ) ){
					await fs.mkdirAsync(destu)
					await fs.utimesAsync(destu, stat.atime, stat.mtime)
				}

				await this._generate(ufile, destu)
			}
			else{
				destu=null
				content=''

				if(!this.disableTranspile){
					transpile= true

					if(this.passthrough){
						transpile= !this.passthrough(rep)
					}

					if(transpile){
						for(var ext in kwcore.KModule.extensions){
							if(file.endsWith(ext)){
								//destu= Path.join(dest, file)

								if(this.type != "kwsh" || ext != ".kwsh"){
									destu= Path.join(dest, Path.basename(file,ext) +"." + this.type)
									ast= await kawix.KModule.Module.compile(ufile, {
										force: 1,
										mtime: Date.now(),
										transpilerOptions: transoptions
									})

									if(this.type == "kwsh"){
										content= "#!/usr/bin/env kwcore --kwsh\n#kwsh.0\n" + JSON.stringify(ast)
									}else if(this.type == "js"){
										content= ast.code
									}
									break
								}

							}
						}
					}

				}
				if(content){
					
					await fs.writeFileAsync(destu, content)
					if(stat.mtimeMs > Date.now()){
						
						
						stat.mtime = new Date()
						stat.atime = new Date()
						await fs.utimesAsync(ufile, stat.atime, stat.mtime)

					}
					await fs.utimesAsync(destu, stat.atime, stat.mtime)

				}else{

					destu= Path.join(dest, file)
					await fs.copyFileAsync(ufile, destu)
					if (stat.mtimeMs > Date.now()){
						
						
						stat.mtime= new Date()
						stat.atime= new Date()
						await fs.utimesAsync(ufile, stat.atime, stat.mtime)
						
					}
					await fs.utimesAsync(destu, stat.atime, stat.mtime)

				}
			}
		}

	}


}

export default Compiler
export var kawixDynamic= {
	time: 45000
}
