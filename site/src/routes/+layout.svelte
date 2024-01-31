<script>
	import "../app.css"
</script>

<div class="min-h-screen flex flex-col w-full">
	<nav class="sticky top-0 left-0 right-0 mb-6 flex items-center border-b border-orange-600/50 px-6 py-2 bg-orange-400">
		<img
			class="w-10"
			alt="Tissai logo"
			src="/favicon.svg"
		/>
	</nav>
	<slot />
</div>
