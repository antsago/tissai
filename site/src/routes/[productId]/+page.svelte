<script>
	export let data
</script>

<img alt={data.name} src={data.image} />
<h1>{data.name}</h1>
<p role="main">{data.description}</p>
<a href={data.sellers?.[0].productUrl}>Crompra en {data.sellers[0].shop.name}</a>
