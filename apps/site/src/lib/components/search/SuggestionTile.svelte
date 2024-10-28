<script lang="ts">
  import type { Suggestion } from "@tissai/db"
  import ChipCloud from "../shared/ChipCloud.svelte"

  export let suggestion: Suggestion
</script>

<div class="w-full h-full flex flex-col rounded bg-stone-200">
  <div class="relative w-full flex-basis-6 min-h-20 max-h-[25rem] rounded-t">
    <ChipCloud
      background="bg-stone-200"
      chips={suggestion.values.map((value) => ({
        text: value.name,
        emphasis: "primary",
        href: value.href,
      }))}
    />
  </div>
  <h3
    class="block w-full px-4 py-3 border rounded-b border-stone-300/50 text-base text-center truncate text-stone-700"
  >
    Filtrar por {suggestion.label}
  </h3>
</div>
