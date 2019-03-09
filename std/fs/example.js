import fs from './mod.js'
init() 


async function init(){
    var stat= await fs.statAsync("/home/james/projects")
    console.log(stat)
}