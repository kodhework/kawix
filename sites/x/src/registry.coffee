
export database=

	# core library
	"core":
		"repo": "https://github.com/voxsoftware/kawix/tree/master/core"
		"url": "https://raw.githubusercontent.com/kodhework/kawix/${version}/core/${file}"
		"version_prefix": "core/"
		"versions": {
			"url": "https://api.github.com/repos/kodhework/kawix/tags"
			"filter": (a)-> a.name.startsWith("core/")
			"post": (arr)->
				arr.push
					id: 'master',
					version: 'master'
				arr
			"map": (a)->
				parts = a.name.substring(4).split(".")
				number = (parseInt(parts[0])*10000)+(parseInt(parts[1])*100)+(parseInt(parts[2])*1)
				return
					id: a.node_id
					version: a.name.substring(4)
					number:number
		}

		"extensions": [
			".js"
			".ts"
			".coffee"
			".json"
			".cson"
		]

	# dhs library
	"dhs":
		"repo": "https://github.com/voxsoftware/kawix/tree/master/dhs"
		"url": "https://raw.githubusercontent.com/kodhework/kawix/${version}/dhs/${file}"
		"version_prefix": "dhs/"
		"versions": {
			"url": "https://api.github.com/repos/kodhework/kawix/tags"
			"filter": (a)-> a.name.startsWith("dhs/")
			"post": (arr)->
				arr.push
					id: 'master',
					version: 'master'
				arr
			"map": (a)->
				parts = a.name.substring(4).split(".")
				number = (parseInt(parts[0])*10000)+(parseInt(parts[1])*100)+(parseInt(parts[2])*1)
				return
					id: a.node_id
					version: a.name.substring(4)
					number:number
		}

		# find the best suitable extension
		"extensions": [
			".js"
			".ts"
			".coffee"
			".json"
			".cson"
		]

	# more modules
	"modules":
		"repo": "https://github.com/voxsoftware/kawix-modules"
		"url": "https://raw.githubusercontent.com/kodhework/kawix-modules/${version}/${file}"

		# find the best suitable extension
		"extensions": [
			".js"
			".ts"
			".coffee"
			".json"
			".cson"
		]

	# standar library
	"std":
		"repo": "https://github.com/voxsoftware/kawix/tree/master/std"
		"url": "https://raw.githubusercontent.com/kodhework/kawix/${version}/std/${file}"
		"version_prefix": "std/"
		"versions": {
			"url": "https://api.github.com/repos/kodhework/kawix/tags"
			"filter": (a)-> a.name.startsWith("std/")
			"post": (arr)->
				arr.push
					id: 'master',
					version: 'master'
				arr
			"map": (a)->
				parts = a.name.substring(4).split(".")
				number = (parseInt(parts[0])*10000)+(parseInt(parts[1])*100)+(parseInt(parts[2])*1)
				return
					id: a.node_id
					version: a.name.substring(4)
					number:number
		}
		"extensions": [
			".js"
			".ts"
			".coffee"
			".json"
			".cson"
		]

	# kivi template library
	"kivi":
		"repo": "https://github.com/voxsoftware/kawix/tree/master/kivi"
		"url": "https://raw.githubusercontent.com/kodhework/kawix/${version}/kivi/${file}"
		"version_prefix": "kivi/"
		"versions": {
			"url": "https://api.github.com/repos/kodhework/kawix/tags"
			"filter": (a)-> a.name.startsWith("kivi/")
			"post": (arr)->
				arr.push
					id: 'master',
					version: 'master'
				arr
			"map": (a)->
				parts = a.name.substring(4).split(".")
				number = (parseInt(parts[0])*10000)+(parseInt(parts[1])*100)+(parseInt(parts[2])*1)
				return
					id: a.node_id
					version: a.name.substring(4)
					number:number
		}
		# find the best suitable extension
		"extensions": [
			".js"
			".ts"
			".coffee"
			".json"
			".cson"
		]


	# gix library
	"gix":
		"repo": "https://github.com/voxsoftware/kawix/tree/master/gix"
		"url": "https://raw.githubusercontent.com/kodhework/kawix/${version}/gix/${file}"
		"version_prefix": "gix/"
		"versions": {
			"url": "https://api.github.com/repos/kodhework/kawix/tags"
			"filter": (a)-> a.name.startsWith("gix/")
			"post": (arr)->
				arr.push
					id: 'master',
					version: 'master'
				arr
			"map": (a)->
				parts = a.name.substring(4).split(".")
				number = (parseInt(parts[0])*10000)+(parseInt(parts[1])*100)+(parseInt(parts[2])*1)
				return
					id: a.node_id
					version: a.name.substring(4)
					number:number
		}
		# find the best suitable extension
		"extensions": [
			".js"
			".ts"
			".coffee"
			".json"
			".cson"
		]
