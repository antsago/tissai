<script lang="ts">
  import SearchIcon from "./MagnifyingGlass.svelte"

  let classes = ""
  export { classes as class }
  export let initialValue: string | null = ""
  export let large = false
  export let onSubmit: any = () => {} // Hook to test form submit
</script>

<form
  action="/search"
  on:submit={onSubmit}
  role="search"
  class="{classes} flex rounded-full border border-stone-300 bg-stone-100"
>
  <input
    name="q"
    type="search"
    value={initialValue}
    class={`flex-grow w-1 bg-inherit py-2 ml-6 text-stone-700 text-sm ${large ? "text-base" : "text-sm"}`}
  />
  <button
    class={`ml-auto py-2 -my-px -mr-px border rounded-r-full border-orange-500 bg-orange-500 ${large ? "pl-4 pr-6" : "pl-2 pr-4"}`}
  >
    <SearchIcon
      class={`stroke-[2.5] text-orange-100 ${large ? "w-7" : "w-5"}`}
    />
  </button>
</form>
