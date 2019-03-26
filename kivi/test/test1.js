import '../../std/coffeescript/register'
import Parser from '../parser'
import fs from '../../std/fs/mod.js'

init()
async function init(){

	var parser=new Parser
	var code= await fs.readFileAsync(__dirname + "/file2.kivi.html", 'utf8')
	var ast= parser.transform(code)
	await fs.writeFileAsync(__dirname + "/test.result.js", ast.code)


}
