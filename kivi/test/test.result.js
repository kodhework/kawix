var _helper= 	(function() {
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
function $init0($helper,data){
	(function() {
  var i, item, len, ref;

  ref = data.result.Detalle;
  for (i = 0, len = ref.length; i < len; i++) {
    item = ref[i];
    $helper.openNode({"nodeName":"tr","tagName":"tr","attrs":{"kivi:for":"item in data.result.Detalle"}})
$source.line= 62
$source.col= 49
$helper.text(`
						`)
$source.line= 63
$source.col= 7
$helper.openNode({"nodeName":"td","tagName":"td","attrs":{}})
$source.line= 63
$source.col= 11
$helper.text(`${item.Mensaje}`)
$helper.closeNode("td")
$source.line= 63
$source.col= 31
$helper.text(`
						`)
$source.line= 64
$source.col= 7
$helper.openNode({"nodeName":"td","tagName":"td","attrs":{}})
$source.line= 64
$source.col= 11
$helper.text(`${item.Período}`)
$helper.closeNode("td")
$source.line= 64
$source.col= 31
$helper.text(`
						`)
$source.line= 65
$source.col= 7
$helper.openNode({"nodeName":"td","tagName":"td","attrs":{}})
$source.line= 65
$source.col= 11
$helper.text(`${item.Acción}`)
$helper.closeNode("td")
$source.line= 65
$source.col= 30
$helper.text(`
					`)
$helper.closeNode("tr")
  }

  return;

}).call(this);

}
class Exception extends Error{}
var $attrs={}
var Invoke= async function(data, options){
var $helper= _helper()
if(data && data.$section)
	$helper.$section= Object.assign($helper.$section, data.$section)
if(options !== undefined){
	data.options= options
}
$helper.$data= data
$helper.content= []
var $source= {filename: "/default.kivi"}
try{

$source.line= 1
$source.col= 1
$helper.openNode({"nodeName":"html","tagName":"html","attrs":{}})
$source.line= 3
$source.col= 1
$helper.openNode({"nodeName":"body","tagName":"body","attrs":{}})
$source.line= 3
$source.col= 7
$helper.text(`
	`)
$source.line= 4
$source.col= 2
$helper.openNode({"nodeName":"style","tagName":"style","attrs":{}})
$source.line= 4
$source.col= 9
$helper.text(`
		.t01 {
			width: 100%;
			table-layout: fixed;

		}

		.t01 td,
		.t01 th {
			padding: 0.5em 1em;
			border: solid 1px rgb(220, 220, 220);
		}

		.grey {
			background-color: grey;
		}

		.grey--text {
			color: grey;
		}

		.grey.lighten-4 {
			background-color: rgb(230, 230, 230);
		}

		.footer {
			padding-top: 8px;
			margin-top: 8px;
		}
	`)
$helper.closeNode("style")
$source.line= 33
$source.col= 10
$helper.text(`
	`)
$source.line= 34
$source.col= 2
$helper.openNode({"nodeName":"div","tagName":"div","attrs":{}})
$source.line= 34
$source.col= 7
$helper.text(`

		`)
$source.line= 36
$source.col= 3
$helper.openNode({"nodeName":"b","tagName":"b","attrs":{}})
$source.line= 36
$source.col= 6
$helper.text(`Estimado `)
$source.line= 36
$source.col= 15
$helper.openNode({"nodeName":"span","tagName":"span","attrs":{}})
$source.line= 36
$source.col= 21
$helper.text(`${data.person.name || ''}`)
$helper.closeNode("span")
$source.line= 36
$source.col= 53
$helper.text(` `)
$source.line= 36
$source.col= 54
$helper.openNode({"nodeName":"span","tagName":"span","attrs":{}})
$source.line= 36
$source.col= 60
$helper.text(`${data.person.lastname || ''}`)
$helper.closeNode("span")
$helper.closeNode("b")
$source.line= 36
$source.col= 100
$helper.text(`
		`)
$source.line= 37
$source.col= 3
$helper.openNode({"nodeName":"div","tagName":"div","attrs":{"style":"height:12px"}})
$helper.closeNode("div")
$source.line= 37
$source.col= 34
$helper.text(`
		Le enviamos este correo para notificarle que usted tiene obligaciones pendientes en el SRI,
		favor contáctese con su asesor para evitar sanciones.
		***********************************************************************************
		Si ha recibido este mensaje por error, por favor eliminelo y notifique a la empresa
		***********************************************************************************
		`)
$source.line= 43
$source.col= 3
$helper.openNode({"nodeName":"div","tagName":"div","attrs":{}})
$source.line= 43
$source.col= 8
$helper.text(`
			`)
$source.line= 44
$source.col= 4
$helper.openNode({"nodeName":"b","tagName":"b","attrs":{}})
$source.line= 44
$source.col= 7
$helper.text(`Fecha consulta:`)
$helper.closeNode("b")
$source.line= 44
$source.col= 26
$helper.text(`
			`)
$source.line= 45
$source.col= 4
$helper.openNode({"nodeName":"span","tagName":"span","attrs":{}})
$source.line= 45
$source.col= 10
$helper.text(`${data.moment.format('DD-MM-YYYY HH:mm')}`)
$helper.closeNode("span")
$source.line= 45
$source.col= 58
$helper.text(`
		`)
$helper.closeNode("div")
$source.line= 46
$source.col= 9
$helper.text(`


		`)
$source.line= 49
$source.col= 3
$helper.openNode({"nodeName":"div","tagName":"div","attrs":{}})
$source.line= 49
$source.col= 8
$helper.text(`

			
			`)
$source.line= 52
$source.col= 4
$helper.openNode({"nodeName":"table","tagName":"table","attrs":{"class":"t01","border":"0","spacing":"0"}})
$source.line= 52
$source.col= 46
$helper.text(`
				`)
$source.line= 53
$source.col= 5
$helper.openNode({"nodeName":"thead","tagName":"thead","attrs":{}})
$source.line= 53
$source.col= 12
$helper.text(`
					`)
$source.line= 54
$source.col= 6
$helper.openNode({"nodeName":"tr","tagName":"tr","attrs":{}})
$source.line= 54
$source.col= 10
$helper.text(`
						`)
$source.line= 55
$source.col= 7
$helper.openNode({"nodeName":"th","tagName":"th","attrs":{"class":"grey lighten-4","style":"width:35%"}})
$source.line= 55
$source.col= 52
$helper.text(`Mensaje`)
$helper.closeNode("th")
$source.line= 55
$source.col= 64
$helper.text(`
						`)
$source.line= 56
$source.col= 7
$helper.openNode({"nodeName":"th","tagName":"th","attrs":{"class":"grey lighten-4","style":"width:20%"}})
$source.line= 56
$source.col= 52
$helper.text(`Periodo`)
$helper.closeNode("th")
$source.line= 56
$source.col= 64
$helper.text(`
						`)
$source.line= 57
$source.col= 7
$helper.openNode({"nodeName":"th","tagName":"th","attrs":{"class":"grey lighten-4","style":"width:45%"}})
$source.line= 57
$source.col= 52
$helper.text(`Acción`)
$helper.closeNode("th")
$source.line= 57
$source.col= 63
$helper.text(`
					`)
$helper.closeNode("tr")
$source.line= 58
$source.col= 11
$helper.text(`
				`)
$helper.closeNode("thead")
$source.line= 59
$source.col= 13
$helper.text(`

				`)
$source.line= 61
$source.col= 5
if(data.result.Detalle){
$source.line= 61
$source.col= 5
$helper.openNode({"nodeName":"tbody","tagName":"tbody","attrs":{}})
$source.line= 61
$source.col= 42
$helper.text(`
					`)
$source.line= 62
$source.col= 6
await $init0($helper,data)
$source.line= 66
$source.col= 11
$helper.text(`
				`)
$helper.closeNode("tbody")
}
$source.line= 67
$source.col= 13
$helper.text(`
				
			`)
$helper.closeNode("table")
$source.line= 69
$source.col= 12
$helper.text(`
		`)
$helper.closeNode("div")
$source.line= 70
$source.col= 9
$helper.text(`


		`)
$source.line= 73
$source.col= 3
$helper.openNode({"nodeName":"div","tagName":"div","attrs":{"class":"grey--text footer"}})
$source.line= 73
$source.col= 34
$helper.text(`
			Si ha recibido este mensaje por error, por favor elimínelo y notifique a la empresa.
			Este comprobante se emitió con su `)
$source.line= 75
$source.col= 38
$helper.openNode({"nodeName":"b","tagName":"b","attrs":{}})
$source.line= 75
$source.col= 41
$helper.text(`AUTORIZACIÓN`)
$helper.closeNode("b")
$source.line= 75
$source.col= 57
$helper.text(`. Si tiene alguna inquietud no dude en responder este
			mensaje con el asunto `)
$source.line= 76
$source.col= 26
$helper.openNode({"nodeName":"b","tagName":"b","attrs":{}})
$source.line= 76
$source.col= 29
$helper.text(`Ayuda`)
$helper.closeNode("b")
$source.line= 76
$source.col= 38
$helper.text(`.
		`)
$helper.closeNode("div")
$source.line= 77
$source.col= 9
$helper.text(`
	`)
$helper.closeNode("div")
$source.line= 78
$source.col= 8
$helper.text(`


`)
$helper.closeNode("body")
$helper.closeNode("html")
	return $helper.returnValue()
}catch(e){
	var er= new Exception(e.message)
	if($source.line){
		let lines= e.stack.split('\n')

		er.stack= lines[0] + '\n    at Kivi.invoke (' + $source.filename + ':' + $source.line + ':' + $source.col + ')\n    ....\n' + lines.slice(1).join('\n')
	}
	// er.innerException= e 
	throw er
}
}
export var invoke=Invoke
export var httpInvoke= function(env, ctx){
	return Invoke(env,ctx).then(function(resp){
		env.reply.code(200).header('content-type','text/html;charset=utf8').send(resp)
	})
}
export var kawixDynamic={time:15000}