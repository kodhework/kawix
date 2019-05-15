import register from './register'
import colors from 'npm://colors@1.3.3/safe'
import {machineId} from 'npm://node-machine-id@1.1.10'
import Path from 'path'
import Os from 'os'
import fs from 'fs'

class Program 
	@main: ()->
		program= new Program()
		program.main() 
	
	deferred: ()->
		def= {}
		def.promise= new Promise (a,b)->
			def.resolve= a
			def.reject = b
		def
	
	readLineAsync: (char)->
		if char and @_str
			return @_str[0]

		str= @_str ? ''
		def= @deferred()
		read= (d)=>
			d = str + d.toString()

			if char
				@_str= d.substring(1)
				return def.resolve d[0]


			i= d.indexOf("\n")
			if i >= 0
				@_str= d.substring(i+1)
				d = d.substring(0, i)
				if d.endsWith("\r")
					d= d.substring(0, d.length - 1)

				def.resolve d
			else
				@_str = d
				process.stdin.once "data", read

		process.stdin.once "data", read
		def.promise

	main: ()->
		try 
			Installer= await KModule.import "./installer.coffee", 
				force: yes
			Installer= Installer.default ? Installer
			props = {}
			console.info ""

			###
			process.stdout.write " Write the type of download (kwa/git): "
			props.type = (await @readLineAsync()).trim()
			###

			process.stdout.write('\x1B[2J\x1B[0f')

			console.info("")
			console.info(" " + colors.yellow("1") + " > Install a package")
			console.info(" " + colors.yellow("2") + " > Create a DHS start script")
			console.info(" ")
			
			process.stdout.write " Please select an option: "
			props.action = (await @readLineAsync()).trim()

			if props.action is "2"

				process.stdout.write " Write the main adress (Default: 0.0.0.0:33016): "
				props.address = (await @readLineAsync()).trim()


				process.stdout.write " Write the project folder name (Leave empty for default): "
				props.projectName = (await @readLineAsync()).trim()

				process.stdout.write " Write the folder to generate the start files (default: current directory): "
				props.folder = (await @readLineAsync()).trim() or "default"
				
				props.nginxfile= Path.join(props.folder, "nginx")
				props.startjs  = Path.join(props.folder, "start.js")
				props.startcjs = Path.join(props.folder, "start.cluster.js")
				props.socket   = Path.join(props.folder, "socket")
				props.modules  = Path.join(props.folder, "modules")

				props.startBackground   = Path.join(props.folder, "start.background")
				props.connectBackground = Path.join(props.folder, "connect.background")
				props.startcBackground  = Path.join(props.folder, "start.cluster.background")
				#props.connectcBackground= Path.join(props.folder, "connect.cluster.background")



				process.stdout.write " Enable NGINX? (y/n): "
				props.nginx = (await @readLineAsync()).trim()

				## create the file 
				path= Path.join(Os.homedir(), "Kawix", props.projectName or "default", "kowix")


				code1 = """
import fs from 'fs'
import reg from 'https://kwx.kodhe.com/x/v/0.4.0/std/package/kwa/register.js'
import Path from 'path'
init()
async function init(){
		var address= #{JSON.stringify(props.address)}
		if(address){
			process.env.DHS_ADDRESS= address
		}
		if(fs.existsSync(__dirname + '/nginx')){
			process.env.DHS_NGINX_ENABLED= 1
		}
		var mod, kwa_file, f
		f= #{JSON.stringify(path)}
		if (fs.existsSync(f+ ".kwa")){
			mod = await import(f+ ".kwa")
			kwa_file = Path.dirname(mod["kawix.app"].original)
		}
		else{
			kwa_file= f
		}

		process.env.PROJECTS_DIR= kwa_file
		mod.startStandalone()
}
				"""

				code2 = """
import fs from 'fs'
import reg from 'https://kwx.kodhe.com/x/v/0.4.0/std/package/kwa/register.js'
import Path from 'path'
init()
async function init(){
		var address= #{JSON.stringify(props.address)}
		if(address){
			process.env.DHS_ADDRESS= address
		}
		if(fs.existsSync(__dirname + '/nginx')){
			process.env.DHS_NGINX_ENABLED= 1
		}
		var mod, kwa_file, f
		f= #{JSON.stringify(path)}
		if (fs.existsSync(f+ ".kwa")){
			mod = await import(f + ".kwa")
			kwa_file = Path.dirname(mod["kawix.app"].original)
		}
		else{
			kwa_file= f
		}
		process.env.PROJECTS_DIR= kwa_file
		mod.start()
}
				"""
				

				if !fs.existsSync(props.folder)
					fs.mkdirSync(props.folder)
				
				fs.writeFileSync(props.startjs, code1)
				fs.writeFileSync(props.startcjs, code2)

				code1 = """#!/usr/bin/env bash
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"

kwcore https://kwx.kodhe.com/x/v/0.4.0/std/util/background/start.hidden listen "$DIR/socket" kwcore "$DIR/start.js" &
				"""

				code2 = """#!/usr/bin/env bash
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"

kwcore https://kwx.kodhe.com/x/v/0.4.0/std/util/background/start.hidden listen "$DIR/socket" kwcore "$DIR/start.cluster.js" &
				"""

				fs.writeFileSync(props.startBackground, code1)
				fs.writeFileSync(props.startcBackground, code2)

				code1 = """#!/usr/bin/env bash
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"

kwcore https://kwx.kodhe.com/x/v/0.4.0/std/util/background/start.hidden connect "$DIR/socket"
				"""

				fs.writeFileSync(props.connectBackground, code1)
				#fs.writeFileSync(props.connectcBackground, code2)

				fs.chmodSync(props.connectBackground, '0755')
				#fs.chmodSync(props.connectcBackground, '0755')
				fs.chmodSync(props.startBackground, '0755')
				fs.chmodSync(props.startcBackground, '0755')

				if props.nginx?[0]?.toUpperCase() is 'Y'
					fs.writeFileSync(props.nginxfile, "y")
				else 
					fs.unlinkSync(props.nginxfile)

				if !fs.existsSync(props.modules)
					if Os.platform() is "win32"
						fs.symlinkSync(Path.join(Os.homedir(), "Kawix", props.projectName or "default"), props.modules, "junction")
					else 
						fs.symlinkSync(Path.join(Os.homedir(), "Kawix", props.projectName or "default"), props.modules)

			else if props.action is "1"
				process.stdout.write " Write the URL of package: "
				props.url = (await @readLineAsync()).trim()

				
				process.stdout.write " Write the version of package: "
				props.version= (await @readLineAsync()).trim()
				if props.type is "git"
					props.version = "master" if not props.version 
				else 
					props.version = "*" if not props.version 
				

				process.stdout.write " Write the password. (only for encrypted): "
				props.password = (await @readLineAsync()).trim()


				process.stdout.write " Write the key (only if required): "
				props.key = (await @readLineAsync()).trim()

				#process.stdout.write " Write the destination folder (Leave empty for default): "
				#props.folder = (await @readLineAsync()).trim()

				process.stdout.write " Write the project folder name (Leave empty for default): "
				props.projectName = (await @readLineAsync()).trim()

				

				mid= await machineId()
				mid= Buffer.from(mid,'hex').toString('base64')

				installer= new Installer
					url: props.url 
					version: props.version 
					password: props.password 
					key: props.key 
					machineid: mid 
				
				result= await installer.installInfo()
				if result.localversion 
					console.info(" The module is up to date")
				else 
					console.info(" Installing module")
					result= await installer.install(props.folder)
					console.info(" Installed")

					path= Path.join(Os.homedir(), "Kawix", props.projectName or "default", result.name + ".kwa")
					try 
						console.info(" Trying loading file: #{path}")
						await import(path)

		catch e 
			console.error("[ERROR] ", e)
		process.exit()
			
export default Program