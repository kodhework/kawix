import { Socket } from 'net'
import {Channel} from './channel'
import Exception from '../util/exception'



interface RPATarget {
    rpa_id: string,
    rpa_from?: boolean,
    rpa_preserved?: number
}


let count = 0
export class ChannelHandler {
    _funcs: Map<string, any>
    _socket: Socket
    _channel: Channel

    constructor(socket: Socket, channel: Channel) {
        this._socket = socket
        this._channel = channel
        this._funcs = new Map<string, any>()
    }

    set(target: any, prop: string, value:any) {

        if(prop && prop.startsWith && prop.startsWith("rpa_")){
            target[prop] = value
        }
        else{
            throw Exception.create("Seting " + prop + " is not valid through RPA").putCode("RPA_INVALID_OPERATION")
        }

        return true

    }

    get(target: any, prop: string, receiver) {


        if(!prop || !prop.startsWith){
            return target[prop]
        }

        if(prop == "prototype"){
            if(target.prototype){
                console.info("trying to get prototype...")
                return new Proxy(target.prototype, this)
            }
            return target.prototype
        }

        if (prop.startsWith("rpa_") || prop == ("then") || prop == "catch" || prop == "apply" || prop == "toJSON") {
            if (prop == "rpa_unref") {
                if (!this._funcs.has(prop)) {
                    this._funcs.set(prop, this.generateUnrefFunction(target))
                }
                return this._funcs.get(prop)
            }
            else if (prop == "rpa_preserve") {
                if (!this._funcs.has(prop)) {
                    this._funcs.set(prop, this.generatePreserveFunction(target))
                }
                return this._funcs.get(prop)
            }
            return target[prop]
        }

        let val = target[prop]
        if (!this._funcs.has(prop)) {
            if(val !== undefined && typeof val !== "function"){
                return val
            }
            this._funcs.set(prop, this.generateFunction(target, prop))
        }
        val = this._funcs.get(prop)
        return val
    }


    generateUnrefFunction(target: RPATarget) {
        let self = this
        return function () {
            let cmd = {
                target: "R>y",
                method: "unRef",
                arguments: [target.rpa_id, {rpa_socket: true}]
            }
            // ignore if cannot unref
            self._channel.send(self._socket, cmd, true)
        }
    }


    generatePreserveFunction(target: RPATarget) {
        let self = this
        return function () {
            if(target.rpa_preserved == undefined){
                target.rpa_preserved = 1
            }else{
                target.rpa_preserved++
            }
        }
    }


    generateFunction(target: RPATarget, prop: string, noproxy?:boolean) {
        let self = this
        let func

        let rpa_class_id = count++

        func = function (...input) {

            let args = self._channel.convertArguments(input)
            let current = this
            let props = undefined
            if(current.rpa_parent){
                props = []
                while(current.rpa_parent){
                    props.push(current.rpa_prop)
                    current = current.rpa_parent
                }
                props.reverse()

            }
            let cmd = {
                target: target.rpa_id,
                method: prop,
                arguments: args,
                props: props
            }
            let promise =  self._channel.send(self._socket, cmd).promise
            return promise
        }
        if (noproxy) return func

        func.rpa_id= target.rpa_id
        func.rpa_parent = this
        func.rpa_prop= prop
        // func.prototype.rpa_class_id = rpa_class_id
        //let handler = new ChannelHandler(this._socket, this._channel)
        return new Proxy(func, this)
    }

}