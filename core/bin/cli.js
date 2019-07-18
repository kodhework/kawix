#!/usr/bin/env node

var arg
var Path = require("path")
var Child = require("child_process")
var Os = require("os")
var fs = require("fs")
var Kawix = require("../main")
var offset = 0, pack, pack1, er, forceui
var originalArgs = [].concat(process.argv.slice(1))

var args = [].concat(process.argv), cmd, cmdargs, pro, args1, proposals, enableCoffee, ignoreKwaValidation
pack = require("../package.json")




var enableUi = function (force) {
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
        forceui = force
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

            forceui = force
            cmdargs = ["-e"].concat(args1)
        }
    }
}

if (process.env.KWCORE_FORCE_UI) {
    enableUi(true)
}

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
    else if (arg == "--install-std") {
        arg = args.push("https://kwx.kodhe.com/x/v/" + pack.version + "/std/dist/stdlib.js")
        console.log(" > Loading STDLIB")
    }


    else if (arg == "--coffee") {
        enableCoffee = true
    }
    else if (arg == "--ui" || arg == "--force-ui") {
        enableUi(arg == "--force-ui")
    }
    else if (arg == "--update") {
        // this works on release version 

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
    /*
    else if (arg.startsWith("--ignore-kwa-validation")) {
        process.argv.splice(offset + i, 1)
        ignoreKwaValidation = true 
        offset--
    }*/
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

        var forceuiFunc
        var execute = function () {
            if (process.env.NODE_REQUIRE == 1) {
                require(arg)
            }
            else {

                Kawix.KModule.injectImport()
                Kawix.mainFilename = Path.resolve(arg)
                var options = {
                    parent: {
                        filename: process.cwd() + "/cli.js"
                    }
                }



                // require file using KModule                
                var erfunc = function (e) {
                    console.error("Failed executing: ", e)
                }
                var func = function () {
                    Kawix.KModule.import(arg, options).then(function () { }).catch(erfunc)
                }
                var funcKwa = function () {
                    Kawix.KModule.import(arg, options).then(function (result) {
                        ignoreKwaValidation = process.env.KWCORE_FORCED_UI == 1
                        if (result && result.Program) {
                            if (!ignoreKwaValidation) {
                                if (result.Program.type == "terminal") {
                                    forceui = true
                                    cmdargs = originalArgs // [originalArgs[0],  "--force-ui"].concat(originalArgs.slice(1))
                                    cmd = process.execPath
                                    if (Os.platform() == "win32") {
                                        if (process.env.WINDOWS_GUI == 1) {
                                            var name = Path.basename(cmd, ".exe")
                                            if (name.endsWith("w")) {
                                                name = name.substring(0, name.length - 1)
                                            }
                                            cmd = Path.join(Path.dirname(cmd), name + ".exe")
                                            cmdargs.shift()
                                        } else {
                                            forceui = false
                                        }
                                    }
                                    if (forceui)
                                        return forceuiFunc()
                                }
                            }

                            if (!forceui) {
                                if (result.Program.main) {
                                    try {
                                        result = result.Program.main()
                                        if (result && result.then) {
                                            result.then(function () { }).catch(erfunc)
                                        }
                                    } catch (e) {
                                        erfunc(e)
                                    }
                                }
                                return
                            }
                        }

                    }).catch(erfunc)
                }
                if (arg.endsWith(".kwa")) {

                    // LOAD THE KWA REGISTER
                    Kawix.KModule.import("https://kwx.kodhe.com/x/v/"+pack.version+"/std/dist/stdlib.js")
                        .then(function () {

                            Kawix.KModule.import("/virtual/@kawix/std/package/kwa/register")
                                .then(funcKwa).catch(erfunc)

                        }).catch(erfunc)

                }
                else if (enableCoffee) {
                    pack = require("../package.json")
                    return Kawix.KModule.import("https://kwx.kodhe.com/x/v/" + pack.version + "/std/coffeescript/register", options)
                        .then(function () {
                            Kawix.KModule.import("https://kwx.kodhe.com/x/v/" + pack.version + "/std/coffeescript/cson/register", options)
                                .then(func).catch(erfunc)
                        }).catch(erfunc)
                } else {
                    return func()
                }

            }
        }
        forceuiFunc = function () {
            pro = Child.spawn(cmd, cmdargs, {
                cwd: process.cwd(),
                env: Object.assign({}, process.env, {
                    KWCORE_FORCED_UI: "1",
                    WINDOWS_GUI: "0"
                }),
                detached: true,
                windowsHide: false,
                shell: true
            })
            pro.on("error", function (e) {
                console.log(" > Failed opening terminal ui", e)
                execute()
            })
            pro.on("exit", function (d) {
                process.exit(d)
            })
        }
        if (forceui) {
            forceuiFunc()
        } else {
            execute()
        }
        break
    }
}
