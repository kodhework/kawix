// you can use like this:
// kwcore "https://raw.githubusercontent.com/voxsoftware/kawix-core/master/example/npmrequire/express.js" /path/to/static
// kwcore "https://raw.githubusercontent.com/voxsoftware/kawix-core/master/example/npmrequire/express.js" 

// this will download the npm module and make a local cache
import express from '../../std/http/express.js'
import Path from 'path'

var folder= process.argv[3] || "."
folder= Path.resolve(process.cwd(), folder)
console.log("Using folder as public: " + folder)

var app = express() 
//app.use(express.static(folder)) 

var router1= express.Router()
var router2= express.Router()
var router3= express.Router()

router1.use(router2)
//router1.use(router3)
router1.use(function(req,res){
    res.write("Handled by 1")
    res.end()
})

router3.use(function(req,res){
    res.write("Handled by 3")
    res.end()
})

router2.get("/hi", function(req,res){
    res.write("handled by 2")
    res.end()
})

router2.get("/pass", function(req,res,next){
    next()
})




app.use(router1)
app.listen(8181)
console.log("Listening on 8181")