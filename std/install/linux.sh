#!/usr/bin/env bash
if [ "$EUID" -eq 0 ]
then
	export _HOME=/usr/local/Kawix
else
	export _HOME="$HOME/Kawix"
fi

if [[ ! -e "$_HOME" ]]; then
    mkdir "$_HOME"
fi

rm -f "$_HOME/kwcore.install.js"
cp kwcore.install.js "$_HOME/kwcore.install.js"
cd $_HOME

# download kwcore.install.js
curl -L "https://kwx.kodhe.com/x/std/install/kwcore.install.js" -O "$_HOME/kwcore.install.js"

# download nodejs
curl -L "https://raw.githubusercontent.com/voxsoftware/node-binaries/master/linux/x64/10.15.3/node.gz" -o "$_HOME/node.gz"
curl -L "https://kwx.kodhe.com/x/core/dist/kwcore.app.js" -o "$_HOME/kwcore.app.js"



rm node 2> /dev/null

gunzip node.gz
chmod +x node

"$_HOME/node" "$_HOME/kwcore.app.js"

# now symLink
rm -r "$_HOME/kwcore"
curl -L "https://kwx.kodhe.com/x/std/install/kwcore" -o "$_HOME/kwcore"
chmod +x "$_HOME/kwcore"

if [ "$EUID" -eq 0 ]
then
	ln -sf "$_HOME/kwcore" /usr/bin/kwcore
fi


# download icons
mkdir icons
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/16x16.png" -o icons/16x16.png
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/24x24.png" -o icons/24x24.png
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/32x32.png" -o icons/32x32.png
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/48x48.png" -o icons/48x48.png
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/64x64.png" -o icons/64x64.png
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/96x96.png" -o icons/96x96.png
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/128x128.png" -o icons/128x128.png
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/256x256.png" -o icons/256x256.png
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/512x512.png" -o icons/512x512.png


./kwcore kwcore.install.js
