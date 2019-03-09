// this will download the npm module and make a local cache
import express from 'npm://express@^4.16.4'


var app = express() 
app.get('/', function (req, res) {
  res.send('Hello World')
}) 
app.listen(3000)
console.log("Listening on 3000")