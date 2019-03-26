
import '../register'
import {invoke} from './index'
init()
async function init(){
	try{
		var content= await invoke({
			name: 'John',
			lastname: 'Smith',
			age: 20,
			children: 2
		})
		console.log(content)
	}catch(e){
		console.error(e)
	}
}
