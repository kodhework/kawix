import Path from 'path'
import Tar from '../../compression/tar.js'
import Glob from '../../../dhs/glob/mod.js'
import fs from '../../fs/mod.js'


deferred= ()->
	def= {}
	def.promise= new Promise (a,b)->
		def.resolve=a
		def.reject =b
	def

export createTarball= (body={})->

	dir= Path.normalize(body.dirname ? Path.join(__dirname, ".."))
	dist= body.outputfolder ? Path.join(dir,".dist")
	

	def= deferred()
	Glob dir+"/**", (err,files)->
		return def.reject err if err
		def.resolve files
	files= await def.promise

	max= -1

	nfiles = []
	for file in files
		stat= await fs.lstatAsync(file)
		value= stat.mtimeMs
		max= value if value > max
		if not stat.isDirectory()
			if body?.filter?(file) is false
				continue
			else if Path.relative(dir, file).startsWith(".bundles")
				continue
			nfiles.push(file)

	files= nfiles

	if body?.getmodified
		return max

	name= body.name	
	if not fs.existsSync(dist)
		await fs.mkdirAsync dist

	out = Path.join dist, max + ".kwa"
	if not fs.existsSync(out)
		cfiles= files.map((a)-> Path.relative(dir, a)).filter (a)-> a and (not a.startsWith(".dist"))


		tarball= Tar.c
			gzip: yes
			follow: yes
			C: dir
		, cfiles
		# save
		try

			sw= fs.createWriteStream(out)
			def= deferred()
			tarball.on "error", def.reject
			sw.on "finish", def.resolve
			tarball.pipe sw
			await def.promise

		catch e
			# delete file
			await fs.unlinkAsync(out) if fs.existsSync(out)
			throw e
		
	
	kw = body.distfolder 
	pack= await import(body.package)
	if not fs.existsSync(kw)
		await fs.mkdirAsync(kw)
	f= Path.join(kw, "info.json")
	json= 
		name: pack.name

	if fs.existsSync(f)
		json= await import(f)	
	json.versions= json.versions || {}
	version= json.versions[pack.version] 
	if not version 
		version= json.versions[pack.version] = {}
		version.created= Date.now() 
	
	stat = await fs.statAsync(out)
	version.size= stat.size 
	version.filename= "./" + Path.basename(out)
	version.uploadid = Path.basename(out,".kwa")
	dest= Path.join(kw, Path.basename(out))
	if body?.after
		await body?.after(out, dest, version)
	else 
		await fs.copyFileAsync(out, dest)
	await fs.writeFileAsync(f, JSON.stringify(json,null,'\t'))



	
	console.info 
		modified: max
		file: "#{max}.kwa"



export default (body)->
	delete body.dirname if body
	return createTarball(body)
