

import {parse as parsex} from 'npm://@vue/component-compiler-utils@^2.6.0'
import Registry from '../../../std/package/registry.js'
import Path from 'path'
import Exception from '../../../std/util/exception'
import uniqid from '../../../std/util/uniqid.js'

var VueCompiler
export var kawixPreload= async function(){
	var registry= new Registry()
	var moduledesc= await registry.resolve("vue-template-compiler@^2.6.8")
	var file= Path.join(moduledesc.folder,"build.js")
	VueCompiler= require(file)
}

var compile_= function(code,filename,id ,language){

	var ext= kwcore.KModule.Module.languages[language]
	if(!ext){
		throw Exception.create(`Language ${language} not supported. You need register a loader`).putCode("NOT_SUPPORTED")
	}
	var ast = kwcore.KModule.Module.transpile(filename + id, filename + id, code, {
		language: language
	})

	return ast
}

var parse1= function(code,filename){

	var descriptor= parsex({
		source:code,
		filename,
		compiler: VueCompiler
	})
	return descriptor
}

var compile1= function(code,filename,options){

	if(typeof filename == "object"){
		options=filename
		filename=options.filename
	}

	var descriptor= parse1(code,filename)
	var code= [], ast, lang, kawixAsync= []
	var nbasename= Path.basename(filename)

	if(descriptor.template){
		// maybe compile?
		lang=descriptor.template.attrs["lang"]
		if(lang){
			ast = compile_(descriptor.template.content, filename, ".template", lang)

			delete ast.options
			delete ast.map


			kawixAsync.push(`
			ast= ${JSON.stringify(ast)}
			mod= await KModule.require(__dirname + "/" + ${JSON.stringify(nbasename + ".template")}, {
				precompiled: ast
			})
			f= (mod.invoke || mod.default || mod)
			if(typeof f == "function") obj.template= f({})
			else obj.template= mod.body || mod.toString()

			`)
		}
		else{
			kawixAsync.push(`
			// HTML
			obj.template= ${JSON.stringify(descriptor.template.content)}
			`)
		}
	}


	if (descriptor.script) {

		lang = descriptor.script.attrs["lang"]
		if(!lang) lang= 'javascript'
		if (lang) {
			ast = compile_(descriptor.script.content, filename, ".script", lang)

			delete ast.options
			delete ast.map
			console.log("Vue filename:",filename)

			kawixAsync.push(`
			ast= ${JSON.stringify(ast)}
			mod= await KModule.require(__dirname + "/" + ${JSON.stringify(nbasename+ ".script")}, {
				precompiled: ast
			})
			f= (mod.invoke || mod.default || mod)
			obj.script= f
			`)
		}
	}



	if (descriptor.styles) {
		if(descriptor.styles.length){
			kawixAsync.push("obj.styles=[]")
		}
		for(var i=0;i<descriptor.styles.length;i++){
			let style= descriptor.styles[i]

			// maybe compile?
			lang = style.attrs["lang"]
			if (lang) {
				ast = compile_(style.content, filename, ".style", lang)

				delete ast.options
				delete ast.map


				kawixAsync.push(`
				ast= ${JSON.stringify(ast)}
				mod= await KModule.require(__dirname + "/" + ${JSON.stringify(nbasename+ ".style")}, {
					precompiled: ast
				})
				f= (mod.invoke || mod.default || mod)

				if(typeof f == "function") st= f({})
				else st= mod

				obj.styles.push({
					style: st ,
					scoped: ${style.scoped ? "true" : "false"}
				})
				`)
			}
			else {
				kawixAsync.push(`
				// CSS
				obj.styles.push({
					style: ${JSON.stringify(style.content)} ,
					scoped: ${style.scoped ? "true" : "false"}
				})
				`)
			}
		}
	}


	if(kawixAsync.length){

		code.push("var ModInfo={}")
		code.push(`ModInfo.cid= ${JSON.stringify("J" + uniqid())}`)
		code.push(`var rulesFromStyle= function(styleStr){
			var rule, rules, selectors, x, z, cid
			cid= ModInfo.cid
			styleStr=styleStr.trim()
			x = 0;

			rules = [];

			while (true) {
				z = styleStr.indexOf("{", x);
				if (z < 0) {
					break;
				}
				selectors = styleStr.substring(x, z).trim();
				selectors = selectors.split(",").map(function(a) {
					return a.trim();
				});
				rule = {
					selectors: selectors,
					id: cid
				};
				x = styleStr.indexOf("}", z + 1);
				if (x < 0) {
					throw new Error("Invalid style found. Unexpected }")
				}
				rule.content = styleStr.substring(z + 1, x);
				rules.push(rule);
				x++;
			}
			return rules
		}`)


		code.push(`var generateCode= function(style){

			var str= '<style>', rule , si, rulec
			si= "[" + ModInfo.cid + "]"
			for(var i=0;i<style.rules.length;i++){
				rule=style.rules[i]
				if(style.scoped){
					rulec= rule.selectors.map(function(a){

						var us= ''
						if(a){
							us= si + " " + a  + ","
							content1= a.split(/\\s+/)
							content2= content1[0].split(">")
							us += content2[0] + si
							if(content2.length > 1){
								us+= ">" + content2.slice(1).join(">")
							}
							if(content1.length > 1){
								us+= " " + content1.slice(1).join("")
							}
						}
						return us
					}).join(",")
				}
				else{
					rulec= rule.selectors.join(",")
				}
				str+= '\\n' + rulec + '{' + rule.content + '}\\n'
			}
			str+= "</style>"
			return str

		}`)


		code.push("var _def_=" + `function(env){
			var c, scoped=false
			var injectStyles= function(){

				for(var i=0;i<exports.styles.length;i++){
					let style=exports.styles[i]
					if(style._good) continue

					if(style.generated){
						d= document.createElement("div")
						d.innerHTML= style.generated
						d.style.display= 'none'
						document.body.appendChild(d)
					}
				}
			}

			if(ModInfo.script){
				if(typeof ModInfo.script == "function"){
					exports= module.exports= ModInfo.script()
				}
				else{
					exports= module.exports= ModInfo.script
				}
			}

			if(ModInfo.styles){
				exports.styles= ModInfo.styles
				for(var i=0;i<exports.styles.length;i++){
					if(exports.styles[i].scoped) scoped= true
					let n= exports.styles[i].style
					exports.styles[i].rules= rulesFromStyle(n)
					exports.styles[i].generated= generateCode(exports.styles[i])
				}
				c= exports.created
				exports.created= function(){
					// attach styles
					injectStyles()
					c && c.apply(this,arguments)
				}
			}

			if(ModInfo.template){
				exports.template= ModInfo.template

				if(scoped){
					let temp= exports.template.trim()
					let a= temp.indexOf(" ")
					let b= temp.indexOf(">")

					if(b > 0 && (b < a || a < 0)) a= b
					if(a > 0){
						temp= temp.substring(0,a) + " " + ModInfo.cid + " " + temp.substring(a)
					}
					exports.template= temp
				}
			}

			return exports

		}`)

		code.push("var _def=function(env,body){if(!_def.yet){_def.yet= true; return _def_(env,body)}}")

		code.push("export var kawixPreload= async function(){")

		code.push("var ast,mod,f,st,obj")
		code.push("obj= ModInfo")
		code.push(kawixAsync.join("\n"))
		code.push("if(!ModInfo.e) ModInfo.e=_def({})")
		code.push("}")
		code.push("")



		code.push("export default ModInfo.e")
		code.push("export var invoke= _def_")
		code.push("export var kawixDynamic={time:10000}")




	}

	return {
		code: code.join("\n")
	}



}
var register1 = function () {
	var extensions = kwcore.KModule.Module.extensions
	var languages = kwcore.KModule.Module.languages
	if (!extensions[".vue"]) {
		extensions[".vue"] = compile1
	}
	if (!languages["vue"]) {
		languages["vue"] = ".vue"
		languages["sfc"] = ".vue"
	}
}

register1()
export default register1
export var register = register1
export var parse = parse1
export var compile = compile1
