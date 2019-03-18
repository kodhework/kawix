import Registry from '../../../std/package/registry.js'
import Bundler from '../../../std/package/bundle.js'
import KawixHttp from '../../../std/http/mod.js'
import Exception from '../../../std/util/exception.js'
import fs from '../../../std/fs/mod.js'
import Path from 'path'


deferred= ()->
	def= {}
	def.promise= new Promise (a,b)->
		def.resolve= a
		def.reject = b 
	return def 


_checkFileExists= (file)->
	def= deferred()
	fs.access file, fs.F_OK, (err)->
		def.resolve(if err then no else yes)
	return def.promise 

# generate a bundle dynamic 
export invoke= (env,ctx)->
	try 

		uri= env.request.uri 
		if not uri
			uri= Url.parse env.request.url 

		site= env.params.site 
		file= env.params["*"]
		env.request.query= env.request.query or {}
		if site 
			
			
			# generate from site source code 
			if not file 
				return 
			
			ctx= ctx.server.getContext(site)
			if ctx.site._notfound 
				throw Exception.create("Site #{site} not found").putCode("NOT_FOUND")

			if not file.startsWith("./") 
				file= "./#{file}"
			
			path= ctx.server.config.resolvePath(file, ctx.site)
			if not await _checkFileExists(path)
				throw Exception.create("Path #{file} not found in site #{site}").putCode("NOT_FOUND")
			
			stat= await fs.statAsync(path)
			if stat.isFile()
				env.request.url= "/" + Path.basename(path) 
				stati= KawixHttp.staticServe(Path.dirname(path))
				return await stati(env)



			env.request.query= env.request.query or {}
			if env.request.query.transpile is undefined 
				env.request.query.transpile= true 


			# read a cache 
			outp= Path.normalize(Path.join(path, "..", "dist"))
			

			moduledesc= {}
			moduledesc.folder= path
			moduledesc.name= env.request.query.name 
			if not moduledesc.name 
				moduledesc.name= Path.basename(path)
				if moduledesc.name == "src"
					moduledesc.name= Path.basename(Path.dirname(path))
				# search package.json 
				pjson= Path.join(path,"package.json")
				if await _checkFileExists(pjson)
					pjson= await fs.readFileAsync(pjson, 'utf8')
					try 
						pjson= JSON.parse(pjson)
						moduledesc.name= pjson.name 
					
					
			if not await _checkFileExists(outp)
				await fs.mkdirAsync(outp)
			
			outp= Path.join(outp, moduledesc.name + ".bundle")
			if env.request.query.min or env.request.query.minimal
				outp2 = outp + ".min.js"			
			outp += ".js"
			outr= outp + ".id"
			generate= yes 
			


		else 
			ctx= ctx.server.getContext("")
			mod = env.params.module 
			

			# generate a bundle 
			options= {}
			if env.request.query.type isnt "bundle"
				options.ignoredependencies= yes 
			reg= new Registry options


			moduledesc= await reg.resolve(mod, null, yes)
			if file
				if env.request.query.type isnt "bundle"

					newname= moduledesc.name + "@" + moduledesc.version 
					if newname isnt mod 
						# redirect instead of serving 
						
						return env.reply.redirect(decodeURI(uri.pathname).replace(mod, newname)+ (uri.search ? ""))

					fname= Path.join(moduledesc.folder, file)
					env.request.url= "/" + file 
					stati= KawixHttp.staticServe(moduledesc.folder)
					return await stati(env)
				else 
					
					# make a bundle 
					# this part is harden 
					# read a cache 
					outp= Path.join(Path.dirname(moduledesc.folder), Path.basename(moduledesc.folder) + file.replace(/\//g,'$') + ".bundle")
					if env.request.query.min or env.request.query.minimal
						outp2 = outp + ".min.js"

					outp += ".js"
					outr= outp + ".id"
					generate= yes 
					moduledesc.bundlefile=  Path.join(moduledesc.folder, file)
			else 
				files1= moduledesc.packageinfo
				if not files1 
					pjson= Path.join moduledesc.folder, "package.json"
					pjson= await fs.readFileAsync(pjson, 'utf8')
					files1= JSON.parse pjson 

				
				added= mod
				if uri.pathname.endsWith("/")
					added= ''

				kawix= files1.kawix?.main or files1.browser or files1.unpkg 
				# if bundle is not required, redirect to main
				if not kawix and env.request.query.type isnt "bundle"
					kawix= files1.main or "index.js"
				
				
				if kawix 
					if(kawix.startsWith("./"))
						if not added 
							kawix= kawix.substring(1)
						kawix= added + kawix.substring(1)

					else if(kawix.startsWith("../")) 
						if added 
							kawix= kawix.substring(3)
					else 
						if added 
							added += "/"
						kawix=  added +  kawix
					kawix+= (uri.search ? "")

					return env.reply.redirect(kawix)
				
				else 

					# make a bundle 
					# this part is harden 
					# read a cache 
					outp= Path.join(Path.dirname(moduledesc.folder), Path.basename(moduledesc.folder) + ".bundle")
					if env.request.query.min or env.request.query.minimal
						outp2 = outp + ".min.js"

					
					outp += ".js"

					outr= outp + ".id"
					generate= yes 

			if generate 
				newname= moduledesc.name + "@" + moduledesc.version 
				if newname isnt mod 
					# redirect instead of serving 
					return env.reply.redirect(decodeURI(uri.pathname).replace(mod, newname)+ (uri.search ? ""))

		if generate 
			id= parseInt(env.request.query.id or 0)
			currentid= -1
			if await _checkFileExists(outr)
				currentid= await fs.readFileAsync(outr, 'utf8')
				currentid= parseInt currentid if currentid
			
			if id > currentid or ctx.config.mode is "development"
			
				# create a bundle 
				bundler = new Bundler(moduledesc.bundlefile or moduledesc.folder)
				if not env.request.query.transpile
					bundler.disableTranspile = true
				bundler.profile= env.request.query.profile or "browser"
				bundler.packageJsonSupport = true
				bundler.virtualName = "#{moduledesc.name}"
				#if moduledesc.bundlefile
				#	bundler.virtualName+= ".js"
				await bundler.writeToFile(outp).bundle()

				await fs.writeFileAsync(outr, id.toString())
			
			if outp2 
				throw new Error("Disabled minify")
			

			serve= KawixHttp.staticServe(Path.dirname(outp2 or outp))
			env.request.url= "/" + Path.basename(outp2 or outp)
			await serve(env)


			
			#env.response.end()
	catch e 
		env.reply.code(500).send
			status:'error'
			error: 
				message: e.message 
				code: e.code 

 
export kawixDynamic=
	time: 15000
