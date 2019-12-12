

require("./_babel")

module.exports = ___Babel
___Babel.__defaultTransform = function __defaultTransform(code, options = {}){
    
    if(!options.presets){
        options.presets = [___Babel._modules["typescript"],___Babel._modules["env"]]
    }

    if(!options.plugins){
        options.plugins = [
            //dynamicImport,
            ___Babel._modules["proposal-nullish-coalescing-operator"],
            [___Babel._modules["proposal-decorators"],{
                //decoratorsBeforeExport: true,
                legacy: true 
            }],
            [___Babel._modules["proposal-class-properties"],{
                loose: true
            }]
        ]
    }
    let ast= ___Babel.transformSync(code,options)
    ast.code = ast.code.replace(/Promise\.resolve\(\)\.then\(function\s+\(\)\s+\{\s*\r?\n\s+return\s+_interopRequireWildcard\(require/g, function(a,b){
        
        return a.replace("_interopRequireWildcard(require", "((typeof KModule !== 'undefined' ? KModule : global.KModuleLoader).import")
    })
    return ast
}