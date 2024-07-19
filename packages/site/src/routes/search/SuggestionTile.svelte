<script lang="ts">
  import type { Search } from "@tissai/db"

  export let suggestion: Search["suggestions"][0]
  export let baseUrl: string
</script>

<div>
  <h3>{suggestion.label}</h3>
  <a href="{baseUrl}&{suggestion.label}={suggestion.values[0]}">
    {suggestion.values[0]}
  </a>
</div>
