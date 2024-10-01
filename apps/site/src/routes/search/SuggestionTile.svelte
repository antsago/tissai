<script lang="ts">
  import type { Suggestion } from "@tissai/db"

  export let suggestion: Suggestion
  export let baseUrl: string
</script>

<div>
  <h3>{suggestion.label}</h3>
  {#each suggestion.values as value}
    <a
      href="{baseUrl}&{encodeURIComponent(
        suggestion.label,
      )}={encodeURIComponent(value)}"
    >
      {value}
    </a>
  {/each}
</div>
