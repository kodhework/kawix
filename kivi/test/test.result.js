var $helper= 	(function() {
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
  if ((ref = this.$data.env) != null ? ref.response : void 0) {
	if (!Buffer.isBuffer(value)) {
	  value = Buffer.from(value.toString());
	}
	return (ref1 = this.$data.env) != null ? ref1.response.write(value) : void 0;
  } else {
	return this.content.push(value.toString());
  }
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
		  section(this, this.$data)
	  }
	  return
  }
  main= this.$data.options && this.$data.options.mainfolder
  if(main && !file.startsWith("./") && !file.startsWith("../")){
	  file= Path.join(main, file)
  }
  mod = (await import(file));
  if (mod.invoke) {
	if (this.$data.__arguments[0] === this.$data) {
	  ndata = Object.assign({}, this.$data);
	  ndata.content = [];
	  if (arguments.length > 1) {
		ndata.arguments = args;
	  }
	  //ndata.$ignoreroots= true
	  result = (await mod.invoke(ndata));
	  return this.writeRaw(result);
	} else {
	  return (await mod.invoke.apply(mod, this.$data.__arguments));
	}
  }
},
returnValue: function() {
  var ref;
  if ((ref = this.$data.env) != null ? ref.response : void 0) {
	return this.$data.env.response.end();
  } else {
	return this.content.join("");
  }
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
	if(this.$data.$ignoreroots){
		if(node.tagName == "html" || node.tagName == "head" || node.tagName == "body"){
			return;
		}
	}
	str1 = `<${node.tagName}`;
	if (node.attrs) {
	  ref = node.attrs;
	  for (id in ref) {
		val = ref[id];
		str1 += ` ${id}='${this.scape(val)}'`;
	  }
	}
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
	if(this.$data.$ignoreroots){
		if(tagName == "html" || tagName == "head" || tagName == "body"){
			return;
		}
	}
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
$helper= $helper()
class Exception extends Error{}
var Invoke= async function(data){
var env, ctx
if(data && data.reply){ // from dhs
	env= data
	ctx= arguments[1]
	data= {env,ctx, body: env.body}
}
data.__arguments= arguments
$helper.$data= data
$helper.content= []
var $source= {filename: "/default.kivi"}
try{

$source.line= 1
$source.col= 1
$helper.$section["content-inmovible"]=function(){
$source.col= 38
$helper.text(`
	`)
$source.line= 2
$source.col= 2
$helper.openNode({"nodeName":"div","tagName":"div","attrs":{"class":"container fluid inmovible"}})
$source.col= 41
$helper.text(`
		`)
$source.line= 3
$source.col= 3
$helper.openNode({"nodeName":"style","tagName":"style","attrs":{}})
$source.col= 10
$helper.text(`
			.loading-container{
				position: fixed;
				width:100%;
				left:0;
				top:0;
				z-index:130000;
			}
			.loading-progress{
				width:0;
				height:3px;
				box-shadow: 0 0 5px rgba(255,255,255,0.6);
			}
			.cover{
				position: fixed;
				top:0;
				z-index: 129900;
				left:0;
				width: 100%;
				height: 100%;
				opacity:1;

			}
			.v-hidden{
				padding-left: 10000px !important;
				overflow: hidden !important;
			}
		`)
$helper.closeNode("style")
$source.line= 30
$source.col= 11
$helper.text(`
		`)
$source.line= 31
$source.col= 3
$helper.openNode({"nodeName":"div","tagName":"div","attrs":{"class":"cover gray lighten-5  loading-cover","style":"display:none","align":"center"}})
$source.col= 88
$helper.text(`

			`)
$source.line= 33
$source.col= 4
$helper.openNode({"nodeName":"table","tagName":"table","attrs":{"style":"border:0;table-layout:fixed;color:white;width:100%;height:100%;font-size: 2em"}})
$source.col= 97
$helper.text(`
				`)
$helper.openNode({"nodeName":"tbody","tagName":"tbody","attrs":{}})
$source.line= 34
$source.col= 5
$helper.openNode({"nodeName":"tr","tagName":"tr","attrs":{"style":"width:100%;height:100%;"}})
$source.col= 41
$helper.text(`
					`)
$source.line= 35
$source.col= 6
$helper.openNode({"nodeName":"td","tagName":"td","attrs":{"valign":"middle","align":"center"}})
$source.col= 41
$helper.text(`
						`)
$source.line= 36
$source.col= 7
$helper.openNode({"nodeName":"#comment","attrs":{}})
$helper.closeNode(undefined)
$source.col= 111
$helper.text(`

						`)
$source.line= 38
$source.col= 7
$helper.openNode({"nodeName":"#comment","attrs":{}})
$helper.closeNode(undefined)
$source.col= 53
$helper.text(`

`)
$source.line= 40
$source.col= 1
$helper.openNode({"nodeName":"#comment","attrs":{}})
$helper.closeNode(undefined)
$source.col= 51
$helper.text(`
					`)
$helper.closeNode("td")
$source.line= 41
$source.col= 11
$helper.text(`
				`)
$helper.closeNode("tr")
$source.line= 42
$source.col= 10
$helper.text(`
			`)
$helper.closeNode("tbody")
$helper.closeNode("table")
$source.line= 43
$source.col= 12
$helper.text(`

		`)
$helper.closeNode("div")
$source.line= 45
$source.col= 9
$helper.text(`
		`)
$source.line= 46
$source.col= 3
$helper.openNode({"nodeName":"div","tagName":"div","attrs":{"class":"container fluid loading-container noprintable"}})
$source.col= 62
$helper.text(`
			`)
$source.line= 47
$source.col= 4
$helper.openNode({"nodeName":"div","tagName":"div","attrs":{"class":"loading-progress purple lighten-3 transitioned"}})
$source.col= 64
$helper.text(`

			`)
$helper.closeNode("div")
$source.line= 49
$source.col= 10
$helper.text(`
		`)
$helper.closeNode("div")
$source.line= 50
$source.col= 9
$helper.text(`
	`)
$helper.closeNode("div")
$source.line= 51
$source.col= 8
$helper.text(`
`)
}
$source.line= 52
$source.col= 14
$helper.text(`


`)
$source.line= 55
$source.col= 1
$helper.$section["script"]=function(){
$source.col= 27
$helper.text(`
	`)
$source.line= 56
$source.col= 2
$helper.openNode({"nodeName":"script","tagName":"script","attrs":{}})
$helper.writeRaw("\n\t\tinit.do(function(){\n\n\t\t\tvar progress= $(\".loading-progress\")\n\t\t\tprogress.css(\"transition-duration\", \"6s\")\n\t\t\tprogress.css(\"width\", \"80%\")\n\n\t\t\tsetTimeout(function(){\n\t\t\t\tvar router= new program.Util.Route()\n\t\t\t\tvar promise= program.WebSite.Application.current.getModule(\"routemanager\").init(true)\n\t\t\t\tconsole.log('here')\n\t\t\t\tif(promise && promise.then){\n\n\t\t\t\t\tpromise.then(function(){\n\t\t\t\t\t\tprogress.css(\"transition-duration\", \"0.7s\")\n\t\t\t\t\t\tprogress.css(\"width\", \"100%\")\n\t\t\t\t\t\tsetTimeout(function(){\n\t\t\t\t\t\t\t$(\".cover\").hide()\n\t\t\t\t\t\t\t$(\".loading-container\").hide()\n\t\t\t\t\t\t}, 500)\n\t\t\t\t\t})\n\t\t\t\t}\n\t\t\t}, 100)\n\n\t\t})\n\t")
$helper.closeNode("script")
$source.line= 81
$source.col= 11
$helper.text(`
`)
}
$source.line= 82
$source.col= 14
$helper.text(`
`)
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
export var kawixDynamic={time:15000}