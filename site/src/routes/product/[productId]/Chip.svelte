<script lang="ts">
  export let color = "stone"
</script>

<span class="border border-{color}-700 bg-stone-100 text-{color}-600 rounded-full px-4 py-1">
  <slot/>
</span>
