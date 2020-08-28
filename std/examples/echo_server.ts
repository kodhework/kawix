import Net from 'net'

const hostname = "0.0.0.0";
const port = 8080;

main()
async function main(){

	let serv = Net.createServer((sock)=>{
		sock.on("error", function(){})
		sock.pipe(sock)
	})
	serv.listen(port, hostname, ()=> console.log(`Listening on ${hostname}:${port}`))
}