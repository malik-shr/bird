<script lang="ts">
  let { field, value } = $props();
</script>

{#if field.type === 'Boolean'}
  <span>
    {value === 1 ? 'True' : 'False'}
  </span>
{:else}
  <span>
    {value}
  </span>
{/if}
