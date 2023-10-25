<script>
	export let data;
</script>

<h1>{data.book.title} by {data.book.author}</h1>
<p>{data.book.description}</p>
<p>ISBN {data.book.primary_isbn13}</p>

<ul>
	{#each data.recommended as isbn}
		<li><a href={`/${isbn}`}>{isbn}</a></li>
	{/each}
</ul>
