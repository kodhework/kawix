#!/usr/bin/env bash
if [ "$EUID" -eq 0 ]
then
	export _HOME=/usr/local/Kawix
else
	export _HOME="/Users/$USER/Kawix"
fi

if [[ ! -e $dir ]]; then
    mkdir $dir
fi

rm -f "$_HOME/kwcore.install.js"
cp kwcore.install.js "$_HOME/kwcore.install.js"
cd $_HOME

# download kwcore.install.js
wget "https://kwx.kodhe.com/x/std/install/kwcore.install.js" -O "$_HOME/kwcore.install.js"
wget "https://kwx.kodhe.com/x/std/install/KawixCore.tar.gz" -O "$_HOME/KawixCore.tar.gz"

# download nodejs 
wget "https://raw.githubusercontent.com/voxsoftware/node-binaries/master/darwin/x64/10.15.3/node.gz" -O "$_HOME/node.gz"
wget "https://kwx.kodhe.com/x/core/dist/kwcore.app.js" -O "$_HOME/kwcore.app.js"
#wget "https://kwx.kodhe.com/x/std/install/dist/kwcore.app.js" -O "$_HOME/kwcore.app.js"


rm node 2> /dev/null

gunzip node.gz 
chmod +x node

"$_HOME/node" "$_HOME/kwcore.app.js"

# now symLink 
rm -r "$_HOME/kwcore"
wget "https://kwx.kodhe.com/x/std/install/kwcore" -O "$_HOME/kwcore"
chmod +x "$_HOME/kwcore"

if [ "$EUID" -eq 0 ]
then
	ln -sf "$_HOME/kwcore" /usr/local/bin/kwcore
fi





# download icons 
mkdir icons
wget "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/16x16.png" -O icons/16x16.png
wget "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/24x24.png" -O icons/24x24.png
wget "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/32x32.png" -O icons/32x32.png
wget "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/48x48.png" -O icons/48x48.png
wget "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/64x64.png" -O icons/64x64.png
wget "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/96x96.png" -O icons/96x96.png
wget "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/128x128.png" -O icons/128x128.png
wget "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/256x256.png" -O icons/256x256.png
wget "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/512x512.png" -O icons/512x512.png


# download app
if [ "$EUID" -eq 0 ]
then
	cd /Applications
else 
	cd ~/Applications
fi
tar xvf "$_HOME/KawixCore.tar.gz"
rm -f "$_HOME/KawixCore.tar.gz"


cd "$_HOME"
./kwcore kwcore.install.js
