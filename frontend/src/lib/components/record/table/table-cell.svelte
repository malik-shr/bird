<script lang="ts">
  let { field, value } = $props();

  console.log(value);
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
