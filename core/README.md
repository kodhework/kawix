# @kawix/core

### The next generation module loader for nodejs

### no-webpack, no-rollup, no-dependencies

**@kawix/core** allows requiring modules in async and more elegant way, and use last features of EcmaScript (for example async/await) without requiring a lot of dependencies, packagers or build scripts


## DEPRECATED

Now you can use the new project ```kwruntime``` is similar to ```@kawix/core``` in many aspects, but more modern, better code, more features, and better dependency management.

Go to [https://github.com/kwruntime/core](https://github.com/kwruntime/core)


## More info

Please go to [https://github.com/kodhework/kawix](https://github.com/kodhework/kawix) for see the full **kawix** project


## Instalation and Documentation

* [INSTALL.md](https://github.com/kodhework/kawix/blob/master/core/INSTALL.md)
* [DOCS.md](https://github.com/kodhework/kawix/blob/master/core/DOCS.md)
* [CHANGES.md](https://github.com/kodhework/kawix/blob/master/core/CHANGES.md)


## Usage from node

```javascript
require("@kawix/core")
global.kawix.KModule.import("/path/to/script.ts").then(function(exports){
	console.info("Result:", exports)
}).catch(console.error)
```

## Do you want contribute?

You can contribute testing the code and report issues: [https://github.com/kodhework/kawix/issues](https://github.com/kodhework/kawix/issues)

Do you think that can write better some parts of this README? Feel free to check and contribute

Do you have any idea that can be great for this project?

If you are a developer with time, can contribute adding functionality or fixing some bugs that can appears

If you cannot contribute in last two ways, why not donate? Contact us: contacto@kodhe.com

Do you want appears on README section like a continous financial collaborator, contact us for patronate this project with monthly donations
