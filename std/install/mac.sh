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

if [[ ! -e "$_HOME/bin" ]]; then
    mkdir "$_HOME/bin"
fi



rm -f "$_HOME/bin/kwcore.install.js" 2> /dev/null



cp kwcore.install.js "$_HOME/bin/kwcore.install.js"
cd $_HOME


# download kwcore.install.js
curl -L "https://kwx.kodhe.com/x/std/install/kwcore.install.js" -o "$_HOME/bin/kwcore.install.js"
curl -L "https://kwx.kodhe.com/x/std/install/KawixCore.tar.gz" -o "$_HOME/KawixCore.tar.gz"
curl -L "https://kwx.kodhe.com/x/std/install/mac.sh" -o "$_HOME/bin/kwcore.install.sh"


# download nodejs 
curl "https://raw.githubusercontent.com/voxsoftware/kwcore-static/master/darwin/12.11.1.x64.tar.gz" -o "$_HOME/bin/node.tar.gz"
curl -L "https://kwx.kodhe.com/x/core/dist/kwcore.app.js" -o "$_HOME/bin/kwcore.app.js"



rm node 2> /dev/null
rm "$_HOME/kwcore.install.js" 2> /dev/null
rm "$_HOME/kwcore.app.js" 2> /dev/null
rm "$_HOME/kwcore.start.js" 2> /dev/null


cd "$_HOME/bin"
rm node 2> /dev/null


tar xvf node.tar.gz
chmod +x x64/12.11.1/node
ln -s ./x64/12.11.1/node node 
rm node.tar.gz


"$_HOME/bin/node" "$_HOME/bin/kwcore.app.js"

# now symLink 

#curl -L "https://kwx.kodhe.com/x/std/install/kwcore" -o "$_HOME/bin/kwcore"
#curl -L "https://kwx.kodhe.com/x/std/install/kwcore" -o "$_HOME/bin/kawix"

echo -e "#!""$_HOME/bin/node --http-parser=legacy\nprocess.env.KWCORE_ORIGINAL_EXECUTABLE = __filename\nrequire('/Users/' + process.env.USER + '/Kawix/core/bin/cli')" > "$_HOME/bin/kwcore"
echo -e "#!""$_HOME/bin/node --http-parser=legacy\nprocess.env.KWCORE_ORIGINAL_EXECUTABLE = __filename\nrequire('/Users/' + process.env.USER + '/Kawix/core/bin/cli')" > "$_HOME/bin/kawix"


chmod +x "$_HOME/bin/kwcore"
chmod +x "$_HOME/bin/kawix"


rm "$_HOME/kwcore" 2> /dev/null
rm "$_HOME/kawix" 2> /dev/null

cd "$_HOME"
ln -sf bin/kwcore ./kwcore
ln -sf bin/kawix ./kawix


echo "process.env.KWCORE_EXECUTE=1;require('./kwcore.app.js');" > "$_HOME/bin/kwcore.start.js" 

if [ "$EUID" -eq 0 ]
then
	ln -sf "$_HOME/bin/kwcore" /usr/local/bin/kwcore
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


cd "$_HOME/bin"
./kwcore kwcore.install.js