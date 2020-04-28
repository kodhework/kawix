#!/usr/bin/env bash
# TERMUX SUPPORTED

export _HOME="$HOME/Kawix"


if [[ ! -e "$_HOME" ]]; then
    mkdir "$_HOME"
fi

if [[ ! -e "$_HOME/bin" ]]; then
    mkdir "$_HOME/bin"
fi

pkg install -y nodejs

rm "$_HOME/bin/kwcore.install.js" 2> /dev/null
cp kwcore.install.js "$_HOME/bin/kwcore.install.js"
cd $_HOME


# download kwcore.install.js
curl -L "https://kwx.kodhe.com/x/std/install/kwcore.install.js" -o "$_HOME/bin/kwcore.install.js"
curl -L "https://kwx.kodhe.com/x/std/install/linux.sh" -o "$_HOME/bin/kwcore.install.sh"


curl -L "https://kwx.kodhe.com/x/core/dist/kwcore.app.js" -o "$_HOME/bin/kwcore.app.js"



rm "$_HOME/kwcore.install.js" 2> /dev/null
rm "$_HOME/kwcore.app.js" 2> /dev/null
rm "$_HOME/kwcore.start.js" 2> /dev/null

cd "$_HOME/bin"
node "$_HOME/bin/kwcore.app.js"



# now symLink
rm -r "$_HOME/kwcore"

echo -e "#!""/usr/bin/node --http-parser=legacy\nprocess.env.KWCORE_ORIGINAL_EXECUTABLE = __filename\nrequire(process.env.HOME + '/Kawix/core/bin/cli')" > "$_HOME/bin/kwcore"
echo -e "#!""/usr/bin/node --http-parser=legacy\nprocess.env.KWCORE_ORIGINAL_EXECUTABLE = __filename\nrequire(process.env.HOME + '/Kawix/core/bin/cli')" > "$_HOME/bin/kawix"


chmod +x "$_HOME/bin/kwcore"
chmod +x "$_HOME/bin/kawix"

rm "$_HOME/kwcore" 2> /dev/null
rm "$_HOME/kawix" 2> /dev/null

cd "$_HOME"
ln -sf bin/kwcore ./kwcore
ln -sf bin/kawix ./kawix

echo "process.env.KWCORE_EXECUTE=1;require('./kwcore.app.js');" > "$_HOME/bin/kwcore.start.js"


ln -sf "$_HOME/bin/kwcore" $HOME/../usr/bin/kwcore

cd "$_HOME/bin"
./kwcore kwcore.install.js

