<script lang="ts">
  import { getIcon } from '$lib/utils';

  import Input from '../ui/input/input.svelte';
  import Label from '../ui/label/label.svelte';

  import * as Select from '$lib/components/ui/select/index.js';
  import { onMount } from 'svelte';
  import { bird } from '$lib/lib';

  let collections = $state([]);

  onMount(async () => {
    collections = await bird.collections.list();
  });

  let value = $state('Select Reference Collection');

  let {
    field = $bindable(),
    i,
    changeName,
    changeOptions,
    changeReference,
  } = $props();
  let TypeIcon = getIcon(field);
</script>

<div class="flex items-center gap-2">
  <Label for={`field-${i}`}>
    <TypeIcon size={15} /></Label
  >

  {#if field.type === 'String' || field.type === 'Integer' || field.type === 'Float' || field.type === 'Date' || field.type === 'Boolean'}
    <div class="flex items-center gap-2 w-full">
      <Input
        type="text"
        oninput={(e) => changeName(e.currentTarget.value, i)}
        id={`field-${i}`}
        value={field.name}
        disabled={field.name === 'id'}
      />
    </div>
  {:else if field.type === 'Select'}
    <div class="flex items-center gap-2">
      <div class="flex w-full">
        <Input
          type="text"
          value={field.name}
          oninput={(e) => changeName(e.currentTarget.value, i)}
          id={`field-${i}`}
        />
        <Input
          type="text"
          oninput={(e) => changeOptions(e.currentTarget.value, i)}
          id={`options-${i}`}
        />
      </div>
    </div>
  {:else if field.type === 'Relation'}
    <div class="flex w-full">
      <Input
        type="text"
        value={field.name}
        oninput={(e) => changeName(e.currentTarget.value, i)}
        id={`field-${i}`}
      />
      <Select.Root
        type="single"
        name={field.name}
        bind:value
        onValueChange={(e) => {
          changeReference(value, i);
        }}
      >
        <Select.Trigger>
          {value}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Collection</Select.Label>
            {#each collections as collection}
              <Select.Item value={collection['name']} label={collection['name']}
                >{collection['name']}</Select.Item
              >
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  {/if}
</div>
