<script lang="ts">
  import { Label } from '$lib/components/ui/label/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { getOptionText } from '../utils';

  let { column, value = $bindable() } = $props();
</script>

<Label for={column.name}>{column.name}</Label>
<Select.Root type="single" name={column.name} bind:value>
  <Select.Trigger>{getOptionText(column, parseInt(value))}</Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Label>Options</Select.Label>
      {#each column.options! as option}
        <Select.Item value={String(option.value)} label={option.text}
          >{option.text}</Select.Item
        >
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
