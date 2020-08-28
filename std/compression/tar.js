import fs from 'fs'
import Path from 'path'

export async function kawixPreload(){
	let m = "tar"
	let v = "6.0.5"
	let name= Path.join(__dirname, "..", "..", "npm-deps", "dist", m, v +".js")
	if(fs.existsSync(name)) module.exports= await import(name)
	else module.exports = await import("gh+/kodhework/npm-deps/dist/" + m + "/" + v + ".js")
}