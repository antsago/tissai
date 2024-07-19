<script lang="ts">
  import type { Search } from "@tissai/db"

  export let suggestion: Search["suggestions"][0]
  export let baseUrl: string
</script>

<div>
  <h3>{suggestion.label}</h3>
  {#each suggestion.values as value}
    <a href="{baseUrl}&{encodeURIComponent(suggestion.label)}={encodeURIComponent(value)}">
      {value}
    </a>
  {/each}
</div>
