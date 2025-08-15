<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet/index.js';

  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';

  import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

  import { bird } from '$lib/lib';

  import * as Select from '$lib/components/ui/select/index.js';
  import { Switch } from '$lib/components/ui/switch/index.js';
  import { page } from '$app/state';
  import Pen from '@lucide/svelte/icons/pen';
  import RelationField from './relation-field.svelte';
  import type Bird from '$lib/sdk';

  let {
    columns,
    collection,
    record_id = null,
    fetchRecords,
  }: {
    columns: Bird.Field[];
    collection: string;
    record_id?: string | null;
    fetchRecords: () => Promise<void>;
  } = $props();

  let record: Bird.Record = $state({});
  let formData: Bird.Record = $state({});
  let loading = $state(true);
  let collection_name = $derived(page.params.collection);

  let open = $state(false);

  $effect(() => {
    if (collection_name && open === false) {
      load();
    }
  });

  async function load() {
    if (record_id) {
      record = await bird.collection(collection).getOne(record_id);
      formData = Object.assign({}, record);
    } else {
      formData = columns.reduce((a, column) => {
        if (column.name === 'id') {
          return Object.assign(a, { [column.name]: 'Autogeneration' });
        }

        if (column.type === 'String') {
          return Object.assign(a, { [column.name]: '' });
        } else if (column.type === 'Boolean') {
          return Object.assign(a, { [column.name]: false });
        } else if (column.type === 'Select') {
          return Object.assign(a, { [column.name]: 'Select Option' });
        } else if (column.type === 'Relation') {
          return Object.assign(a, { [column.name]: 'Select Relation' });
        }

        return Object.assign(a, { [column.name]: 0 });
      }, {});
    }

    loading = false;
  }

  function getInputType(column: Bird.Field) {
    if (column.name === 'password') return 'password';
    if (column.type === 'Integer' || column.type === 'Float') {
      return 'number';
    } else if (column.type === 'Date') {
      return 'date';
    }

    return 'text';
  }

  async function createRecordAction() {
    // Exclude id
    let { id, ...rest } = formData;
    formData = rest;

    if (record.id) {
      await bird.collection(collection).update(record.id, formData);
    } else {
      await bird.collection(collection).create(formData);
    }

    open = false;

    await fetchRecords();
  }

  function getOptionText(field: Bird.Field, option_value: number) {
    const option = field.options?.filter(
      (option) => option.value === option_value
    )[0];

    if (option) {
      return option.text;
    }

    return 'Select Option';
  }
</script>

{#if loading}
  <div>...Loading</div>
{:else}
  <Sheet.Root {open}>
    <Sheet.Trigger
      class={buttonVariants({ variant: !record.id ? 'default' : 'secondary' })}
      onclick={() => {
        open = true;
      }}
      >{#if record.id}
        <Button variant="ghost"><Pen /></Button>
      {:else}
        <span>Create Record</span>
      {/if}</Sheet.Trigger
    >
    <Sheet.Content side="right">
      <Sheet.Header>
        <Sheet.Title>{!record.id ? 'Create Record' : 'Edit Record'}</Sheet.Title
        >
      </Sheet.Header>

      <div class="grid gap-4 py-4 mx-4">
        {#each columns as column}
          <div class="grid grid-cols-4 items-center gap-4">
            {#if column.type === 'String' || column.type === 'Float' || column.type === 'Integer' || column.type === 'Date'}
              <Label for={column.name} class="text-right">{column.name}</Label>
              <Input
                id={column.name}
                name={column.name}
                bind:value={formData[column.name]}
                class="col-span-3"
                type={getInputType(column)}
                disabled={column.name === 'id'}
              />
            {:else if column.type === 'Boolean'}
              <Label for={column.name}>{column.name}</Label>
              <Switch
                id={column.name}
                name={column.name}
                bind:checked={formData[column.name]}
              />
            {:else if column.type === 'Select'}
              <Label for={column.name}>{column.name}</Label>
              <Select.Root
                type="single"
                name={column.name}
                bind:value={formData[column.name]}
              >
                <Select.Trigger
                  >{getOptionText(
                    column,
                    parseInt(formData[column.name])
                  )}</Select.Trigger
                >
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Options</Select.Label>
                    {#each column.options! as option}
                      <Select.Item
                        value={String(option.value)}
                        label={option.text}>{option.text}</Select.Item
                      >
                    {/each}
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            {:else if column.type === 'Relation'}
              <RelationField value={formData[column.name]} field={column} />
            {/if}
          </div>
        {/each}
      </div>
      <Sheet.Footer>
        <Button onclick={createRecordAction}
          >{!record.id ? 'Create Record' : 'Update Record'}</Button
        >
      </Sheet.Footer>
    </Sheet.Content>
  </Sheet.Root>
{/if}
