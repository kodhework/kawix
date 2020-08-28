// Copyright 2020 Kawix/core authors. All rights reserved. MIT license.

import fs from 'fs'
import * as async from '../util/async'

main()
async function main(){
	let filenames = process.argv.slice(3)
	for(let filename of filenames){
		let def = new async.Deferred<void>()
		let stream = fs.createReadStream(filename)
		stream.on("end", def.resolve)
		stream.on("data", process.stdout.write)
		stream.on("error", def.reject)
		await def.promise
	}
}