function greeter(person: string) {
	return "Hello, " + person;
}


function sleep(timeout?: number){
	timeout= timeout || 0
	return new Promise(function(resolve, reject){
		setTimeout(resolve, timeout)
	})
}


async function foo() {
    try {
        var val = greeter("World!");
		console.log(val);
		
		console.log("Simulating async action... please wait 1 second")
		await sleep(1000)
		console.log("Finished")

    }
    catch(err) {
        console.log('Error: ', err.message);
    }
}


foo()