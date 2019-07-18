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

	_getLastOpenNode(arr: Array<string>): any{
		var y = arr.length - 1
		var value: string 
		
		while(true){
			value = arr[y]
			if(value == undefined){
				break 
			}
			if(value && value.startsWith("$helper.openNode")){
				return {
					index: y,
					value
				} 
			}
			y-- 
		}
		return {}
	}

	_kvAttr(node, rcode, parent) {
		var attrs, openNode, res
		attrs = this._array_to_object(node.attrs);
		if (!attrs.name) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} need an attribute \`name\``);
		}
		res = this._getLastOpenNode(rcode.str)
		
		if (!res.value) {
			throw Exception.create(`Parsing: line ${rcode.line} - col ${rcode.col}. ${node.nodeName} only can be present after a openNode`);
		}
		openNode = res.value 		
		this._kvExpression(node, rcode, null, false);
		
		rcode.str[res.index] = `$node.attrs[${JSON.stringify(attrs.name)}] = ${rcode.str.pop()};` + res.value 
		//rcode.str.push(`$attrs[${JSON.stringify(attrs.name)}] = ${rcode.pop()}`);
		//return rcode.str.push(openNode);
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
		rcode.str.push(`$node = ${JSON.stringify(nob)};$node.attrs=$node.attrs || {};`)
		rcode.str.push("$helper.openNode($node)");
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
			str: ["class Exception extends Error{}", "var $attrs={}, $node", "var Invoke= async function(data, options){", "var $helper= _helper()", "if(data && data.$section)", "	$helper.$section= Object.assign($helper.$section, data.$section)", "if(options !== undefined){", "	data.options= options", "}", "$helper.$data= data", "$helper.content= []", `var $source= {filename: ${JSON.stringify(options.filename)}}`, "try{", ""],
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

		//var helpFunc = require("fs").readFileSync(__dirname + "/helper.txt")
		var helpFunc:any = `
KGZ1bmN0aW9uKCl7CiAgICB2YXIgUGF0aCA9IHJlcXVpcmUoInBhdGgiKQogICAgdmFyICRoZWxwZXIgCiAgICByZXR1cm4gJGhlbHBlciAJPSB7CiAgICAgICAgbG9j
YWw6IHt9LAogICAgICAgICRzZWN0aW9uOiB7fSwKICAgICAgICB0ZXh0OiBmdW5jdGlvbih2YWx1ZSl7CiAgICAgICAgICAgIHJldHVybiB0aGlzLndyaXRlKHZhbHVl
KQogICAgICAgIH0sCiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uKHZhbHVlKXsKICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnNjYXBlKHZhbHVlKQogICAgICAgICAgICBy
ZXR1cm4gdGhpcy53cml0ZVJhdyh2YWx1ZSkKICAgICAgICB9LAogICAgICAgIHdyaXRlUmF3OiBmdW5jdGlvbih2YWx1ZSl7CiAgICAgICAgICAgIHZhciByZWYsIHJl
ZjE7CiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwIHx8IHZhbHVlID09PSBudWxsKSB7CiAgICAgICAgICAgICAgICB2YWx1ZSA9ICcnOwogICAgICAgICAg
ICB9CiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnQucHVzaCh2YWx1ZS50b1N0cmluZygpKTsKICAgICAgICB9LAogICAgICAgIGV4cHJlc3Npb246IGZ1bmN0
aW9uICh2YWx1ZSwgd3JpdGUpIHsKICAgICAgICAgICAgaWYgKCF3cml0ZSkgewogICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlOwogICAgICAgICAgICB9CiAgICAg
ICAgICAgIGlmICh3cml0ZSkgewogICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud3JpdGUodmFsdWUpOwogICAgICAgICAgICB9CiAgICAgICAgfSwKICAgICAgICBy
YXdleHByZXNzaW9uOiBmdW5jdGlvbiAodmFsdWUsIHdyaXRlKSB7CiAgICAgICAgICAgIGlmICghd3JpdGUpIHsKICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTsK
ICAgICAgICAgICAgfQogICAgICAgICAgICBpZiAod3JpdGUpIHsKICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLndyaXRlUmF3KHZhbHVlKTsKICAgICAgICAgICAg
fQogICAgICAgIH0sCiAgICAgICAgaW5jbHVkZTogYXN5bmMgZnVuY3Rpb24gKGF0dHJzLCBhcmdzKSB7CiAgICAgICAgICAgIHZhciBtb2QsIG5kYXRhLCByZXN1bHQs
IGZpbGUsIHNlY3Rpb24sIG1haW47CiAgICAgICAgICAgIGZpbGUgPSBhdHRycy5uYW1lIHx8IGF0dHJzLmZpbGUKICAgICAgICAgICAgaWYgKGF0dHJzLnNlY3Rpb24g
IT09IHVuZGVmaW5lZCkgewogICAgICAgICAgICAgICAgc2VjdGlvbiA9IHRoaXMuJHNlY3Rpb24gJiYgdGhpcy4kc2VjdGlvbltmaWxlXQogICAgICAgICAgICAgICAg
aWYgKHNlY3Rpb24pIHsKICAgICAgICAgICAgICAgICAgICBhd2FpdCBzZWN0aW9uKHRoaXMsIHRoaXMuJGRhdGEpCiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAg
ICAgICByZXR1cm4KICAgICAgICAgICAgfQogICAgICAgICAgICBtYWluID0gdGhpcy4kZGF0YS5vcHRpb25zICYmIHRoaXMuJGRhdGEub3B0aW9ucy5tYWluZm9sZGVy
CiAgICAgICAgICAgIGlmIChtYWluICYmICFmaWxlLnN0YXJ0c1dpdGgoIi4vIikgJiYgIWZpbGUuc3RhcnRzV2l0aCgiLi4vIikpIHsKICAgICAgICAgICAgICAgIGZp
bGUgPSBQYXRoLmpvaW4obWFpbiwgZmlsZSkKICAgICAgICAgICAgfQogICAgICAgICAgICBtb2QgPSAoYXdhaXQgaW1wb3J0KGZpbGUpKTsKICAgICAgICAgICAgaWYg
KHR5cGVvZiBtb2QudGV4dCA9PSAic3RyaW5nIikgewogICAgICAgICAgICAgICAgdGhpcy53cml0ZVJhdyhtb2QudGV4dCkKICAgICAgICAgICAgfQogICAgICAgICAg
ICBlbHNlIGlmICh0eXBlb2YgbW9kLmRlZmF1bHQgPT0gInN0cmluZyIpIHsKICAgICAgICAgICAgICAgIHRoaXMud3JpdGVSYXcobW9kLmRlZmF1bHQpCiAgICAgICAg
ICAgIH0KICAgICAgICAgICAgZWxzZSBpZiAobW9kLmludm9rZSkgewogICAgICAgICAgICAgICAgbmRhdGEgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLiRkYXRhKTsK
ICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkgewogICAgICAgICAgICAgICAgICAgIG5kYXRhLmFyZ3VtZW50cyA9IGFyZ3M7CiAgICAgICAg
ICAgICAgICB9CiAgICAgICAgICAgICAgICBuZGF0YS4kc2VjdGlvbiA9IHRoaXMuJHNlY3Rpb24KICAgICAgICAgICAgICAgIHJlc3VsdCA9IChhd2FpdCBtb2QuaW52
b2tlKG5kYXRhKSk7CiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53cml0ZVJhdyhyZXN1bHQpOwogICAgICAgICAgICB9CiAgICAgICAgfSwKICAgICAgICByZXR1
cm5WYWx1ZTogZnVuY3Rpb24gKCkgewogICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50LmpvaW4oIiIpOwogICAgICAgIH0sCiAgICAgICAgb3Blbk5vZGU6IGZ1
bmN0aW9uIChub2RlKSB7CiAgICAgICAgICAgIHZhciBpZCwgcmVmLCBzdHIxLCB2YWw7CiAgICAgICAgICAgIHN0cjEgPSAnJzsKICAgICAgICAgICAgCiAgICAgICAg
ICAgIGlmIChub2RlLm5vZGVOYW1lID09PSAiI2RvY3VtZW50VHlwZSIpIHsKICAgICAgICAgICAgICAgIHN0cjEgPSBgPCFET0NUWVBFICR7bm9kZS5uYW1lLnRvVXBw
ZXJDYXNlKCl9YDsKICAgICAgICAgICAgICAgIGlmIChub2RlLnB1YmxpY0lkKSB7CiAgICAgICAgICAgICAgICAgICAgc3RyMSArPSBgIFBVQkxJQyAke25vZGUucHVi
bGljSWR9YDsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGlmIChub2RlLnN5c3RlbUlkKSB7CiAgICAgICAgICAgICAgICAgICAgc3RyMSArPSBub2Rl
LnN5c3RlbUlkOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgc3RyMSArPSAiPiI7CiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS50YWdOYW1lKSB7
CiAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgIHN0cjEgPSBgPCR7bm9kZS50YWdOYW1lfWA7CiAgICAgICAgICAgICAgICBpZiAobm9kZS5hdHRycykgewog
ICAgICAgICAgICAgICAgICAgIHJlZiA9IE9iamVjdC5hc3NpZ24obm9kZS5hdHRycyB8fCB7fSwgJGF0dHJzKTsKCiAgICAgICAgICAgICAgICAgICAgZm9yIChpZCBp
biByZWYpIHsKICAgICAgICAgICAgICAgICAgICAgICAgdmFsID0gcmVmW2lkXTsKICAgICAgICAgICAgICAgICAgICAgICAgc3RyMSArPSBgICR7aWR9PScke3RoaXMu
c2NhcGUodmFsKX0nYDsKICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAkYXR0cnMgPSB7fQogICAgICAgICAgICAg
ICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gImxpbmsiIHx8IG5vZGUudGFnTmFtZSA9PT0gImltZyIpIHsKICAgICAgICAgICAgICAgICAgICBzdHIxICs9ICIvPiI7CiAg
ICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICAgIHN0cjEgKz0gIj4iOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAg
ICAgIGlmIChzdHIxKSB7CiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53cml0ZVJhdyhzdHIxKTsKICAgICAgICAgICAgfQogICAgICAgIH0sCiAgICAgICAgY2xv
c2VOb2RlOiBmdW5jdGlvbiAodGFnTmFtZSkgewogICAgICAgICAgICBpZiAoIXRhZ05hbWUgfHwgdGFnTmFtZSA9PSAidW5kZWZpbmVkIikgcmV0dXJuCiAgICAgICAg
ICAgIGlmICh0YWdOYW1lICE9PSAibGluayIgJiYgdGFnTmFtZSAhPT0gImltZyIgJiYgdGFnTmFtZSAhPT0gImJyIikgewogICAgICAgICAgICAgICAgcmV0dXJuIHRo
aXMud3JpdGVSYXcoYDwvJHt0YWdOYW1lfT5gKTsKICAgICAgICAgICAgfQogICAgICAgIH0sCiAgICAgICAgc2NhcGU6IGZ1bmN0aW9uICh1bnNhZmUpIHsKICAgICAg
ICAgICAgaWYgKHVuc2FmZSA9PT0gdm9pZCAwIHx8IHVuc2FmZSA9PT0gbnVsbCkgewogICAgICAgICAgICAgICAgcmV0dXJuICcnOwogICAgICAgICAgICB9CiAgICAg
ICAgICAgIHVuc2FmZSA9IHVuc2FmZS50b1N0cmluZygpOwogICAgICAgICAgICByZXR1cm4gdW5zYWZlLnJlcGxhY2UoL1smPCInXS9nLCBmdW5jdGlvbiAobSkgewog
ICAgICAgICAgICAgICAgc3dpdGNoIChtKSB7CiAgICAgICAgICAgICAgICAgICAgY2FzZSAnJic6CiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJmFtcDsn
OwogICAgICAgICAgICAgICAgICAgIGNhc2UgJzwnOgogICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyZsdDsnOwogICAgICAgICAgICAgICAgICAgIGNhc2Ug
JyInOgogICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyZxdW90Oyc7CiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDoKICAgICAgICAgICAgICAgICAgICAg
ICAgcmV0dXJuICcmIzAzOTsnOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICB9KTsKICAgICAgICB9CQogICAgfQp9KQ==`;
		helpFunc = Buffer.from(helpFunc.replace(/\n/g,''),'base64')
		

		helper = "(" + helpFunc.toString() + ")"
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
