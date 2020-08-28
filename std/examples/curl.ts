import 'npm://node-fetch@2.6.0'
import fetch from 'node-fetch'

main()
async function main(){

	// TODO: Enable streaming

	let res = await fetch(process.argv[3])
	process.stdout.write(new Uint8Array(await res.arrayBuffer()))
}