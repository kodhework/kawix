<template>
	<p>{{Greeting}} word!</p> 
</template>
<script lang='coffeescript'>
	module.exports= 
		data: ()->
			return 
				"Greeting": "Hello"

</script>

<style scoped>
	p{
		font-size:12px;
	}
</style>
