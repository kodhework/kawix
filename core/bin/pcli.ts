var Kawix = require("../main")
import Os from 'os'
import fs from 'fs'
import Path from 'path'

main()

export async function main() {

    try{
        /*
        fs.writeFileSync("xxxd", JSON.stringify({
            env: process.env,
            argv: process.argv
        }, null, '\t'))
        */

        let loadStd = async function(force = false){
            let pack = await Kawix.KModule.import("gh+/kodhework/kawix/std/package.json", {
                force
            })
            await Kawix.KModule.import("gh+/kodhework/kawix@std" + pack.version + "/std/dist/register.js")
        }
        Kawix.loadStd = loadStd

        let y = -1
        if (Kawix.optionArguments.indexOf("--update") >= 0) {
            let pack = await Kawix.KModule.import("gh+/kodhework/kawix/core/package.json", {
                force: true
            })
            let pack1 = require("../package.json")
            if (pack1.version < pack.version) {
                console.info("> Updating kawix/core to version:" + pack.version)
                await Kawix.KModule.import("gh+/kodhework/kawix@core" + pack.version + "/core/dist/kwcore.app.js", {
                    force: true
                })
            }
            else {
                console.info("> kawix/core version " + pack.version + " is OK")
            }

            await loadStd(true)
            return
        }

        y = Kawix.optionArguments.indexOf("--map")
        if (y >= 0) {

            let WritePath = await import(__dirname + "/write.path")

            // generate an executable file
            var dirname = Path.dirname(process.execPath)
            var file = Path.join(Os.homedir(), "Kawix", "bin")
            if (!fs.existsSync(file)) {
                fs.mkdirSync(file)
            }
            file = Path.join(file, Kawix.optionArguments[y+1])

            var content0 = ''
            if (Os.platform() == "win32") {
                file = Path.join(Os.homedir(), "Kawix", "bin", Kawix.appArguments[y+1] + ".cmd")
                content0 = '@echo off\nset current=%~dp0\n"%current%\\kwcore.exe" --original-file "%~n0%~x0" "' + Kawix.appArguments[0] + '" %*'
            } else {

                WritePath.write(Path.join(Os.homedir(), "Kawix", "bin"))


                content0 = "#!" + process.execPath + "\n" +
                    "// kawix.originalFilename = __filename\n" +
                    "process.argv = [process.execPath, " + JSON.stringify(__filename) + ", " + Kawix.appArguments[0] + "].concat(process.argv.slice(2))\n" +
                    "require(" + JSON.stringify(__filename) + ")\n"
                
            }
            fs.writeFileSync(file, content0)
            fs.chmodSync(file, "775")
            return

            
        }


        let newWindow = false
        let uiArgs = null, cmd = null
        if (Os.platform() == "darwin") {
            let args1 = ([process.argv[0], process.argv[1]].concat(Kawix.appArguments)).map(function (a, index) {
                return "\\\"" + a + "\\\""
            })
            args1 = args1.filter(function (a) {
                return !!a
            })
            uiArgs = [
                "-e",
                "tell application \"Terminal\"",
                "-e",
                "Activate",
                "-e",
                "do script \"" + args1.join(" ") + ";exit;\\n\"",
                "-e",
                "end tell"
            ]
            cmd = "osascript"

        }

        else if (Os.platform() == "linux") {
            if (process.env.DISPLAY && (!process.stdin.isTTY)) {

                let proposals = [
                    "/usr/bin/xdg-terminal",
                    "/usr/bin/x-terminal-emulator",
                    "/usr/bin/gnome-terminal",
                    "/usr/bin/mrxvt",
                    "/usr/bin/mrxvt-full",
                    "/usr/bin/roxterm",
                    "/usr/bin/urxvt",
                    "/usr/bin/xfce4-terminal"
                ]
                for (var z = 0; z < proposals.length; z++) {
                    cmd = proposals[z]
                    if (fs.existsSync(cmd))
                        break
                }
                let args1 = ([process.argv[0], process.argv[1]].concat(Kawix.appArguments)).map(function (a, index) {
                    return a //"\\\"" + a + "\\\""
                })
                args1 = args1.filter(function (a) {
                    return !!a
                })

                uiArgs = ["-e"].concat(args1)
                if (cmd && cmd.indexOf("xfce4") >= 0) {
                    uiArgs = ["-e", args1.map(function (a) {
                        return '"' + a + '"'
                    }).join(" ")]
                }
            }
        }

        else if (Os.platform() == "win32") {


            let args1 = ([process.argv[0], process.argv[1]].concat(Kawix.appArguments)).map(function (a, index) {
                return a //"\\\"" + a + "\\\""
            })
            args1 = args1.filter(function (a) {
                return !!a
            })
            args1.shift()


            var name1 = Path.basename(process.execPath, ".exe")
            if (name1.endsWith("w"))
                name1 = name1.substring(0, name1.length - 1)
            cmd = Path.join(Path.dirname(process.execPath), name1 + ".exe")
            uiArgs = args1

            if (process.env.WINDOWS_GUI == "1") newWindow = true
        }



        let filename = Kawix.appArguments[0]
        if (!filename) return



        if (process.env.KWCORE_FORCE_UI) {
            delete process.env.KWCORE_FORCE_UI
            newWindow = true
        }
        if ((Kawix.optionArguments.indexOf("--new-window") >= 0) || (Kawix.optionArguments.indexOf("--ui") >= 0)) {
            newWindow = true
        }





        let openNewWindow = function () {
            let Child = require("child_process")
            let pro = Child.spawn(cmd, uiArgs, {
                cwd: process.cwd(),
                env: Object.assign({}, process.env, {
                    KWCORE_FORCED_UI: "1",
                    WINDOWS_GUI: "0"
                }),
                detached: Os.platform() == "win32",
                windowsHide: false,
                shell: Os.platform() == "win32"
            })
            pro.on("error", function (e) {
                console.log(" > Failed opening terminal ui", e)
            })
            pro.on("exit", function (d) {
                process.exit(d)
            })
            return
        }




        if (!fs.existsSync(filename)) {
            let newfilename = null
            for (var ext in Kawix.KModule.extensions) {
                newfilename = filename + ext
                if (fs.existsSync(newfilename)) {
                    break
                }
                newfilename = null
            }


            if (newfilename) {
                filename = newfilename
            }
            else {
                newfilename = filename + ".kwa"
                if (fs.existsSync(newfilename)) {
                    filename = newfilename
                }
            }
        }


        if (filename.substring(0, 4) != "gh+/" && filename.indexOf("://") < 0)
            filename = Kawix.mainFilename = Path.resolve(filename)
        else
            Kawix.mainFilename = filename



        // Load the file 
        if (filename.toUpperCase().endsWith(".KWA")) {
            await loadStd()
            await import("/virtual/@kawix/std/package/kwa/register")

            let mod = await import(filename)
            if (mod && mod.Program) {
                if ((mod.Program.type == "terminal") && newWindow) {
                    return openNewWindow()
                }
                await mod.Program.main()
            }
        }
        else {

            if (newWindow && uiArgs) {
                return openNewWindow()
            }
            await import(filename)
        }
    }catch(e){
        console.error(e)
    }
}