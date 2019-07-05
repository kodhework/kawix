import fs from './mod'
init() 


async function init(){
    var stat= await fs.statAsync("/home/james/projects")
    console.log(stat)
}