<script>
	export let data
</script>

<h1>{data.book.title} by {data.book.author}</h1>
<p role="main">{data.book.description}</p>
<p role="note">ISBN {data.book.primary_isbn13}</p>
<a href={data.book.amazon_product_url}>Buy now!</a>

<ul>
	{#each data.recommended as isbn}
		<li><a href={`/${isbn}`}>{isbn}</a></li>
	{/each}
</ul>
