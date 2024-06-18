<script lang="ts">
  let classes = ""
  export { classes as class }
</script>

<div class="flex flex-row flex-wrap justify-center px-1 {classes}">
  <slot />
</div>
