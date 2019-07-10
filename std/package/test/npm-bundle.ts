import {Bundler} from '../npm-bundle'
main()
async function main(){
    try{
        
        var bundle = new Bundler()
        bundle.name = "org.kodhe.test"
        await bundle.addNodeNPMDependency("sqlite3@4.0.9", true)
        await bundle.generateCode(__dirname + "/sqlite.js")

    }catch(e){
        console.error(e)
    }
}