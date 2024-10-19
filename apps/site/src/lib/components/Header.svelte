<script lang="ts">
  import { Logo } from "./icons"
  import SearchForm from "./SearchForm.svelte"

  export let searchQuery: string | null
</script>

<header class="px-6 py-4 border-b border-orange-600">
  <div class="max-w-screen-lg mx-auto flex justify-between items-center">
    <a href="/" class="mr-8 flex">
      <Logo class="w-12 text-orange-600" />
      <span
        class="hidden md:block pt-[0.5rem] text-4xl text-orange-500 font-['Kalam']"
      >
        Tissai
      </span>
    </a>

    <SearchForm class="flex-grow max-w-lg" initialValue={searchQuery} />
  </div>
</header>
