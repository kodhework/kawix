#!/usr/bin/env node

var arg
var Path = require("path")
var Child = require("child_process")
var Os = require("os")
var fs = require("fs")
var Kawix = require("../main")
var offset = 0, pack, pack1, er, forceui
var args = [].concat(process.argv), cmd, cmdargs, pro, args1, proposals, enableCoffee
for (var i = 2; i < args.length; i++) {
    arg = args[i]
    if (!arg)
        break

    if (arg == "--reload" || arg == "--force") {
        process.argv.splice(offset + i, 1)
        offset--
        Kawix.KModule.defaultOptions = {
            force: true
        }
    }
    else if(arg == "--coffee"){
        enableCoffee = true 
    }
    else if (arg == "--ui" || arg == "--force-ui") {
        // in windows automatically is opened a visual terminal
        // but in osx and linux not 
        // this is for open visual terminal 
        if (Os.platform() == "darwin") {
            args1 = args.map(function (a, index) {
                if (index == i) {
                    return undefined
                }
                return "\\\"" + a + "\\\""
            })
            args1 = args1.filter(function (a) {
                return !!a
            })
            forceui = arg == "--force-ui"
            cmdargs = [
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
            if (process.env.DISPLAY) {

                proposals = [
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

                args1 = args.map(function (a, index) {
                    if (index == i) {
                        return undefined
                    }
                    return a //"\\\"" + a + "\\\""
                })
                args1 = args1.filter(function (a) {
                    return !!a
                })

                forceui = arg == "--force-ui"

                cmdargs = ["-e"].concat(args1)
            }
        }
    }
    else if (arg == "--update") {
        // this works on release version 
        pack = require("../package.json")
        er = function (e) {
            console.error("")
            console.error("Failed updating: ", e)
        }
        Kawix.KModule.import("https://kwx.kodhe.com/x/core/package.json", {
            force: true
        }).then(function (pack1) {

            if (pack.version >= pack1.version) {
                console.info("> kawix/core is up to date")
            } else {
                console.info("> kawix/core is not up to date. Please wait while is updated")
                Kawix.KModule.import("https://kwx.kodhe.com/x/core/dist/kwcore.app.js", {
                    force: true
                }).then(function (a) {
                    if (a)
                        console.info("> kawix/core was updated correctly")
                }).catch(er)
            }

        }).catch(er)
        return
    }
    else if (arg.startsWith("--")) {
        process.argv.splice(offset + i, 1)
        offset--
    }
    else {

        if (cmd) {
            if (!forceui) {
                forceui = arg.endsWith(".kwe") || arg.endsWith(".kwshc")
            }
        }


        var execute = function () {
            if(process.env.NODE_REQUIRE== 1){
                require(arg)
            }
            else{


                
                // require file using KModule
                Kawix.KModule.injectImport()
                Kawix.mainFilename = Path.resolve(arg)
                var options = {
                    parent:{
                        filename: process.cwd() + "/cli.js"
                    }
                }
                var erfunc = function(e){
                    console.error("Failed executing: ", e)
                }
                var func = function(){
                    Kawix.KModule.import(arg, options).then(function () { }).catch(erfunc)
                }
                if(enableCoffee){
                    pack = require("../package.json")
                    return Kawix.KModule.import("https://kwx.kodhe.com/x/v/"+pack.version+"/std/coffeescript/register",options)
                        .then(function(){
                            Kawix.KModule.import("https://kwx.kodhe.com/x/v/" + pack.version + "/std/coffeescript/cson/register", options)
                                .then(func).catch(erfunc)
                        }).catch(erfunc)
                }else{
                    return func()
                }
                
            }
        }

        if (forceui) {
            pro = Child.spawn(cmd, cmdargs, {
                cwd: process.cwd(),
                env: process.env,
                stdio: 'inherit'
            })
            pro.on("error", function (e) {
                console.log(" > Failed opening terminal ui", e)
                execute()
            })
            pro.on("exit", function (d) {
                process.exit(d)
            })
        } else {
            execute()
        }
        break
    }
}
