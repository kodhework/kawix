//import parse5 from 'npm://parse5@^5.0.1'
var Parser;

import parse5 from './parse5';

import Exception from '../std/util/exception';

import CoffeeScript from '../std/coffeescript/runtime';

Parser = class Parser {
	_array_to_object(arr, o = {}) {
		var i, len, val;
		if (arr != null ? arr.length : void 0) {
			for (i = 0, len = arr.length; i < len; i++) {
				val = arr[i];
				o[val.name] = val.value;
			}
		}
		return o;
	}

	_object_to_array(obj, arr = []) {
		var i, id, len, val;
		if (obj) {
			for (val = i = 0, len = obj.length; i < len; val = ++i) {
				id = obj[val];
				arr.push({
					name: id,
					value: val
				});
			}
		}
		return arr;
	}

	_kvRepeat(node, rcode, parent) {
		var attrs, i, len, nnode, ref, times;
		attrs = this._array_to_object(node.attrs);
		times = parseInt(attrs.times);
		if (isNaN(times)) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} have not a valid attribute \`times\``);
		}
		rcode.str.push(`for(let i=0;i<${times};i++){`);
		ref = node.childNodes;
		for (i = 0, len = ref.length; i < len; i++) {
			nnode = ref[i];
			this._analyze(nnode, rcode, node);
		}
		rcode.str.push("}");
		return parent != null ? parent._last = 'repeat' : void 0;
	}

	_kvElse(node, rcode, parent) {
		var i, len, nnode, ref;
		if ((parent != null ? parent._last : void 0) !== "if") {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} is not expected here`);
		}
		rcode.str.push(`${text}if($helper.expression(${cid})){`);
		ref = node.childNodes;
		for (i = 0, len = ref.length; i < len; i++) {
			nnode = ref[i];
			this._analyze(nnode, rcode, node);
		}
		rcode.str.push("}");
		return parent != null ? parent._last = 'else' : void 0;
	}

	_kvIf(node, rcode, parent, cond = 0) {
		var attrs, exp, i, len, nnode, ref, text;
		if (cond === 1 && ((parent != null ? parent._last : void 0) !== "if")) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} is not expected here`);
		}
		rcode.lang = rcode.lang || "javascript";
		attrs = this._array_to_object(node.attrs);
		exp = attrs.expression;
		if (!exp) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} need an attribute \`expression\``);
		}
		
		//c= rcode.expressions[rcode.lang] ? (rcode.expressions[rcode.lang] = {})
		//if not c[exp]
		//	cid= Object.keys(c).length
		//	c[exp] = cid
		//else
		//	cid= c[exp]
		exp = this._compileExpression(rcode.lang, exp);
		text = '';
		if (cond === 1) {
			text = 'else ';
		}
		rcode.str.push(`${text}if(${exp}){`);
		ref = node.childNodes;
		for (i = 0, len = ref.length; i < len; i++) {
			nnode = ref[i];
			this._analyze(nnode, rcode, node);
		}
		rcode.str.push("}");
		return parent != null ? parent._last = 'if' : void 0;
	}

	async _kvFor(node, rcode, parent, inner) {
		var attrs, cid, exp, i, len, nnode, ref, scode;
		attrs = this._array_to_object(node.attrs);
		if (inner) {
			exp = attrs["kivi:for"];
		} else {
			exp = attrs.expression;
		}
		if (!exp) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} need an attribute \`expression\``);
		}
		scode = Object.assign({}, rcode);
		scode.str = [];
		if (inner) {
			this._normal(node, scode, parent);
		} else {
			ref = node.childNodes;
			for (i = 0, len = ref.length; i < len; i++) {
				nnode = ref[i];
				this._analyze(nnode, scode, node);
			}
		}
		var inivar = exp.split(/\s+/g).filter(function(a){return !!a.trim()})[0]

		exp = `for ${exp}\n	code()\nreturn `;
		//c[exp] = cid
		cid = (await this._compile("coffee", "forexpression", exp, rcode, function(source) {
			return source.replace("code();", `$helper.local.${inivar} = ${inivar};` + scode.str.join("\n"));
		}));
		
		//rcode.str.push("$helper.expression($init#{cid})")
		return parent != null ? parent._last = 'for' : void 0;
	}

	_kvImport(node, rcode, parent) {
		var attrs;
		attrs = this._array_to_object(node.attrs);
		if (!attrs.name && !attrs.include) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} need an attribute \`name\` or \`include\``);
		}
		return rcode.str.push(`await $helper.include(${JSON.stringify(attrs)})`);
	}

	_kvAttr(node, rcode, parent) {
		var attrs, openNode, str;
		attrs = this._array_to_object(node.attrs);
		if (!attrs.name) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} need an attribute \`name\``);
		}
		str = rcode.str[rcode.str.length - 1];
		if (!str.startsWith("$helper.openNode")) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} only can be present after a openNode`);
		}
		openNode = rcode.pop();
		this._kvExpression(node, rcode, null, false);
		rcode.str.push(`$attrs[${JSON.stringify(attrs.name)}] = ${rcode.pop()}`);
		return rcode.str.push(openNode);
	}

	_kvSection(node, rcode, parent) {
		var attrs, i, len, nnode, ref, ref1;
		attrs = this._array_to_object(node.attrs);
		if (!attrs.name) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} need an attribute \`name\``);
		}
		rcode.str.push(`$helper.$section[${JSON.stringify(attrs.name)}]= async function($helper, data){`);
		if ((ref = node.childNodes) != null ? ref.length : void 0) {
			ref1 = node.childNodes;
			for (i = 0, len = ref1.length; i < len; i++) {
				nnode = ref1[i];
				this._analyze(nnode, rcode, node);
			}
		}
		return rcode.str.push("}");
	}

	_kvScript(node, rcode, parent) {
		var attrs, lang, ref;
		attrs = this._array_to_object(node.attrs);
		lang = attrs.lang || "javascript";
		// compile
		if ((ref = node.childNodes) != null ? ref[0] : void 0) {
			return this._compile(lang, this.options.filename, node.childNodes[0].value, rcode);
		}
	}

	_compile(language, filename, source, rcode, after) {
		var ast, c, compiler, ext;
		//rcode.scripts.push source
		//return
		ext = kwcore.KModule.Module.languages[language];
		if (!ext) {
			throw Exception.create(`Language ${language} not supported. You need register a loader`).putCode("NOT_SUPPORTED");
		}
		c = rcode.scripts.length;
		compiler = kwcore.KModule.Module.extensions[ext];
		if (compiler) {
			ast = compiler(source, {
				language: language,
				filename: filename + `.${c}.script`,
				inlineMap: false,
				sourceMap: false
			});
			if (after) {
				ast.code = after(ast.code);
			}
			if (ast.code.startsWith("(function()")){
				ast.code = "return (async function()" + ast.code.substring(11)
			}
			rcode.scripts.push(`function $init${c}($helper,data, $source){\n\t var local = $helper.local;  \n\t ${ast.code}\n}`);
			return rcode.str.push(`await $init${c}($helper,data, $source)`);
		} else {
			if (after) {
				source = after(source);
			}
			if (ast.code.startsWith("(function()")) {
				ast.code = "return (async function()" + ast.code.substring(11)
			}
			rcode.scripts.push(`function $init${c}($helper,data, $source){\n\t var local = $helper.local;\n\t ${source}\n}`);
			return rcode.str.push(`await $init${c}($helper,data, $source)`);
		}
	}

	_normal(node, rcode, parent) {
		var attrs, cnodes, i, j, len, len1, nnode, nob, nunode, ref, str;
		attrs = this._array_to_object(node.attrs);
		nunode = {
			childNodes: [node]
		};
		if (attrs["kivi:if"]) {
			nunode.attrs = [
				{
					value: attrs["kivi:if"],
					name: 'expression'
				}
			];
			delete attrs["kivi:if"];
			node.attrs = this._object_to_array(attrs);
			nunode.ok = true;
		}
		if (nunode.ok) {
			return this._kvIf(nunode, rcode, parent);
		}
		if (node.nodeName === "#text") {
			rcode.lang = rcode.lang || "javascript";
			if (rcode.lang === "javascript") {
				str = node.value.replace(/\\/g, '\\\\');
				rcode.str.push(`$helper.text(\`${str}\`)`);
			} else if (rcode.lang === "coffeescript" || rcode.lang === "coffee") {
				str = node.value.replace(/\\/g, '\\\\');
				str = this._compileExpression(rcode.lang, '"""' + str + '"""');
				rcode.str.push(`$helper.text(${str})`);
			}
			if (node.value.trim()) {
				parent._last = 'text';
			}
			return;
		}
		if (node.nodeName === "script") {
			attrs = this._array_to_object(node.attrs);
			if (attrs["server-side"] !== void 0) {
				// ok, process as script
				return this._kvScript(node, rcode, parent);
			}
		}
		if (node.sourceCodeLocation === null && (node.tagName === "html" || node.tagName === "head" || node.tagName === "body")) {
			if (!((ref = node.attrs) != null ? ref.length : void 0)) {
				cnodes = this._getChildnodes(node);
				for (i = 0, len = cnodes.length; i < len; i++) {
					nnode = cnodes[i];
					this._analyze(nnode, rcode, node);
				}
				return;
			}
		}
		nob = {
			nodeName: node.nodeName,
			value: node.value,
			tagName: node.tagName,
			attrs: this._array_to_object(node.attrs)
		};
		rcode.str.push(`$helper.openNode(${JSON.stringify(nob)})`);
		// iterate child nodes
		if (node.tagName !== "script") {
			cnodes = this._getChildnodes(node);
			if (cnodes != null ? cnodes.length : void 0) {
				for (j = 0, len1 = cnodes.length; j < len1; j++) {
					nnode = cnodes[j];
					this._analyze(nnode, rcode, node);
				}
			}
		} else {
			if (node.childNodes[0]) {
				rcode.str.push(`$helper.writeRaw(${JSON.stringify(node.childNodes[0].value)})`);
			}
		}
		rcode.str.push(`$helper.closeNode(${JSON.stringify(nob.tagName)})`);
		return parent._last = 'tag';
	}

	_getChildnodes(node) {
		var ref, ref1, ref2;
		return (ref = (ref1 = (ref2 = node.content) != null ? ref2.childNodes : void 0) != null ? ref1 : node.childNodes) != null ? ref : [];
	}

	_kvLang(node, rcode, parent) {
		var attrs, available, cnodes, i, len, nnode, results;
		attrs = this._array_to_object(node.attrs);
		available = ["javascript", "coffee", "coffeescript"];
		if (!attrs.lang || available.indexOf(attrs.lang) < 0) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} need an attribute \`lang\` and shoud be any of ${available.join(",")}`);
		}
		rcode.lang = attrs.lang;
		parent._last = 'lang';
		cnodes = this._getChildnodes(node);
		if (cnodes != null ? cnodes.length : void 0) {
			results = [];
			for (i = 0, len = cnodes.length; i < len; i++) {
				nnode = cnodes[i];
				results.push(this._analyze(nnode, rcode, node));
			}
			return results;
		}
	}

	_kvExpression(node, rcode, parent, write = true) {
		var cid, exp, raw;
		raw = node.nodeName === "kivi:raw" || node.nodeName === "vw:rawexpression";
		exp = node.childNodes[0].value;
		rcode.lang = rcode.lang || "javascript";
		cid = this._compileExpression(rcode.lang, exp);
		if (raw) {
			rcode.str.push(`$helper.rawexpression(${cid}, ${write.toString()})`);
		} else {
			rcode.str.push(`$helper.expression(${cid}, ${write.toString()})`);
		}
		return parent != null ? parent._last = 'expression' : void 0;
	}

	_compileExpression(lang, source) {
		var code, y;
		if (lang === "javascript") {
			return source;
		} else if (lang === "coffee" || lang === "coffeescript") {
			code = CoffeeScript.compile(source);
			y = code.indexOf("(function() {");
			if (y >= 0) {
				code = code.substring(y + 14);
			}
			y = code.lastIndexOf("}).call(this);");
			if (y >= 0) {
				code = code.substring(0, y);
			}
			while (code.trim().endsWith(";")) {
				code = code.trim().substring(0, code.length - 1);
			}
			if (code.trim().startsWith("var ")) {
				code = `(function(){${code.trim()}})()`;
			}
			return code;
		}
	}

	_analyze(node, rcode, parent) {
		var attrs, cnodes, i, len, nnode, results, type;
		if (node.sourceCodeLocation) {
			//if node.sourceCodeLocation.startLine != rcode.line
			rcode.line = node.sourceCodeLocation.startLine;
			rcode.str.push("$source.line= " + rcode.line);
			//if node.sourceCodeLocation.startCol != rcode.col
			rcode.col = node.sourceCodeLocation.startCol;
			rcode.str.push("$source.col= " + rcode.col);
		}
		attrs = this._array_to_object(node.attrs);
		if (attrs["kivi:for"]) {
			return this._kvFor(node, rcode, parent, true);
		} else if (node.nodeName.startsWith("vw:") || node.nodeName.startsWith("kivi:")) {
			// parse expression
			if (node.nodeName === "vw:expression" || node.nodeName === "vw:rawexpression" || node.nodeName === "kivi:exp" || node.nodeName === "kivi:raw") {
				type = 'expression';
				if (node.childNodes.length !== 1) {
					throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} need a single textNode`);
				}
			} else if (node.nodeName === "kivi:if" || node.nodeName === "vw:if") {
				node._type = 'if';
				this._kvIf(node, rcode, parent);
			} else if (node.nodeName === "kivi:elseif" || node.nodeName === "vw:elseif") {
				node._type = 'if';
				this._kvIf(node, rcode, parent, 1);
			} else if (node.nodeName === "kivi:else" || node.nodeName === "vw:else") {
				node._type = 'else';
				this._kvElse(node, rcode, parent);
			} else if (node.nodeName === "kivi:repeat") {
				node._type = 'repeat';
				this._kvRepeat(node, rcode, parent);
			} else if (node.nodeName === "kivi:attr") {
				node._type = 'attr';
				this._kvAttr(node, rcode, parent);
			} else if (node.nodeName === "kivi:for" || node.nodeName === "vw:for") {
				node._type = 'for';
				this._kvFor(node, rcode, parent);
			} else if (node.nodeName === "kivi:import" || node.nodeName === "vw:import") {
				node._type = 'import';
				this._kvImport(node, rcode, parent);
			} else if (node.nodeName === "kivi:section" || node.nodeName === "vw:section") {
				node._type = 'section';
				this._kvSection(node, rcode, parent);
			} else if (node.nodeName === "kivi:lang") {
				node._type = 'lang';
				this._kvLang(node, rcode, parent);
			} else if (node.nodeName === "kivi:script") {
				node._type = 'script';
				this._kvScript(node, rcode, parent);
			}
			if (type === "expression") {
				node._type = 'expression';
				return this._kvExpression(node, rcode, parent);
			}
		} else if (node.nodeName !== "#document") {
			node._type = 'normal';
			return this._normal(node, rcode, parent);
		} else {
			cnodes = this._getChildnodes(node);
			results = [];
			for (i = 0, len = cnodes.length; i < len; i++) {
				nnode = cnodes[i];
				results.push(this._analyze(nnode, rcode, node));
			}
			return results;
		}
	}

	transform(source, options = {}) {
		var ast, helper, i, len, rcode, realCode, ref, script;
		if (!options.filename) {
			options.filename = '/default.kivi';
		}
		this.options = options;
		ast = this.parse(source);
		rcode = {
			str: ["class Exception extends Error{}", "var $attrs={}", "var Invoke= async function(data, options){", "var $helper= _helper()", "if(data && data.$section)", "	$helper.$section= Object.assign($helper.$section, data.$section)", "if(options !== undefined){", "	data.options= options", "}", "$helper.$data= data", "$helper.content= []", `var $source= {filename: ${JSON.stringify(options.filename)}}`, "try{", ""],
			expressions: {},
			scripts: [],
			line: 0,
			col: 0,
			count: 0
		};
		this._analyze(ast, rcode);
		rcode.str.push("	return $helper.returnValue()");
		rcode.str.push("}catch(e){");
		rcode.str.push("	var er= new Exception(e.message)");
		rcode.str.push("	if($source.line){");
		rcode.str.push("		let lines= e.stack.split('\\n')");
		rcode.str.push("");
		rcode.str.push("		er.stack= lines[0] + '\\n    at Kivi.invoke (' + $source.filename + ':' + $source.line + ':' + $source.col + ')\\n    ....\\n' + lines.slice(1).join('\\n')");
		rcode.str.push("	}");
		rcode.str.push("	// er.innerException= e ");
		rcode.str.push("	throw er");
		rcode.str.push("}");
		rcode.str.push("}");
		helper = "	(function() {\n  var Path= require(\"path\")\n  var $helper;\n  return $helper = {\n  local:{}, $section: {},\ntext: function(value) {\n  return this.write(value);\n},\nwrite: function(value) {\n  value = this.scape(value);\n  return this.writeRaw(value);\n},\nwriteRaw: function(value) {\n  var ref, ref1;\n  if (value === void 0 || value === null) {\n	value = '';\n  }\n  return this.content.push(value.toString());\n},\nexpression: function(value, write) {\n  if (!write) {\n	return value;\n  }\n  if (write) {\n	return this.write(value);\n  }\n},\nrawexpression: function(value, write) {\n  if (!write) {\n	return value;\n  }\n  if (write) {\n	return this.writeRaw(value);\n  }\n},\n\n\ninclude: async function(attrs, args) {\n  var mod, ndata, result, file, section, main;\n  file= attrs.name || attrs.file\n  if(attrs.section !== undefined){\n	  section= this.$section && this.$section[file]\n	  if(section){\n		  await section(this, this.$data)\n	  }\n	  return\n  }\n  main= this.$data.options && this.$data.options.mainfolder\n  if(main && !file.startsWith(\"./\") && !file.startsWith(\"../\")){\n	  file= Path.join(main, file)\n  }\n  mod = (await import(file));\n  if(typeof mod.text == \"string\"){\n	  this.writeRaw(mod.text)\n  }\n  else if(typeof mod.default == \"string\"){\n	  this.writeRaw(mod.default)\n  }\n  else if (mod.invoke) {\n	  ndata = Object.assign({}, this.$data);\n	  if (arguments.length > 1) {\n		ndata.arguments = args;\n	  }\n	  ndata.$section= this.$section\n	  result = (await mod.invoke(ndata));\n	  return this.writeRaw(result);\n  }\n},\nreturnValue: function() {\n  return this.content.join(\"\");\n},\nopenNode: function(node) {\n  var id, ref, str1, val;\n  str1 = '';\n  if (node.nodeName === \"#documentType\") {\n	str1 = `<!DOCTYPE ${node.name.toUpperCase()}`;\n	if (node.publicId) {\n	  str1 += ` PUBLIC ${node.publicId}`;\n	}\n	if (node.systemId) {\n	  str1 += node.systemId;\n	}\n	str1 += \">\";\n  } else if (node.tagName) {\n	/*\n	if(this.$data.$ignoreroots){\n		if(node.tagName == \"html\" || node.tagName == \"head\" || node.tagName == \"body\"){\n			return;\n		}\n	}*/\n	str1 = `<${node.tagName}`;\n	if (node.attrs) {\n	  ref = Object.assign(node.attrs || {}, $attrs);\n\n	  for (id in ref) {\n		val = ref[id];\n		str1 += ` ${id}='${this.scape(val)}'`;\n	  }\n	}\n	$attrs={}\n	if (node.tagName === \"link\" || node.tagName === \"img\") {\n	  str1 += \"/>\";\n	} else {\n	  str1 += \">\";\n	}\n  }\n  if (str1) {\n	return this.writeRaw(str1);\n  }\n},\ncloseNode: function(tagName) {\n	if(!tagName || tagName == \"undefined\") return\n	/*\n	if(this.$data.$ignoreroots){\n		if(tagName == \"html\" || tagName == \"head\" || tagName == \"body\"){\n			return;\n		}\n	}*/\n  if (tagName !== \"link\" && tagName !== \"img\" && tagName !== \"br\") {\n	return this.writeRaw(`</${tagName}>`);\n  }\n},\nscape: function(unsafe) {\n  if (unsafe === void 0 || unsafe === null) {\n	return '';\n  }\n  unsafe = unsafe.toString();\n  return unsafe.replace(/[&<\"']/g, function(m) {\n	switch (m) {\n	  case '&':\n		return '&amp;';\n	  case '<':\n		return '&lt;';\n	  case '\"':\n		return '&quot;';\n	  default:\n		return '&#039;';\n	}\n  });\n}\n  };\n});";
		realCode = '';
		realCode += "var _helper= " + helper.toString();
		ref = rcode.scripts;
		//realCode += "\n$helper= $helper()"
		for (i = 0, len = ref.length; i < len; i++) {
			script = ref[i];
			realCode += "\n" + script;
		}
		realCode += "\n" + rcode.str.join("\n");
		//realCode += "\n" + "export var invoke=Invoke"
		realCode += "\n" + "export var invoke=Invoke";
		realCode += "\n" + "export var httpInvoke= function(env, ctx){\n	return Invoke(env,ctx).then(function(resp){\n		env.reply.code(200).header('content-type','text/html;charset=utf8').send(resp)\n	})\n}";
		realCode += "\n" + "export var kawixDynamic={time:15000}";
		ast = {
			code: realCode
		};
		
		return ast;
	}

	parse(source, options = {}) {
		var ast;
		options.sourceCodeLocationInfo = true;
		options.allowCustomTagsOnHead = true;
		ast = parse5.parse(source, options);
		return ast;
	}

};

export default Parser;
