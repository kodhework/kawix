import fs from 'fs'
var source= fs.readFileSync(__dirname+"/dynamic.import.js")
var ast= kawix.NextJavascript.transpile(source)
console.info(ast)