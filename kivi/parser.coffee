
#import parse5 from 'npm://parse5@^5.0.1'
import parse5 from './parse5'
import Exception from '../std/util/exception'
import CoffeeScript from '../std/coffeescript/runtime'
class Parser




	_array_to_object: (arr, o={})->
		if arr?.length
			for val in arr
				o[val.name]= val.value
		return o
	
	_object_to_array: (obj, arr=[])->
		if obj
			for id, val in obj
				arr.push 
					name: id 
					value: val 
		return arr


	_kvRepeat: (node, rcode, parent)->

		attrs= @_array_to_object node.attrs
		times= parseInt(attrs.times)
		if isNaN times
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} have not a valid attribute `times`")



		rcode.str.push("for(let i=0;i<#{times};i++){")
		for nnode in node.childNodes
			@_analyze(nnode, rcode, node)
		rcode.str.push("}")

		parent?._last= 'repeat'



	_kvElse: (node, rcode, parent)->
		if (parent?._last != "if")
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} is not expected here")

		rcode.str.push("#{text}if($helper.expression(#{cid})){")
		for nnode in node.childNodes
			@_analyze(nnode, rcode, node)
		rcode.str.push("}")

		parent?._last= 'else'



	_kvIf: (node, rcode, parent, cond= 0)->

		if cond is 1 and (parent?._last != "if")
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} is not expected here")


		rcode.lang= rcode.lang || "javascript"
		attrs= @_array_to_object node.attrs
		exp= attrs.expression
		if not exp
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} need an attribute `expression`")
		
		#c= rcode.expressions[rcode.lang] ? (rcode.expressions[rcode.lang] = {})
		#if not c[exp]
		#	cid= Object.keys(c).length
		#	c[exp] = cid
		#else
		#	cid= c[exp]
		exp = @_compileExpression(rcode.lang, exp)

		text= ''
		text= 'else ' if cond is 1

		rcode.str.push("#{text}if(#{exp}){")
		for nnode in node.childNodes
			@_analyze(nnode, rcode, node)
		rcode.str.push("}")

		parent?._last= 'if'


	_kvFor: (node, rcode, parent, inner)->


		attrs= @_array_to_object node.attrs
		if inner 
			exp = attrs["kivi:for"]
		else 
			exp= attrs.expression
		if not exp
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} need an attribute `expression`")


		scode= Object.assign {}, rcode
		scode.str = []
		if inner 
			@_normal(node, scode, parent)
		else 
			for nnode in node.childNodes
				@_analyze(nnode, scode, node)

		exp="""
for #{exp}
	code()
return 
		"""
		#c[exp] = cid
		
		cid = await @_compile "coffee", "forexpression", exp, rcode, (source)->
			source.replace "code();", scode.str.join("\n")
			

			

		#rcode.str.push("$helper.expression($init#{cid})")
		parent?._last= 'for'


	_kvImport: (node,rcode,parent)->
		attrs= @_array_to_object node.attrs
		if not attrs.name and not attrs.include
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} need an attribute `name` or `include`")

		rcode.str.push("await $helper.include(#{JSON.stringify(attrs)})")

	_kvAttr: (node,rcode,parent)->
		attrs= @_array_to_object node.attrs
		if not attrs.name
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} need an attribute `name`")

		str = rcode.str[rcode.str.length - 1]
		if not str.startsWith("$helper.openNode")
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} only can be present after a openNode")



		openNode= rcode.pop()
		@_kvExpression node, rcode, null, no

		rcode.str.push "$attrs[#{JSON.stringify(attrs.name)}] = #{rcode.pop()}"
		rcode.str.push(openNode)



	_kvSection: (node,rcode,parent)->
		attrs= @_array_to_object node.attrs
		if not attrs.name
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} need an attribute `name`")

		rcode.str.push("$helper.$section[#{JSON.stringify(attrs.name)}]= async function($helper, data){")
		if node.childNodes?.length
			for nnode in node.childNodes
				@_analyze nnode, rcode, node
		rcode.str.push("}")


	_kvScript: (node, rcode, parent)->
		attrs= @_array_to_object node.attrs
		lang= attrs.lang or "javascript"

		# compile
		if node.childNodes?[0]
			@_compile lang, @options.filename, node.childNodes[0].value, rcode


	_compile:(language, filename, source, rcode, after)->
		#rcode.scripts.push source
		#return
		ext= kwcore.KModule.Module.languages[language]
		if not ext
			throw Exception.create("Language #{language} not supported. You need register a loader").putCode("NOT_SUPPORTED")

		c= rcode.scripts.length
		compiler= kwcore.KModule.Module.extensions[ext]
		if compiler
			ast = compiler source,
				language: language
				filename: filename + ".#{c}.script"
				inlineMap: no
				sourceMap: no

			if after
				ast.code = after(ast.code)
			rcode.scripts.push("function $init#{c}($helper,data, $source){\n\t#{ast.code}\n}")
			rcode.str.push("await $init#{c}($helper,data, $source)")
		else
			if after 
				source = after(source)
			rcode.scripts.push("function $init#{c}($helper,data, $source){\n\t#{source}\n}")
			rcode.str.push("await $init#{c}($helper,data, $source)")




	_normal: (node, rcode, parent)->

		attrs = @_array_to_object(node.attrs)
		nunode = 
			childNodes: [node]
		if attrs["kivi:if"]
			nunode.attrs= [
				value: attrs["kivi:if"]
				name: 'expression'
			]
			delete attrs["kivi:if"]
			node.attrs = @_object_to_array(attrs)
			nunode.ok= yes 

		if nunode.ok 
			return @_kvIf(nunode, rcode, parent)


		if node.nodeName == "#text"
			rcode.lang= rcode.lang or "javascript"
			if rcode.lang is "javascript"
				str= node.value.replace(/\\/g,'\\\\')
				rcode.str.push("$helper.text(`#{str}`)")
			else if rcode.lang is "coffeescript" or rcode.lang is "coffee"
				str= node.value.replace(/\\/g,'\\\\')
				str= @_compileExpression rcode.lang, '"""' + str  + '"""'
				rcode.str.push("$helper.text(#{str})")


			if node.value.trim()
				parent._last= 'text'
			return

		if node.nodeName == "script"
			attrs= @_array_to_object node.attrs
			if attrs["server-side"] isnt undefined
				# ok, process as script
				return @_kvScript node,rcode,parent


		if node.sourceCodeLocation is null and (node.tagName is "html" or node.tagName is "head" or node.tagName is "body")
			if not node.attrs?.length
				cnodes= @_getChildnodes node
				for nnode in cnodes
					@_analyze nnode, rcode, node
				return


		nob=
			nodeName: node.nodeName
			value: node.value
			tagName: node.tagName
			attrs: @_array_to_object node.attrs

		rcode.str.push("$helper.openNode(#{JSON.stringify(nob)})")


		# iterate child nodes
		if node.tagName != "script"
			cnodes= @_getChildnodes node
			if cnodes?.length
				for nnode in cnodes
					@_analyze nnode, rcode, node
		else
			if node.childNodes[0]
				rcode.str.push("$helper.writeRaw(#{JSON.stringify(node.childNodes[0].value)})")

		rcode.str.push("$helper.closeNode(#{JSON.stringify(nob.tagName)})")
		parent._last= 'tag'

	_getChildnodes: (node)->
		return ( node.content?.childNodes ? node.childNodes ) ? []

	_kvLang: (node,rcode,parent)->
		attrs= @_array_to_object node.attrs
		available= ["javascript","coffee", "coffeescript"]
		if not attrs.lang or available.indexOf(attrs.lang) < 0
			throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} need an attribute `lang` and shoud be any of #{available.join(",")}")

		rcode.lang= attrs.lang
		parent._last='lang'

		cnodes= @_getChildnodes node
		if cnodes?.length
			for nnode in cnodes
				@_analyze nnode, rcode, node

	_kvExpression: (node, rcode, parent, write = true)->
		raw= node.nodeName == "kivi:raw" or node.nodeName == "vw:rawexpression"

		exp= node.childNodes[0].value
		rcode.lang= rcode.lang || "javascript"


		cid= @_compileExpression(rcode.lang, exp)
		if raw
			rcode.str.push("$helper.rawexpression(#{cid}, #{write.toString()})")
		else
			rcode.str.push("$helper.expression(#{cid}, #{write.toString()})")

		parent?._last= 'expression'


	_compileExpression: (lang, source)->
		if lang == "javascript"
			return source
		else if lang== "coffee" or lang is "coffeescript"
			code= CoffeeScript.compile(source)

			y= code.indexOf("(function() {")
			if y >= 0
				code= code.substring(y + 14)
			y= code.lastIndexOf("}).call(this);")
			if y >= 0
				code= code.substring(0, y)

			while code.trim().endsWith(";")
				code= code.trim().substring(0,code.length-1)
			if code.trim().startsWith("var ")
				code= "(function(){#{code.trim()}})()"
			return code


	_analyze: (node, rcode, parent)->
		if node.sourceCodeLocation
			#if node.sourceCodeLocation.startLine != rcode.line
			rcode.line= node.sourceCodeLocation.startLine
			rcode.str.push("$source.line= " + rcode.line)

			#if node.sourceCodeLocation.startCol != rcode.col
			rcode.col= node.sourceCodeLocation.startCol
			rcode.str.push("$source.col= " + rcode.col)


		attrs = @_array_to_object(node.attrs)
		if attrs["kivi:for"]
			@_kvFor(node, rcode, parent, true)
		

			
		else if node.nodeName.startsWith("vw:") or node.nodeName.startsWith("kivi:")
			# parse expression
			if node.nodeName == "vw:expression" or node.nodeName == "vw:rawexpression" or node.nodeName == "kivi:exp" or node.nodeName == "kivi:raw"
				type='expression'
				if node.childNodes.length isnt 1
					throw Exception.create("Parsing: line #{rcode.line} - col #{rcode.col}. #{node.nodeName} need a single textNode")


			else if node.nodeName == "kivi:if" or node.nodeName == "vw:if"
				node._type= 'if'
				@_kvIf(node, rcode, parent)

			else if node.nodeName == "kivi:elseif" or node.nodeName == "vw:elseif"
				node._type= 'if'
				@_kvIf(node, rcode, parent, 1)

			else if node.nodeName == "kivi:else" or node.nodeName == "vw:else"
				node._type= 'else'
				@_kvElse(node, rcode, parent)

			else if node.nodeName == "kivi:repeat"
				node._type= 'repeat'
				@_kvRepeat(node, rcode, parent)

			else if node.nodeName == "kivi:attr"
				node._type= 'attr'
				@_kvAttr(node, rcode, parent)

			else if node.nodeName == "kivi:for" or node.nodeName == "vw:for"
				node._type= 'for'
				@_kvFor(node, rcode, parent)

			else if node.nodeName == "kivi:import" or node.nodeName == "vw:import"
				node._type= 'import'
				@_kvImport(node, rcode, parent)

			else if node.nodeName == "kivi:section" or node.nodeName == "vw:section"
				node._type= 'section'
				@_kvSection(node, rcode, parent)

			else if node.nodeName == "kivi:lang"
				node._type= 'lang'
				@_kvLang(node, rcode, parent)

			else if node.nodeName == "kivi:script"
				node._type= 'script'
				@_kvScript(node, rcode, parent)



			if type is "expression"
				node._type= 'expression'
				@_kvExpression(node,rcode, parent)


		else if node.nodeName != "#document"
			node._type = 'normal'
			@_normal(node, rcode, parent)
		else
			cnodes= @_getChildnodes node
			for nnode in cnodes
				@_analyze nnode, rcode, node

	transform: (source, options = {})->
		options.filename = '/default.kivi' if not options.filename
		@options= options
		ast= @parse source
		rcode=
			str: [
				"class Exception extends Error{}"
				"var $attrs={}"
				"var Invoke= async function(data, options){"
				"var $helper= _helper()"
				"if(data && data.$section)"
				"	$helper.$section= Object.assign($helper.$section, data.$section)"
				"if(options !== undefined){"
				"	data.options= options"
				"}"
				"$helper.$data= data"
				"$helper.content= []"
				"var $source= {filename: #{JSON.stringify(options.filename)}}"
				"try{"
				""
			]
			expressions: {}
			scripts: []
			line: 0
			col: 0
			count: 0

		@_analyze ast, rcode
		rcode.str.push "	return $helper.returnValue()"
		rcode.str.push "}catch(e){"
		rcode.str.push "	var er= new Exception(e.message)"
		rcode.str.push "	if($source.line){"
		rcode.str.push "		let lines= e.stack.split('\\n')"
		rcode.str.push ""
		rcode.str.push "		er.stack= lines[0] + '\\n    at Kivi.invoke (' + $source.filename + ':' + $source.line + ':' + $source.col + ')\\n    ....\\n' + lines.slice(1).join('\\n')"
		rcode.str.push "	}"
		rcode.str.push "	// er.innerException= e "
		rcode.str.push "	throw er"
		rcode.str.push "}"
		rcode.str.push "}"

		helper= """
		(function() {
  var Path= require("path")
  var $helper;
  return $helper = {
	  $section: {},
	text: function(value) {
	  return this.write(value);
	},
	write: function(value) {
	  value = this.scape(value);
	  return this.writeRaw(value);
	},
	writeRaw: function(value) {
	  var ref, ref1;
	  if (value === void 0 || value === null) {
		value = '';
	  }
	  return this.content.push(value.toString());
	},
	expression: function(value, write) {
	  if (!write) {
		return value;
	  }
	  if (write) {
		return this.write(value);
	  }
	},
	rawexpression: function(value, write) {
	  if (!write) {
		return value;
	  }
	  if (write) {
		return this.writeRaw(value);
	  }
	},


	include: async function(attrs, args) {
	  var mod, ndata, result, file, section, main;
	  file= attrs.name || attrs.file
	  if(attrs.section !== undefined){
		  section= this.$section && this.$section[file]
		  if(section){
			  await section(this, this.$data)
		  }
		  return
	  }
	  main= this.$data.options && this.$data.options.mainfolder
	  if(main && !file.startsWith("./") && !file.startsWith("../")){
		  file= Path.join(main, file)
	  }
	  mod = (await import(file));
	  if(typeof mod.text == "string"){
		  this.writeRaw(mod.text)
	  }
	  else if(typeof mod.default == "string"){
		  this.writeRaw(mod.default)
	  }
	  else if (mod.invoke) {
		  ndata = Object.assign({}, this.$data);
		  if (arguments.length > 1) {
			ndata.arguments = args;
		  }
		  ndata.$section= this.$section
		  result = (await mod.invoke(ndata));
		  return this.writeRaw(result);
	  }
	},
	returnValue: function() {
	  return this.content.join("");
	},
	openNode: function(node) {
	  var id, ref, str1, val;
	  str1 = '';
	  if (node.nodeName === "#documentType") {
		str1 = `<!DOCTYPE ${node.name.toUpperCase()}`;
		if (node.publicId) {
		  str1 += ` PUBLIC ${node.publicId}`;
		}
		if (node.systemId) {
		  str1 += node.systemId;
		}
		str1 += ">";
	  } else if (node.tagName) {
		/*
		if(this.$data.$ignoreroots){
			if(node.tagName == "html" || node.tagName == "head" || node.tagName == "body"){
				return;
			}
		}*/
		str1 = `<${node.tagName}`;
		if (node.attrs) {
		  ref = Object.assign(node.attrs || {}, $attrs);

		  for (id in ref) {
			val = ref[id];
			str1 += ` ${id}='${this.scape(val)}'`;
		  }
		}
		$attrs={}
		if (node.tagName === "link" || node.tagName === "img") {
		  str1 += "/>";
		} else {
		  str1 += ">";
		}
	  }
	  if (str1) {
		return this.writeRaw(str1);
	  }
	},
	closeNode: function(tagName) {
		if(!tagName || tagName == "undefined") return
		/*
		if(this.$data.$ignoreroots){
			if(tagName == "html" || tagName == "head" || tagName == "body"){
				return;
			}
		}*/
	  if (tagName !== "link" && tagName !== "img" && tagName !== "br") {
		return this.writeRaw(`</${tagName}>`);
	  }
	},
	scape: function(unsafe) {
	  if (unsafe === void 0 || unsafe === null) {
		return '';
	  }
	  unsafe = unsafe.toString();
	  return unsafe.replace(/[&<"']/g, function(m) {
		switch (m) {
		  case '&':
			return '&amp;';
		  case '<':
			return '&lt;';
		  case '"':
			return '&quot;';
		  default:
			return '&#039;';
		}
	  });
	}
  };
});
"""
		realCode= ''
		realCode += "var _helper= " + helper.toString()
		#realCode += "\n$helper= $helper()"
		for script in rcode.scripts
			realCode += "\n" + script



		realCode += "\n" + rcode.str.join("\n")

		#realCode += "\n" + "export var invoke=Invoke"
		realCode += "\n" + "export var invoke=Invoke"
		realCode += "\n" + """export var httpInvoke= function(env, ctx){
			return Invoke(env,ctx).then(function(resp){
				env.reply.code(200).header('content-type','text/html;charset=utf8').send(resp)
			})
		}"""
		realCode += "\n" + "export var kawixDynamic={time:15000}"
		ast=
			code: realCode

		return ast

	parse: (source, options={})->
		options.sourceCodeLocationInfo= yes
		options.allowCustomTagsOnHead= yes
		ast= parse5.parse source, options
		return ast

export default Parser
