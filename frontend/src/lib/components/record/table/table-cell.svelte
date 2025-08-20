<script lang="ts">
  let { field, value } = $props();
</script>

{#if field.type === 'Boolean'}
  <span>
    {value === 'true' ? 'True' : 'False'}
  </span>
{:else}
  <span>
    {value}
  </span>
{/if}
