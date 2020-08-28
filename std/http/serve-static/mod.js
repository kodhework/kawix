import fs from 'fs'
import Path from 'path'

export async function kawixPreload(){
	let m = "serve-static"
	let v = "1.14.1"
	let name= Path.join(__dirname, "..", "..", "..", "npm-deps", "dist", m, v +".js")
	if(fs.existsSync(name)) module.exports= await import(name)
	else module.exports = await import("gh+/kodhework/npm-deps/dist/" + m + "/" + v + ".js")
}