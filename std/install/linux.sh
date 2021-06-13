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

if [[ ! -e "$_HOME/bin" ]]; then
    mkdir "$_HOME/bin"
fi



rm "$_HOME/bin/kwcore.install.js" 2> /dev/null



cp kwcore.install.js "$_HOME/bin/kwcore.install.js"
cd $_HOME

# download kwcore.install.js
curl -L "https://kwx.kodhe.com/x/std/install/kwcore.install.js" -o "$_HOME/bin/kwcore.install.js"
curl -L "https://kwx.kodhe.com/x/std/install/linux.sh" -o "$_HOME/bin/kwcore.install.sh"

# download nodejs
curl -L "https://raw.githubusercontent.com/voxsoftware/kwcore-static/master/linux/12.18.3.x64.tar.gz" -o "$_HOME/bin/node.tar.gz"
curl -L "https://kwx.kodhe.com/x/core/dist/kwcore.app.js" -o "$_HOME/bin/kwcore.app.js"


rm node 2> /dev/null
rm "$_HOME/kwcore.install.js" 2> /dev/null
rm "$_HOME/kwcore.app.js" 2> /dev/null
rm "$_HOME/kwcore.start.js" 2> /dev/null

cd "$_HOME/bin"
rm node 2> /dev/null

tar xvf node.tar.gz

rm ./node
chmod +x x64/12.18.3/node
ln -s ./x64/12.18.3/node node
rm node.tar.gz

"$_HOME/bin/node" "$_HOME/bin/kwcore.app.js"

# now symLink
rm -r "$_HOME/kwcore"

#curl -L "https://kwx.kodhe.com/x/std/install/kwcore" -o "$_HOME/bin/kwcore"
#curl -L "https://kwx.kodhe.com/x/std/install/kwcore" -o "$_HOME/bin/kawix"

echo -e "#!""$_HOME/bin/node --http-parser=legacy\nprocess.env.KWCORE_ORIGINAL_EXECUTABLE = __filename\nrequire(process.env.HOME + '/Kawix/core/bin/cli')" > "$_HOME/bin/kwcore"
echo -e "#!""$_HOME/bin/node --http-parser=legacy\nprocess.env.KWCORE_ORIGINAL_EXECUTABLE = __filename\nrequire(process.env.HOME + '/Kawix/core/bin/cli')" > "$_HOME/bin/kawix"


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
	ln -sf "$_HOME/bin/kwcore" /usr/bin/kwcore
fi


# download icons
cd "$_HOME/bin"
mkdir icons
curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/icons.tar.gz" -o icons/kwcore.icons.tar.gz


#curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/24x24.png" -o icons/24x24.png
#curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/32x32.png" -o icons/32x32.png
#curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/48x48.png" -o icons/48x48.png
#curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/64x64.png" -o icons/64x64.png
#curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/96x96.png" -o icons/96x96.png
#curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/128x128.png" -o icons/128x128.png
#curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/256x256.png" -o icons/256x256.png
#curl "https://raw.githubusercontent.com/voxsoftware/kawix/master/icons/512x512.png" -o icons/512x512.png


cd icons
tar xvf kwcore.icons.tar.gz
rm kwcore.icons.tar.gz



cd "$_HOME/bin"
./kwcore kwcore.install.js

# Install AppDemon
./kwcore gh+/voxsoftware/packages/appdemon/0.1.4.kwa --install
