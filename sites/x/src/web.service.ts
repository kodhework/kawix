import Path from 'path'
import 'npm://axios@^0.19.0'
import axios from 'axios'
import crypto from 'crypto'

let registryCache

export var kawixDynamic = {
	time: 30000
}

async function registry(){
	if(!registryCache || (Date.now() - registryCache.time > 1200000)){
		// renew cache
		let reg = await import(__dirname + "/registry")
		registryCache = {
			data: reg,
			time: Date.now()
		}
		reg.kawixDynamic = {time: 60000}
	}
	return registryCache.data
}

export async function versions( libInfo){

	let response = await axios({
		method: 'GET',
		url:libInfo.versions.url
	})
	let data = response.data
	if(libInfo.versions.filter) data = data.filter(libInfo.versions.filter)
	if(libInfo.versions.map) data = data.map(libInfo.versions.map)
	if(libInfo.versions.post_filter) data = data.filter(libInfo.versions.post_filter)
	if(libInfo.versions.post) data = libInfo.versions.post(data)

	return data
}

export async function invoke(env, ctx){

	let repo = await registry()
	let library = env.params.lib || env.params.lib_discover_version
	let version = "master"
	if(library){
		let y = library.indexOf("@")
		if(y > 0){
			version = library.substring(y+1)
			library = library.substring(0, y)
		}
	}


	let libInfo = repo.database[library]
	if(!libInfo){
		return env.reply.code(404).send({
			name: library,
			version,
			message: 'NOTFOUND',
			code: 404
		})
	}

	if(env.params.lib_discover_version){
		try{
			let data= await versions(libInfo)
			env.reply.code(200).send(data)
		}catch(e){
			env.reply.code(500).send({
				error: {message:e.message,code:e.code}
			})
		}
		return
	}

	if(libInfo.version_prefix && version!="master")
		version = libInfo.version_prefix + version


	let file = env.params.file= env.params["*"]
	let url = libInfo.url
	url = url.replace(/\$\{(\w[\w|\d]*)\}/g, (a,b)=> env.params[b] || "")

	let sha = "w/" + crypto.createHash('sha1').update(libInfo.url+">" + file).digest('hex')
	if(env.request.headers["if-none-match"]){
		let rsha = env.request.headers["if-none-match"]
		if(rsha == sha){
			return env.reply.code(304).send({})
		}
	}

	if(libInfo.extensions){

		// verificar
		let source = url, offset = 0
		while(true){

			try{
				let response = await axios({
					method: 'GET',
					url
				})
				if(response.data){
					env.reply.code(200)
						.header("content-type","text/plain")
						.header("etag", sha)
						.header("cache-control","public,max-age=300")
						.send(response.data)
				}
				return
			}catch(e){}


			let ext = libInfo.extensions[offset]
			offset++
			if(!ext)break
			url = source + ext
			console.info("URL", url)

		}

		return env.reply.code(404).send({
			name: library,
			version,
			message: 'NOTFOUND',
			code: 404,
			file
		})

	}else{
		env.reply.redirect(url)
		return
	}
}
