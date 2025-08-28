<script lang="ts">
  import Label from '$lib/components/ui/label/label.svelte';

  let { field, children } = $props();
</script>

<div class="flex">
  <Label for={field.name} class="text-right">{field.name}</Label>
  {#if field.isRequired}
    <span class="text-red-700">*</span>
  {/if}
</div>

{@render children?.()}
