
import {Registry} from '../registry.yarn'

main()
async function main(){
    let reg= new Registry()
    /*
    let response = await reg.require([
        {
            name: 'luxon',
            version: '1.25.0'
        },
        {
            name: 'lodash',
            version: '4.17.20'
        }
    ], "com.kodhe.app.1")
    */

    let response = await reg.resolve("luxon@1.25.0|lodash@4.17.20|axios@0.21.1>com.kodhe.app.1")
    console.info(response)
}