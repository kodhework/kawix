#!/usr/bin/env node

var arg
var Path = require("path")
var Child = require("child_process")
var Os = require("os")
var fs = require("fs")
var WritePath = require("./write.path")
var Kawix = require("../main")
var offset = 0, pack, pack1, er, forceui


if (process.argv[1] && (process.argv[1] == process.argv[2])) {
	var _arg = process.argv[1]
	if (_arg.substring(_arg.length - 6) == "app.js")
		process.argv.splice(1, 1)
}


var originalArgs = [].concat(process.argv.slice(1))
var oargs = [].concat(process.argv)
var args = [].concat(process.argv), cmd, cmdargs, pro, args1,
	proposals, enableCoffee, ignoreKwaValidation, env1 = {}, map
pack = require("../package.json")




var enableUi = function (force, i) {
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
			if(cmd && cmd.indexOf("xfce4")>=0){
				cmdargs = ["-e", args1.map(function(a){
					return '"' + a + '"'
				}).join(" ") ]
			}
		}
	}
	else if (Os.platform() == "win32") {

		args1 = args.map(function (a, index) {
			if (index == i) {
				return undefined
			}
			return a //"\\\"" + a + "\\\""
		})
		args1 = args1.filter(function (a) {
			return !!a
		})
		args1.shift()

		// In new versions is not needed shift argument position 1
		// args1.shift()

		var name1 = Path.basename(process.execPath, ".exe")
		if (name1.endsWith("w"))
			name1 = name1.substring(0, name1.length - 1)
		cmd = Path.join(Path.dirname(process.execPath), name1 + ".exe")
		cmdargs = args1
		forceui = force
	}
}

if (process.env.KWCORE_FORCE_UI) {
	delete process.env.KWCORE_FORCE_UI; enableUi(true)
}


var InstallStd = function () {
	var er = function (e) {
		console.error(" > Failed loading stdlib", e)
	}
	Kawix.KModule.import("https://kwx.kodhe.com/x/std/package.json", {
		force: true
	}).then(function (pack) {
		let file = ''
		if(parseInt(pack.version.split(":")[1]) >= 9)
			file = "https://kwx.kodhe.com/x/v/" + pack.version + "/std/dist/register"
		else
			file = "https://kwx.kodhe.com/x/v/" + pack.version + "/std/dist/stdlib"
		console.log(" > Loading stdlib")
		Kawix.KModule.import(file).then(function () { }).catch(er)
	}).catch(er)
	return
}


for (var i = 2; i < args.length; i++) {
	arg = args[i]
	if (!arg)
		break
	if (arg == "_______internal")
		continue

	if (arg == "--reload" || arg == "--force") {
		process.argv.splice(offset + i, 1)
		offset--
		Kawix.KModule.defaultOptions = {
			force: true
		}
	}
	else if (arg == "--install-std") {

		return InstallStd()
	}

	else if (arg == "--map") {
		map = args[i + 1]
		if (!map) {
			console.error(" > Provide an argument(name of app) for option --map")
			process.exit(1)
		}
		process.argv.splice(offset + i, 2)
		offset -= 2
		args[i + 1] = "_______internal"

	}

	else if (arg == "--original-file") {
		kawix.originalFilename = args[i + 1]
		//console.info(kawix.originalFilename)
		if (!args[i + 1]) {
			console.error(" > Provide an argument for option --original-file")
			process.exit(1)
		}
		process.argv.splice(offset + i, 2)
		offset -= 2
		args[i + 1] = "_______internal"


	}


	else if (arg == "--coffee") {
		enableCoffee = true
	}
	else if (arg == "--ui" || arg == "--force-ui") {
		enableUi(arg == "--force-ui", i)
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

			if (pack.stdVersion >= pack1.version) {
				console.info(" > Core is up to date. Searching updates for stdlib")
				InstallStd()
				//console.info("> kawix/core is up to date")
			} else {
				console.info("> kawix/core is not up to date. Please wait while is updated")
				Kawix.KModule.import("https://kwx.kodhe.com/x/core/dist/kwcore.app.js", {
					force: true
				}).then(function (a) {

					if (a) {
						InstallStd()
					}

				}).catch(er)
			}

		}).catch(er)
		return
	}

	else if (arg.startsWith("--ignore-kwa-validation") || arg.startsWith("--disable-ui")) {
		process.argv.splice(offset + i, 1)
		ignoreKwaValidation = true
		process.env.KWCORE_FORCED_UI = "1"
		offset--
	}
	else if (arg.startsWith("--")) {
		process.argv.splice(offset + i, 1)
		offset--
	}
	else {

		if (map) {
			if (!arg)
				return

			// generate an executable file
			var dirname = Path.dirname(process.execPath)
			var file = Path.join(Os.homedir(), "Kawix", "bin")
			if(!fs.existsSync(file)){
				fs.mkdirSync(file)
			}
			file = Path.join(file, map)

			var content0 = ''
			if (Os.platform() == "win32") {
				file = Path.join(Os.homedir(), "Kawix", "bin", map + ".cmd")
				content0 = '@echo off\nset current=%~dp0\n"%current%\\kwcore.exe" --original-file "%~n0%~x0" "' + arg + '" %*'
			} else {

				WritePath.write(Path.join(Os.homedir(), "Kawix", "bin"))



				//if(process.env.KWCORE_ORIGINAL_EXECUTABLE){
					content0 = "#!" +  process.execPath + "\n" +
						"// kawix.originalFilename = __filename\n" +
						"process.argv = [process.execPath, " + JSON.stringify(__filename) + ", "+JSON.stringify(arg)+"].concat(process.argv.slice(2))\n" +
						"require(" + JSON.stringify(__filename)  + ")\n"
						// + "\n// kawi converted. Preserve this line, Kawi transpiler will not reprocess if this line found"
				//}else{
				//	content0 = '#!/usr/bin/env bash\n' + exe1 + ' --disable-ui --original-file "$BASH_SOURCE" ' + JSON.stringify(arg) + ' "$@"\nexit $?'
				//}


			}
			fs.writeFileSync(file, content0)
			fs.chmodSync(file, "775")
			return
		}


		if (cmd) {
			if (!forceui) {
				forceui = arg.endsWith(".kwe") || arg.endsWith(".kwshc")
			}
		}

		var forceuiFunc
		var execute = function () {
			if (process.env.NODE_REQUIRE == 1) {
				process.originalArgv = process.argv
				process.argv = [].concat(process.argv).splice(1, 1)
				require(arg)
			}
			else {

				Kawix.KModule.injectImport()
				if(arg.substring(0,4) != "gh+/" && arg.indexOf("://") < 0)
					Kawix.mainFilename = Path.resolve(arg)
				else
					Kawix.mainFilename = arg
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
				var kwa = false
				var funcKwa = function () {
					if (kwa) {
						options.filename += ".kwa"
						options.language = "kawix.app"
					}
					Kawix.KModule.import(arg, options).then(function (result) {
						if (!ignoreKwaValidation) ignoreKwaValidation = process.env.KWCORE_FORCED_UI == 1
						if (!process.env.DISPLAY && Os.platform() == "linux") {
							ignoreKwaValidation = true
						}
						if (result && result.Program) {
							if (!ignoreKwaValidation) {
								if (result.Program.type == "terminal") {
									forceui = true

									if (Os.platform() == "win32") {
										if (process.env.WINDOWS_GUI == 1) {

											/*
											var name = Path.basename(cmd, ".exe")
											if (name.endsWith("w")) {
												name = name.substring(0, name.length - 1)
											}
											cmd = Path.join(Path.dirname(cmd), name + ".exe")
											cmdargs.shift()*/
											enableUi(true)

										} else {
											forceui = false
										}
										if (forceui) return forceuiFunc()
									}
									else {

										args = [args[0], args[1], "--ignore-kwa-validation"].concat(args.slice(2))
										enableUi(true)
										return forceuiFunc()
									}

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


				// see if have extension valid
				var valid0 = false
				kwa = arg.endsWith(".kwa")
				if (!kwa) {
					for (var ext in kawix.KModule.extensions) {
						if (arg.endsWith(ext)) {
							valid0 = true
							break
						}
					}
					if (!valid0) {
						// check if is KWA
						var fd = -1
						try {
							fd = fs.openSync(arg, "r")
							var buf = Buffer.allocUnsafe(40)
							var leido = fs.readSync(fd, buf, 0, 40, 0)
							if (leido >= 40) {
								if (buf.toString().startsWith("#!")) {
									var ind = buf.indexOf(10)
									buf = buf.slice(ind + 1)
								}
								if (buf.toString().startsWith("$KWA\n")) {
									kwa = true
								}
							}
						} catch (e) {

						} finally {
							if (fd > 0) fs.closeSync(fd)
						}
					}
				}

				if (kwa) {

					// LOAD THE KWA REGISTER
					Kawix.KModule.import("https://kwx.kodhe.com/x/v/" + pack.stdVersion + "/std/dist/stdlib.js")
						.then(function () {

							Kawix.KModule.import("/virtual/@kawix/std/package/kwa/register")
								.then(funcKwa).catch(erfunc)

						}).catch(erfunc)

				}
				else if (enableCoffee) {
					pack = require("../package.json")
					return Kawix.KModule.import("https://kwx.kodhe.com/x/v/" + pack.stdVersion + "/std/coffeescript/register", options)
						.then(function () {
							Kawix.KModule.import("https://kwx.kodhe.com/x/v/" + pack.stdVersion + "/std/coffeescript/cson/register", options)
								.then(func).catch(erfunc)
						}).catch(erfunc)
				} else {
					return func()
				}

			}
		}
		forceuiFunc = function () {

			if (cmdargs[0].indexOf("node") >= 0) {
				if (process.env.KWCORE_ORIGINAL_EXECUTABLE) {
					cmd = process.env.KWCORE_ORIGINAL_EXECUTABLE
					cmdargs.shift()
				}
			}

			console.log("Executing: ", cmd, cmdargs)
			pro = Child.spawn(cmd, cmdargs, {
				cwd: process.cwd(),
				env: Object.assign({}, process.env, {
					KWCORE_FORCED_UI: "1",
					WINDOWS_GUI: "0"
				}, env1),
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
		}
		if (forceui) {
			return forceuiFunc()
		} else {
			return execute()
		}
	}
}
