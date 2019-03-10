
class Exception extends Error
    @create: (message, innerException)->
        e= new Exception(message)
        e.innerException= innerException if innerException
        return e 
    
    putCode:(code)->
        @code= code
        @
    
    putStack:(stack)->
        @stack= stack 
        @
    
    putMessage: (message)->
        @message= message 
        @
    
    raise: ()->
        throw @

export default Exception