var Path= require("path")
var Os= require("os")
var fs= require("fs")
var Child= require("child_process")

var dir= __dirname 
// add to profile 
var file= Path.join(Os.homedir(),".profile")
if(process.getuid() == 0){
	file= "/etc/profile"
}
var newline = "\n#kwcore PATH\nexport PATH=\"$PATH:" + dir  
var content= fs.readFileSync(file,'utf8')
if(content.indexOf(newline) < 0){
	fs.writeFileSync(file, content + newline + "\n")
	if (process.getuid() == 0) {
		file = Path.join(Os.homedir(), ".bashrc")
		if(fs.existsSync(file)){
			content = fs.readFileSync(file, 'utf8')
			if (content.indexOf(newline) < 0) {
				fs.writeFileSync(file, content + newline + "\n")
			}
		}
	}
}


// install the icons 
var id="kawixcoreapp"
if(Os.platform() == "linux"){
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

	for(var i=0;i<srcicons.length;i++){
		
		if (!fs.existsSync(iconpaths[i]))
			fs.mkdirSync(iconpaths[i])
		if (!fs.existsSync(Path.join(iconpaths[i],"apps")))
			fs.mkdirSync(Path.join(iconpaths[i], "apps"))
		fs.copyFileSync(srcicons[i], Path.join(iconpaths[i], "apps", id + ".png"))
	}

	// now create desktop file 
	var t = `[Desktop Entry]
Terminal=false
Icon=${id}
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
        <icon name="${id}"/>
     </mime-type>

</mime-info>
	`)

	var p=Child.spawn("update-icon-caches", [paths.icon])
	p.on("error", function(e){
		console.error("ERROR updating icon cache: ", e)
	})

	var p1 = Child.spawn("update-desktop-database", [paths.apps])
	p1.on("error", function (e) {
		console.error("ERROR updating apps cache: ", e)
	})

	var p1 = Child.spawn("update-mime-database", [paths.mime])
	p1.on("error", function (e) {
		console.error("ERROR updating mime cache: ", e)
	})


}