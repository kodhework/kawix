#!/usr/bin/env bash
if [ "$EUID" -eq 0 ]
then
	export _HOME=/usr/local/Kawix
else
	export _HOME="/Users/$USER/Kawix"
fi

if [[ ! -e "$_HOME" ]]; then
    mkdir "$_HOME"
fi

rm -f "$_HOME/kwcore.install.js"
cp kwcore.install.js "$_HOME/kwcore.install.js"
cd $_HOME

# download kwcore.install.js
curl -L "https://kwx.kodhe.com/x/std/install/kwcore.install.js" -o "$_HOME/kwcore.install.js"
curl -L "https://kwx.kodhe.com/x/std/install/KawixCore.tar.gz" -o "$_HOME/KawixCore.tar.gz"

# download nodejs 
curl "https://raw.githubusercontent.com/voxsoftware/node-binaries/master/darwin/x64/10.15.3/node.gz" -o "$_HOME/node.gz"
curl -L "https://kwx.kodhe.com/x/core/dist/kwcore.app.js" -o "$_HOME/kwcore.app.js"
#wget "https://kwx.kodhe.com/x/std/install/dist/kwcore.app.js" -O "$_HOME/kwcore.app.js"


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
	ln -sf "$_HOME/kwcore" /usr/local/bin/kwcore
fi



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
