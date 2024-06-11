<script lang="ts">
  import "../app.css"
  import { page } from "$app/stores"
  import Header from "./Header.svelte"

  const HOMEPAGE = "/"
</script>

<div class="flex flex-col min-h-screen w-full bg-stone-50">
  {#if $page.url.pathname !== HOMEPAGE}
    <Header searchQuery={$page.url.searchParams.get("q")} />
  {/if}

  <div class="min-h-12 grow" />
  <main>
    <slot />
  </main>
  <div class="min-h-12 grow-[2]" />
  <footer
    class="mt-auto flex justify-center bg-stone-100 px-4 py-4 text-sm text-stone-500"
  >
    <small class="">2024 @ Tissai</small>
  </footer>
</div>
