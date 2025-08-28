<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js';
  import { getOptionText } from '../utils';
  import BaseInput from './base-input.svelte';

  let { field, value = $bindable() } = $props();
</script>

<BaseInput {field}
  ><Select.Root
    type="single"
    name={field.name}
    bind:value
    required={field.isRequired}
  >
    <Select.Trigger>{getOptionText(field, parseInt(value))}</Select.Trigger>
    <Select.Content>
      <Select.Group>
        <Select.Label>Options</Select.Label>
        {#each field.options! as option}
          <Select.Item value={String(option.value)} label={option.text}
            >{option.text}</Select.Item
          >
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
</BaseInput>
