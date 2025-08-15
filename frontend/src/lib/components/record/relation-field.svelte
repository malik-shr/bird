<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js';
  import { bird } from '$lib/lib';
  import { onMount } from 'svelte';
  import Label from '../ui/label/label.svelte';

  let { field, value = $bindable() } = $props();

  let loading = $state(false);
  let relations = $state([]);

  onMount(async () => {
    if (field.relationCollection) {
      relations = await bird.collection(field.relationCollection).getList();
    }
    loading = false;
  });
</script>

<Label>
  <Label for={field.name}>{field.name}</Label>
</Label>
<Select.Root type="single" name={field.name} bind:value>
  <Select.Trigger>{value}</Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Label>Options</Select.Label>
      {#each relations as relation}
        <Select.Item value={relation['id']} label={relation['id']}
          >{relation['id']}</Select.Item
        >
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
