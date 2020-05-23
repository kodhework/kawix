
//import './mod'

import '../base_import'
import { Channel } from '/virtual/@kawix/std/rpa/channel'
import { Electron } from './electron'

export default async function (id) {


    var service = new Electron(id)
    service.electron = require("electron")
    var ipc = await Channel.registerLocal(id, service)
    console.log("ELECTRON PROCESS LISTENING")

}
