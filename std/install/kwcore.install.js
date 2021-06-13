var Path= require("path")
var Os= require("os")
var fs= require("fs")
var Child= require("child_process")

var dir= __dirname
var dir2 = Path.normalize(Path.join(__dirname, ".."))


var writePath = function (dir) {

	var newline = "\n#kwcore PATH\nexport PATH=\"$PATH:" + dir


	var file = Path.join(Os.homedir(), ".bashrc")
	if (process.getuid() == 0) {
		file = "/etc/bash.bashrc"
	}
	var content = ''
	if (fs.existsSync(file)) {
		content = fs.readFileSync(file, 'utf8')
	}
	if (content.indexOf(newline) < 0) {
		fs.writeFileSync(file, content + newline + "\"\n")
	}


	file = Path.join(Os.homedir(), ".zshrc")
	if (process.getuid() == 0) {
		file = "/etc/zsh/zshrc"
		if(!fs.existsSync("/etc/zsh")){
			fs.mkdirSync("/etc/zsh")
		}
	}
	var content = ''
	if (fs.existsSync(file)) {
		content = fs.readFileSync(file, 'utf8')
	}
	if (content.indexOf(newline) < 0) {
		fs.writeFileSync(file, content + newline + "\"\n")
	}



	if (process.getuid() != 0) {
		file = Path.join(Os.homedir(), ".profile")
	}
	else {
		file = "/etc/profile"
	}
	content = ''
	if (fs.existsSync(file)) {
		content = fs.readFileSync(file, 'utf8')
	}
	if (content.indexOf(newline) < 0) {
		fs.writeFileSync(file, content + newline + "\"\n")
	}
}

writePath(dir)
writePath(dir2)

process.stdout.write('c')
console.info("")
console.info(" > Finishing @kawix/core installing")
kawix.KModule.import("https://kwx.kodhe.com/x/v/" + global.kawix.version + "/std/dist/stdlib")
	.then(function(){})
	.catch(function(er){
		console.error(" > Failed installing stdlib")
	})


// install the icons
var id="kawixcoreapp"
var init= async function(){
	try{
		if(Os.platform() == "darwin"){


			/*
			// add extension handler
			var cmd= "defaults"
			var args=[
				[
					"write",
					"com.apple.LaunchServices",
					"LSHandlers",
					"-array-add",
					"<dict><key>LSHandlerContentTag</key><string>kwe</string><key>LSHandlerContentTagClass</key><string>public.filename-extension</string><key>LSHandlerRoleAll</key><string>org.kodhe.kawix</string></dict>"
				],
				[
					"write",
					"com.apple.LaunchServices",
					"LSHandlers",
					"-array-add",
					"<dict><key>LSHandlerContentTag</key><string>kwsh</string><key>LSHandlerContentTagClass</key><string>public.filename-extension</string><key>LSHandlerRoleAll</key><string>org.kodhe.kawix</string></dict>"
				],
				[
					"write",
					"com.apple.LaunchServices",
					"LSHandlers",
					"-array-add",
					"<dict><key>LSHandlerContentTag</key><string>kwo</string><key>LSHandlerContentTagClass</key><string>public.filename-extension</string><key>LSHandlerRoleAll</key><string>org.kodhe.kawix</string></dict>"
				]
			]
			var p1, def
			for(var i=0;i<args.length;i++){
				def= {}
				def.promise= new Promise(function(a,b){
					def.resolve= a
					def.reject = b
				})
				p1= Child.spawn(cmd, args)
				p1.on("error", def.reject)
				p1.on("exit", def.resolve)
				await def.promise
			}


			def = {}
			def.promise = new Promise(function (a, b) {
				def.resolve = a
				def.reject = b
			})


			p1= Child.spawn("/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister", [
				"-kill",
				"-domain",
				"local",
				"-domain",
				"system",
				"-domain",
				"user"
			])

			p1.on("error", def.reject)
			p1.on("exit", def.resolve)*/

		}
		else if(Os.platform() == "linux"){
			var iconpaths, paths={}, srcicons
			if (process.getuid() == 0) {
				paths.icon = "/usr/share/icons/hicolor"
				paths.apps = "/usr/share/applications"
				paths.mime = "/usr/share/mime/packages"
				paths.mimeo = "/usr/share/mime"
			}
			else{
				paths.icon = Path.join(Os.homedir(), ".local/share/icons/hicolor")
				paths.apps = Path.join(Os.homedir(), ".local/share/applications")
				paths.mime = Path.join(Os.homedir(), ".local/share/mime/packages")
				paths.mimeo = Path.join(Os.homedir(), ".local/share/mime")
			}


			if(!fs.existsSync(paths.apps)){
				fs.mkdirSync(paths.apps)
			}
			if (!fs.existsSync(paths.icon)) {
				if (!fs.existsSync(Path.dirname(paths.icon)) ){
					fs.mkdirSync(Path.dirname(paths.icon))
				}
				fs.mkdirSync(paths.icon)
			}
			if (!fs.existsSync(paths.mimeo)) {
				fs.mkdirSync(paths.mimeo)
			}
			if (!fs.existsSync(paths.mime)) {
				fs.mkdirSync(paths.mime)
			}

			iconpaths = [
				paths.icon + "/16x16",
				paths.icon + "/24x24",
				paths.icon + "/32x32",
				paths.icon + "/48x48",
				paths.icon + "/64x64",
				paths.icon + "/96x96",
				paths.icon + "/128x128",
				paths.icon + "/256x256",
				paths.icon + "/512x512"]

			srcicons= [
				Path.join(__dirname, "icons", "16x16.png"),
				Path.join(__dirname, "icons", "24x24.png"),
				Path.join(__dirname, "icons", "32x32.png"),
				Path.join(__dirname, "icons", "48x48.png"),
				Path.join(__dirname, "icons", "64x64.png"),
				Path.join(__dirname, "icons", "96x96.png"),
				Path.join(__dirname, "icons", "128x128.png"),
				Path.join(__dirname, "icons", "256x256.png"),
				Path.join(__dirname, "icons", "512x512.png")
			]

			let iconid = id + "_0"
			for(var i=0;i<srcicons.length;i++){

				if (!fs.existsSync(iconpaths[i]))
					fs.mkdirSync(iconpaths[i])
				if (!fs.existsSync(Path.join(iconpaths[i],"apps")))
					fs.mkdirSync(Path.join(iconpaths[i], "apps"))
				fs.copyFileSync(srcicons[i], Path.join(iconpaths[i], "apps", iconid + ".png"))
			}

			// now create desktop file
			var t = `[Desktop Entry]
		Terminal=false
		Icon=${iconid}
		Type=Application
		Categories=Application;Network;
		Exec="${dir}/kwcore" --ui %F
		MimeType=application/kawix-core;
		Name=Kawix Core
		Comment= `;
			fs.writeFileSync(Path.join(paths.apps, id + ".desktop"), t)


			// now mime types
			fs.writeFileSync(Path.join(paths.mime, id + ".xml"), `<?xml version="1.0" encoding="UTF-8"?>
		<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
		<mime-type type="application/kawix-core">
			<comment xml:lang="en">KawixCore script</comment>
			<glob pattern="*.kwe" />
			<glob pattern="*.kwsh" />
			<glob pattern="*.kwo" />
			<glob pattern="*.kwa" />
			<icon name="${iconid}"/>
		</mime-type>
		<mime-type type="application/kawix-package">
			<comment xml:lang="en">KawixCore Package</comment>
			<glob pattern="*.kwi"/>
			<icon name="${iconid}"/>
		</mime-type>
		</mime-info>
			`)

			var er, c = 0, d
			var p=Child.spawn("update-icon-caches", [paths.icon])
			p.on("error", function(e){
				console.error("[Warning] Cannot execute update-icon-cache. You can ignore if your have a server distro", e)
			})
			p.on("exit", function () { c++; d() })

			p = Child.spawn("update-desktop-database", [paths.apps])
			p.on("error", function (e) {
				er= true
				console.error("[Warning] Cannot execute update-desktop-database. You can ignore if your have a server distro")
			})
			p.on("exit", function(){c++; d()})

			var p1 = Child.spawn("update-mime-database", [paths.mimeo])
			p1.on("error", function (e) {
				er= true
				console.error("[Warning] Cannot execute update-mime-database. You can ignore if your have a server distro")
			})
			p1.on("exit", function () { c++; d()})
			d= function(){
				if(er) return
				if(c==3){
					console.info("")
					console.info("")
					return console.info(" > Was detected an installation with UI interfaz, installation and desktop app was installed")
				}
			}

		}
	}catch(e){
		console.error(" > ERROR Installing: ", e)
	}
}
init()
