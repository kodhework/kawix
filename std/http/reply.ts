import Serializer from './serializer'
class Reply{
    constructor(env){
        Object.defineProperty(this, "env",{
            enumerable: false,
            value: env
        })
        this._h={}

    }

    get res(){
        return this.env.response
    }

    get store(){
        return this.env.store
    }


    get serializer(){
        if(!this._serializer){
            if(this.store && this.store.schema){
                // compile an schema

                if(!this.store.schema._compiled){
                    this.store.schemaSerializer= Serializer.fastJSON(this.store.schema)
                    Object.defineProperty(this.store.schema,"_compiled",{
                        enumerable: false,
                        value: true
                    })
                }
            }
            if(this.store && this.store.schemaSerializer){
                this._serializer= this.store.schemaSerializer
            }
            else{
                this._serializer= Serializer.default
            }
        }
        return this._serializer
    }


    set serializer(value){
        this._serializer= value
    }

    code(status){
        this.res.statusCode= status
        return this
    }
    header(name, value){
        this._h[name]= value
        this.res.setHeader(name,value)
        return this
    }
    getHeader(name){
        return this._h[name]
    }
    hasHeader(name){
        return !!this._h[name]
    }
    type(value){
        return this.header("content-type", value)
    }
    redirect(code, url){
        if(typeof code == "number"){
            this.code(code).header("location",url)
        }
        else{
            this.code(302).header("location",url || code)
        }
        return this.end()
    }
    serialize(payload){
        if(typeof payload == "function"){
            this._serializer= payload
            return this
        }
        return this.serializer(payload, this)
    }

    deferred(){
        var def={}
        def.promise= new Promise(function(a,b){
            def.resolve= a
            def.reject = b
        })
        return def
    }

    async send(payload){
        var str= this.serialize(payload), def
        if(str && typeof str.pipe == "function"){

            str.pipe(this.res)
            def= this.deferred()
            str.on("error", def.reject)
            this.res.on("finish", def.resolve)
            return def.promise

        }else{
            this.res.end(str)
        }
        this.sent= true
        return this
    }


    write(data,enc){
        return this.res.write(data,enc)
    }

    end(data,enc){
        return this.res.end(data,enc)
    }

}
export default Reply
