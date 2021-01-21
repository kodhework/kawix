import {Channel} from '../channel.v2'

main()

class Person{
    create(){
        return 10
    }

    func(f){
        console.info("F:", f)
        return f("msg") 
    }
}

async function main(){

    let c = new Channel("test.0")
    await c.registerLocal()
    c.$addVariable(new Person())

}