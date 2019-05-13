import Child from 'child_process'
import Net from 'net'
import fs from 'fs'
import Os from 'os'
import Path from 'path'
import Registry from 'https://kwx.kodhe.com/x/v/0.4.0/std/package/registry.js'
pty = null 


class Program

	constructor: ()->
		@mb= 4*1024
		@cache=
			len: 0
			data:[]

	@main: ()->

		# init node-pty 
		try 
			if Os.platform() is "linux"

				#pty= await import('npm://node-pty@0.8.1')
				registry= new Registry()
				moduledesc= await registry.resolve('node-pty@0.8.1')
				path= Path.join(moduledesc.folder, "build")
				if not fs.existsSync(path)
					fs.mkdirSync(path)
				
				path= Path.join(path, "Release")
				if not fs.existsSync(path)
					fs.mkdirSync(path)
				
				path= Path.join(path, "pty.node")
				if not fs.existsSync(path)
					content= await import("./pty.node")
					content= content.default ? content 
					fs.writeFileSync(path, content)
				
				# require 
				pty= require(moduledesc.folder)
				


			else 
				pty= await import('npmi://node-pty-prebuilt@0.7.6')

		prg= new Program()
		prg.main()


		

	main: ()->
		try
			action= process.argv[3]
			if action == "connect"
				@connect process.argv[4], process.argv[5] || ""
			else if action == "listen"
				@listen process.argv[4], process.argv.slice(5)

		catch e
			console.error "[ERROR]", e

	write: (std, data, conn)->
		if conn
			conn.write std + ":" +  data.toString('base64') + ">"
		else if @conns
			for id,conn of @.conns
				conn.write std + ":" +  data.toString('base64')  + ">"

	writeCache: (conn)->
		if @cache.data.length
			for c in @cache.data
				@write(c.std, c.data, conn)

	connect: (path, std1)->

		#colors.enabled = true
		ut= ''
		if Os.platform() is "win32"
			path= "//./pipe/" + path
		else if not path.startsWith("/")
			home= Os.homedir()
			home= Path.join(home, ".hidden-sessions")
			if not fs.existsSync(home)
				fs.mkdirSync(home)
			home= Path.join(home, path)


		socket= Net.createConnection
			path: path
		, ()->


		socket.on "data", (d)->
			try
				text= ut + d.toString()
				ut= text

				while text.indexOf(">") > 0
					i= text.indexOf(">")
					t= text.substring(0,i)
					sd= t.split(":")
					std= sd[0]
					if not std1 or (std1 is std)
						t= Buffer.from(sd[1],'base64')
						process[std].write t
						text = text.substring(i+1)
						ut= text



		socket.on "error", ()->



	listen: (path, args)->

		#colors.enabled = true

		self= this
		self.conns= self.conns || {}


		if Os.platform() is "win32"
			path= "//./pipe/" + path
		else if not path.startsWith("/")
			home= Os.homedir()
			home= Path.join(home, ".hidden-sessions")
			if not fs.existsSync(home)
				fs.mkdirSync(home)
			home= Path.join(home, path)


		###
		if args[0] == "__hidden"
			args.shift()

		else

			# start a detached process
			p= Child.spawn process.argv[0], process.argv.slice(1,4).concat(["__hidden"]).concat(args),
				env: process.env
				detached: yes
				stdio: 'ignore'

			p.unref()
			setTimeout ()->
				process.exit()
			, 1000
			return

		###

		if not pty 
			p= Child.spawn args[0], args.slice(1),
				#shell: yes
				env: Object.assign {}, process.env,
					FORCE_COLOR : '4'
				stdio: ['pipe','pipe','pipe']
		else 		
			p= pty.spawn args[0], args.slice(1),
				name: 'xterm-color',
				cols: process.stdout.cols,
				rows: process.stdout.rows,
				env: process.env

			process.stdout.on "resize", ()->
				pty.resize(process.stdout.cols, process.stdout.rows)


		cache= @cache
		mb= @mb
		std1= (std, d)->
			d= Buffer.from(d)
			cache.data.push
				std: std
				data: d
			cache.len+= d.length
			if cache.len > mb
				d1= cache.data.shift()
				cache.len -= (d1.length  ? 0)
			self.write std, d

		if pty 
			p.on "data", std1.bind(null, "stdout")
		else 
			p.stdout.on "data", std1.bind(null, "stdout")
			p.stderr.on "data", std1.bind(null, "stderr")

		###
		p.stderr.on "data", (d)->
			cache.data.push
				std: "stderr"
				data: d
			cache.len+= d.length
			if cache.len > mb
				d1= cache.data.shift()
				cache.len -= (d1.length  ? 0)

			self.write "stderr", d

		###

		p.on "exit", (c)->
			console.log(" > Process closed", args)
			process.exit c

		serv= Net.createServer (conn)->
			self.writeCache(conn)
			id= self.id++
			self.conns[id]= conn

			conn.on "close", ()->
				delete self.conns[id]
			conn.on "data", (d)->
				if p
					p.stdin.write(d)


		serv.on "error"	, ()->
		serv.once "error"	, (e)->
			console.error e
			process.exit(1)

		if fs.existsSync path
			fs.unlinkSync(path)
		serv.listen path

		serv.on "listen", ()->
			console.log "Listening", path
		setInterval ()->
		, 1000000


Program.main()
