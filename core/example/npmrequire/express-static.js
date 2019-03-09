// you can use like this:
// kwcore "https://raw.githubusercontent.com/voxsoftware/kawix-core/master/example/npmrequire/express.js" /path/to/static
// kwcore "https://raw.githubusercontent.com/voxsoftware/kawix-core/master/example/npmrequire/express.js" 

// this will download the npm module and make a local cache
import express from 'npm://express@^4.16.4'
import Path from 'path'

var folder= process.argv[3] || "."
folder= Path.resolve(process.cwd(), folder)
console.log("Using folder as public: " + folder)

var app = express() 
app.use(express.static(folder)) 
app.listen(8181)
console.log("Listening on 8181")