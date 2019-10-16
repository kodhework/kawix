## changes 0.7.2

* Several bug fixes
* Update Windows,Mac,GNU/Linux installers
* Improving some things in caching

## changes 0.6.0

* Enable ```.kwa``` files as bundle executable
* Adding types in typescript files to provide better experience on code editors
* Update Windows,Mac,GNU/Linux installers

## changes 0.5.1 

* Better support for typescript 
* Starting migrating ```stdlib``` from coffee to typescript 

## changes 0.4.5 - 0.4.7 

* Minor bugs fixed

## Changes 0.4.2

* Fixed installers for Windows and GNU/Linux
* Fixed some minor bugs on transpiling/caching

## Changes 0.4.0

* Change the way to cache transpiled files, using MD5 instead of fullpath
* Fixed some minor bugs on transpiling


## Changes 0.3.20 

* Preparing releases for Linux, Mac via ```bash```
* Added beta ```--ui``` and ```--force-ui``` options for cli, available for Linux and Mac to open a **GUI Terminal app**

## Changes 0.3.17

* Added app installers for windows
* Updated standalone version ```https://kwx.kodhe.com/x/core/dist/kwcore.app.js```

## Changes 0.3.16

* Fix minor bug when importing some files
* Added and standalone version of **@kawix/core**, suitable for embed for example with **nexe** 
```https://kwx.kodhe.com/x/core/dist/kwcore.app.js```


## Changes 0.3.13

* Environment variable ```KAWIX_CACHE_DIR```. You can override the cache directory for save compilated files and modules


## Changes 0.3.12

* Fixed bugs, on importing. Improved async imports
* Now working again on browser


## Changes 0.3.9

* Fix bug invalid filenames when importing from npm on windows


## Changes 0.3.7

* Fix bug *again* on windows, loading some imports



## Changes 0.3.5

* Fix bug ```asynchelper not defined```
* Fix bug ```module $1 not found``` when importing from npm
* You can now require modules that dependes on **native** using ```npmi``` protocol. Example:

```javascript
import dmg from 'npmi://appdmg@^0.5.2'
```

## Changes 0.3.0 [IMPORTANT FIXED BUGS]

* Fix bug with caching on modules imported.
* Now imports are synchronized too between same process avoiding concurrency issues
* Stable version near, I will be glad if anyone contribute to report bugs or add functionality


## Changes 0.2.1

**Compilation** are now synchronized between processes, using a file lock. This is important, because avoid errors when you launch concurrent scripts that uses the same files.


## Changes 0.1.8

Starting in version **0.1.8** was added *browser* support. You need add the file ```crossplatform/dist/main.js``` to your webpage for start using this module on browser.

You can add also support for typescript and all transpilation features of this packages, adding ```crossplatform/async/dist/main.js```


> **IMPORTANT**: In version **0.1.6** solve the bug on Windows when loading a local file. If you are a windows user, you can now test this version using **--force** parameter.

```bash
> npm install -g @kawix/core@latest
> kwcore --force "https://kwx.kodhe.com/x/core/example/http.js"
```