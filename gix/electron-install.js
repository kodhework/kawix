

import extract from './extract-zip'
import download from './electron-download'

var fs = require('fs')
var os = require('os')
var path = require('path')




var version = "5.0.1"
var u= path.join(os.homedir(), "Kawix")
if(!fs.existsSync(u)){
	fs.mkdirSync(u)
}
u = path.join(u, "electron@" + version)
if (!fs.existsSync(u)) {
	fs.mkdirSync(u)
}

var installedVersion = null

export var install= installing


function installing(){


	var onerror, finished, promise
	promise= new Promise(function(a,b){
		onerror= b 
		finished= function(){
			a(u)
		}
	})

	try {
		installedVersion = fs.readFileSync(path.join(_u, 'version'), 'utf-8').replace(/^v/, '')
	} catch (ignored) {
		// do nothing
	}
	if (process.env.ELECTRON_SKIP_BINARY_DOWNLOAD) {
		finished()
	}
	else{
		var platformPath = getPlatformPath()
		var electronPath = process.env.ELECTRON_OVERRIDE_DIST_PATH || path.join(u,  platformPath)
		if (installedVersion === version && fs.existsSync(electronPath)) {
			return finished()
		}

		// downloads if not cached
		download({
			cache: process.env.electron_config_cache,
			version: version,
			platform: process.env.npm_config_platform,
			arch: process.env.npm_config_arch,
			strictSSL: process.env.npm_config_strict_ssl === 'true',
			force: process.env.force_no_cache === 'true',
			quiet: process.env.npm_config_loglevel === 'silent' || process.env.CI
		}, extractFile)

		// unzips and makes path.txt point at the correct executable
		function extractFile(err, zipPath) {
			if (err) return onerror(err)
			extract(zipPath, { dir: u }, function (err) {
				if (err) return onerror(err)
				fs.writeFile(path.join(u, 'path.txt'), platformPath, function (err) {
					if (err) return onerror(err)
					finished()
				})
			})
		}

		

		function getPlatformPath() {
			var platform = process.env.npm_config_platform || os.platform()

			switch (platform) {
				case 'darwin':
					return 'Electron.app/Contents/MacOS/Electron'
				case 'freebsd':
				case 'linux':
					return 'electron'
				case 'win32':
					return 'electron.exe'
				default:
					throw new Error('Electron builds are not available on platform: ' + platform)
			}
		}
	}
	return promise 
}

