import 'npm://split@1.0.1'
import split from 'split'

/* eslint-disable max-len */
const HELP_MSG = `xeval

Run a script for each new-line or otherwise delimited chunk of standard input.

Print all the usernames in /etc/passwd:
  cat /etc/passwd | kwcore xeval "a = $.split(':'); if (a) console.log(a[0])"

A complicated way to print the current git branch:
  git branch | kwcore xeval -I 'line' "if (line.startsWith('*')) console.log(line.slice(2))"

Demonstrates breaking the input up by space delimiter instead of by lines:
  cat LICENSE | kwcore xeval -d " " "if ($ === 'MIT') console.log('MIT licensed')",

USAGE:
  kwcore xeval [OPTIONS] <code>
OPTIONS:
  -d, --delim <delim>       Set delimiter, defaults to newline
  -I, --replvar <replvar>   Set variable name to be used in eval, defaults to $
ARGS:
  <code>`;
/* eslint-enable max-len */



main()
async function main(){

	if(process.argv.length <= 3){
		console.info(HELP_MSG)
		process.exit(0) 
	}

	let ops = {
		delimiter: '\n',
		replVar: '$'
	}

	let offset = 3
	for(let i=3;i<process.argv.length;i++){
		const arg = process.argv[i]
		if(arg == "-d" || arg == "--delim"){
			ops.delimiter = process.argv[i+1]
			
			offset = i+2
		}
		else if(arg == "-I" || arg == "--replvar"){
			ops.replVar = process.argv[i+1]
			
			offset = i+2
		}
	}


	let code = process.argv[offset]
	if(!code){
		console.error(`Bad code`);
		process.exit(1);
	}
	
	if (!ops.replVar.match(/^[_$A-z][_$A-z0-9]*$/)) {
		console.error(`Bad replvar identifier: "${ops.replVar}"`);
		process.exit(1);
	}
	

	
	let spliter = split(ops.delimiter)
	let xeval = Function(`
	return (async function(${ops.replVar}){
		
		${code};

	})(arguments[0])
	`)

	let queue = []
	let readQueue = async function(){
		// don't count the last line empty 
		while(queue.length > 1){
			const line = queue.shift()
			await xeval(line)
		}
	}
	process.stdin.pipe(spliter).on("data", (line)=>{
		queue.push(line)
		readQueue()
	}).on("end", readQueue)

	
}