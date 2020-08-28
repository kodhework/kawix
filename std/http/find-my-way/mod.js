import fs from 'fs'
import Path from 'path'

export async function kawixPreload(){
	let m = "find-my-way"
	let v = "3.0.4"
	let name= Path.join(__dirname, "..", "..", "..", "npm-deps", "dist", m, v +".js")
	if(fs.existsSync(name)) module.exports= await import(name)
	else module.exports = await import("gh+/kodhework/npm-deps/dist/" + m + "/" + v + ".js")
}