<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet/index.js';

  import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

  import { bird } from '$lib/lib';
  import { page } from '$app/state';
  import Pen from '@lucide/svelte/icons/pen';
  import RelationField from './relation-field.svelte';
  import type Bird from '$lib/sdk';
  import { assignRecordFormData } from './utils';
  import BaseInput from './inputs/base-input.svelte';
  import FileInput from './inputs/file-input.svelte';
  import MarkdownInput from './inputs/markdown-input.svelte';
  import BooleanInput from './inputs/boolean-input.svelte';
  import SelectInput from './inputs/select-input.svelte';
  import type { CollectionStateClass } from '../../../routes/(auth)/collections/[collection]/CollectionState.svelte';

  interface Props {
    collectionState: CollectionStateClass;
    record_id?: string | null;
  }

  let { collectionState, record_id = null }: Props = $props();

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
      record = await bird
        .collection(collectionState.collection_name)
        .getOne(record_id);
      formData = Object.assign({}, record);
    } else {
      formData = assignRecordFormData(collectionState.fields);
    }

    loading = false;
  }

  async function createRecordAction() {
    // Exclude id
    let { id, ...rest } = formData;
    formData = rest;

    const fd = new FormData();
    for (const key in formData) {
      const val = formData[key];

      fd.append(key, val);
    }

    if (record.id) {
      await bird
        .collection(collectionState.collection_name)
        .update(record.id, fd);
    } else {
      await bird.collection(collectionState.collection_name).create(fd);
    }

    open = false;

    await collectionState.fetchRecords(collectionState.collection_name);
  }
</script>

{#if loading}
  <Button variant="ghost">Loading...</Button>
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
        {#each collectionState.fields as column}
          <div class="grid grid-cols-4 items-center gap-4">
            {#if column.type === 'String' || column.type === 'Float' || column.type === 'Integer' || column.type === 'Date'}
              <BaseInput bind:value={formData[column.name]} {column} />
            {:else if column.type === 'File'}
              <FileInput bind:value={formData[column.name]} {column} />
            {:else if column.type === 'Markdown'}
              <MarkdownInput bind:value={formData[column.name]} {column} />
            {:else if column.type === 'Boolean'}
              <BooleanInput bind:value={formData[column.name]} {column} />
            {:else if column.type === 'Select'}
              <SelectInput bind:value={formData[column.name]} {column} />
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
