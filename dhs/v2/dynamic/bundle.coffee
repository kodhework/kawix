import Registry from '/virtual/@kawix/std/package/registry.yarn'
import Bundler from '/virtual/@kawix/std/package/bundle'
import KawixHttp from '/virtual/@kawix/std/http/mod'
import Exception from '/virtual/@kawix/std/util/exception'
import fs from '/virtual/@kawix/std/fs/mod'
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


generate1= (params)->
	try
		site= params.site
		file= params.file
		uri= params.uri
		ctx= params.ctx

		if params.savename is undefined
			params.savename= file ? ""

		params.type= params.type ? "n"
		if site
			# generate from site source code
			if not file
				return

			console.info("SITE:", site)
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
				return
					static: yes
					path: path

				###
				env.request.url= "/" + Path.basename(path)
				static= KawixHttp.staticServe(Path.dirname(path))
				return await static(env)
				###



			if params.transpile is undefined
				params.transpile= true


			# read a cache
			outp= Path.normalize(Path.join(path, "..", "dist"))


			moduledesc= {}
			moduledesc.folder= path
			moduledesc.name= params.name
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

			outp= Path.join(outp, moduledesc.name + ".#{params.type}")
			if params.minified
				outp2 = outp + ".min.js"
			outp += ".js"
			outr= outp + ".id"
			generate= yes



		else
			#ctx.response.write(params)
			#return 
			ctx= ctx.server.getContext("default")
			mod = params.module


			# generate a bundle
			options= {}
			if params.type isnt "bundle"
				options.ignoredependencies= yes
			if params.cachedir and params.complete
				options.output= params.cachedir

			reg= new Registry options


			if params.cachedir and (not params.complete)
				if file
					if params.type is "bundle"
						outext= ".js"
					else
						outext= Path.extname(file)
					outn= Path.join(params.cachedir, mod + file.replace(/\//g,'$') + ".#{params.type}")
					outn2 = outn + outext + ".id"
				else
					outext= ".js"
					outn= Path.join(params.cachedir, mod  + ".#{params.type}")
					outn2 = outn + outext + ".id"


			if outn
				id= parseInt(params.id or 0)
				currentid= -1
				if await _checkFileExists(outn2)
					currentid= await fs.readFileAsync(outn2, 'utf8')
					currentid= parseInt currentid if currentid

				if currentid >= id
					if params.minify
						outn+= ".min" + outext
					else
						outn+= outext

					if await _checkFileExists(outn)
						return
							static: yes
							path: outn



			moduledesc= await reg.resolve(mod, null, yes)
			if file
				if params.type isnt "bundle"

					newname= moduledesc.name + "@" + moduledesc.version
					if newname isnt mod
						# redirect instead of serving
						if params.uri
							return
								redirect: yes
								replace:
									mod: newname


					fname= Path.join(moduledesc.folder, file)
					if params.cachedir and (not params.complete)
						outp= Path.join(params.cachedir, Path.basename(moduledesc.folder) + params.savename.replace(/\//g,'$') + ".#{params.type}")


						if params.minify
							outp2 = outp + ".min" + Path.extname(file)
							generate= yes

						outp += Path.extname(file)
						outr= outp + ".id"
						moduledesc.bundlefile = fname

						if not generate
							id= parseInt(params.id or 0)
							currentid= -1
							if await _checkFileExists(outn2)
								currentid= await fs.readFileAsync(outn2, 'utf8')
								currentid= parseInt currentid if currentid

							if currentid < id
								await fs.writeFileAsync(outp, await fs.readFileAsync(fname))
								await fs.writeFileAsync(outr, id)

							return
								path: outp
								static: yes


					return
						path: fname
						static: yes

					###
					env.request.url= "/" + file
					stati= KawixHttp.staticServe(moduledesc.folder)
					return await stati(env)
					###
				else


					if params.cachedir
						outp= Path.join(params.cachedir, Path.basename(moduledesc.folder) + params.savename.replace(/\//g,'$') + ".#{params.type}")
					else
						outp= Path.join(Path.dirname(moduledesc.folder), Path.basename(moduledesc.folder) + params.savename.replace(/\//g,'$') + ".#{params.type}")



					if params.minify
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
				if uri?.pathname.endsWith("/")
					added= ''

				###
				kawix= files1.kawix?.main or files1.browser or files1.unpkg
				# if bundle is not required, redirect to main
				if not kawix and env.request.query.type isnt "bundle"
					kawix= files1.main or "index.js"
				###

				kawix= files1.kawix?.main or files1.unpkg
				ktypings= files1.typings ? {}
				if not kawix
					kbrowser= files1.browser
					if typeof kbrowser is "string"
						kawix= kbrowser

				if not kawix and params.type isnt "bundle"
					kawix= files1.main or "index.js"

				if kawix

					if uri
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
						return
							redirect: yes
							path: kawix
					else
						params.file= kawix
						params.savename= ''
						return await generate1(params)


				else

					# make a bundle
					# this part is harden
					# read a cache
					if params.cachedir
						outp=Path.join(params.cachedir, Path.basename(moduledesc.folder)  + ".#{params.type}")
					else
						outp= Path.join(Path.dirname(moduledesc.folder), Path.basename(moduledesc.folder) + ".#{params.type}")


					if params.minify
						outp2 = outp + ".min.js"


					outp += ".js"

					outr= outp + ".id"
					generate= yes

			if generate
				newname= moduledesc.name + "@" + moduledesc.version
				if newname isnt mod
					# redirect instead of serving
					if params.uri
						return
							redirect: yes
							replace:
								mod: newname

		if generate
			id= parseInt(params.id or 0)
			currentid= -1
			if await _checkFileExists(outr)
				currentid= await fs.readFileAsync(outr, 'utf8')
				currentid= parseInt currentid if currentid

			if id > currentid or ctx.config.mode is "development"

				# create a bundle
				bundler = new Bundler(moduledesc.bundlefile or moduledesc.folder)
				if not params.transpile
					bundler.disableTranspile = true
				bundler.profile= params.profile or "browser"
				bundler.packageJsonSupport = true

				ktypings= ktypings ? {}
				if params.allowdist isnt "1"
					bundler.filter= (file)->
						not file.startsWith("dist/") and not ktypings["./"+file] and not ktypings[file]
				else
					bundler.filter= (file)->
						not ktypings["./"+file] and not ktypings[file]

				bundler.virtualName = "#{moduledesc.name}"
				if typeof kbrowser is "object"
					bundler.translation= kbrowser
				#if moduledesc.bundlefile
				#	bundler.virtualName+= ".js"

				await bundler.writeToFile(outp).bundle()
				await fs.writeFileAsync(outr, id.toString())

			if outp2
				throw new Error("Disabled minify")

			return
				static: yes
				path: outp2 or outp

			###
			serve= KawixHttp.staticServe(Path.dirname(outp2 or outp))
			env.request.url= "/" + Path.basename(outp2 or outp)
			await serve(env)
			###


			#env.response.end()
	catch e
		throw e

export create = generate1

# generate a bundle dynamic
export invoke= (env,ctx)->
	try

		if env.request.query?.id == "now"
			env.request.query.id= Date.now()


		uri= env.request.uri
		if not uri
			uri= Url.parse env.request.url
		site= env.params.site
		file= env.params["*"]
		env.request.query= env.request.query or {}
		params=
			site: site
			file: file
			allowdist: env.request.query.allowdist
			module: env.params.module
			transpile: env.request.query.transpile
			name: env.request.query.name
			minify: env.request.query.min or env.request.query.minimal or env.request.query.minify
			type: env.params.type ? env.request.query.type
			complete: env.request.query.complete
			id: env.request.query.id
			profile: env.request.profile
			uri: uri
			ctx: ctx
		#console.info("id....",params.id)

		if env.request.url.indexOf("complete/cached") >= 0
			params.complete= 1

		if env.params.sitecache
			env.request.query.sitecache= env.params.sitecache

		if env.request.query.sitecache

			ctx= ctx.server.getContext(env.request.query.sitecache)
			if ctx.site._notfound
				throw Exception.create("Site #{env.request.query.sitecache} not found").putCode("NOT_FOUND")


			params.cachedir= ctx.server.config.resolvePath("./cache", ctx.site)
			if not ( await _checkFileExists(params.cachedir))
				await fs.mkdirAsync(params.cachedir)

			delete params.uri




		res= await generate1 params



		if res.static

			if env.request.query?.dev is "1"
				# server direct
				env.reply.header("content-type","application/javascript;charset=utf8").send(await fs.readFileAsync(res.path))
				return


			env.request.url= "/" + Path.basename(res.path)
			stati= KawixHttp.staticServe(Path.dirname(res.path))
			return await stati(env)

		if res.redirect
			if res.path
				u= res.path
			else
				u= decodeURI(uri.pathname)
				for id, val of res.replace
					u = u.replace id, val

				u += (uri.search ? "")
			return env.reply.redirect u
	catch e
		env.reply.code(500).send
			status:'error'
			error:
				message: e.message
				code: e.code
				stack: e.stack





export kawixDynamic=
	time: 15000
