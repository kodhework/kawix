import FastJson from './fast-json-stringify/mod'

class Serializer{


    static fastJSON(schema){
        if(!schema)
            throw new Error("FastJSON need an schema")


		var schemas= {}
		return function(data,reply){
			var id, rschema, stringify
			var type= reply.getHeader("content-type")
			if(!type){
				reply.header("content-type","application/json")
			}
			if(data === null || data === undefined)
				return "null"


			var code= reply.res.statusCode
			code= code || 200
			rschema= schema
			if(schema.response){
				rschema= schema.response[code]
				if(!rschema){
					code= code[0] + "xx"
					rschema= schema.response[code]
				}
				if(!rschema){
					code= "default"
					rschema= schema.response.default || schema.response
				}
			}
			if(!rschema){
				throw new Error("Failed found a suitable schema")
			}
			stringify= schemas[code]
			if(!stringify){
				// create stringify
				stringify= schemas[code]= FastJson(rschema)
			}

			return stringify(data)
		}
    }



    static default(data, reply){
        var type= reply.getHeader("content-type")

        if(Buffer.isBuffer(data)){
            if(!type)
                reply.type("application/octect-stream")
            return data
        }
        else if(data && typeof data.pipe == "function"){
            return data
        }
        else if(typeof data == "string"){
            if(!type)
                reply.type("text/plain;Charset=utf-8")
            return data
        }
        else if(data === null){
            return "null"
        }
        else if(data === undefined){
            return ""
        }
        else{
            str=  JSON.stringify(data)
            if(!type)
                reply.type("application/json;Charset=utf-8")
            return str
        }
    }


}

export default Serializer
