<script lang="ts">
	import { Logo } from "$lib/components"
	import SearchForm from "./SearchForm.svelte"
</script>

<div class="px-2 py-8 flex flex-col justify-around items-center">
  <div class="flex justify-center items-center mb-12">
    <Logo class="w-20 text-orange-600 mr-2"/>
    <h1 class="pt-[1rem] text-6xl text-orange-500 font-['Kalam']">
      Tissai
    </h1>
  </div>
  <SearchForm large class="w-full max-w-xl"/>
</div>
