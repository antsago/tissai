<script lang="ts">
  import type { Suggestion } from "@tissai/db"
  import { Chip, ChipContainer } from "$lib/components"

  export let suggestion: Suggestion
  export let baseUrl: string
</script>

<div
  class="w-full h-full flex flex-col rounded bg-stone-200"
>
  <div class="relative w-full flex-basis-6 min-h-20 max-h-[25rem] rounded-t">
    <ChipContainer class="bg-stone-200">
      {#each suggestion.values as value}
        <a
          href="{baseUrl}&{encodeURIComponent(
            suggestion.label,
          )}={encodeURIComponent(value)}"
        >
        <Chip background="bg-stone-100" orange>
          {value}
        </Chip>
        </a>
      {/each}
    </ChipContainer>
  </div>
  <h3
    class="block w-full px-4 py-3 border rounded-b border-stone-300/50 text-base text-center truncate text-stone-700"
  >Filtrar por {suggestion.label}</h3>
</div>
