<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet/index.js';

  import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

  import { bird } from '$lib/lib';
  import { page } from '$app/state';
  import Pen from '@lucide/svelte/icons/pen';
  import RelationField from './relation-field.svelte';
  import type Bird from '$lib/sdk';
  import { assignRecordFormData } from './utils';
  import FileInput from './inputs/file-input.svelte';
  import MarkdownInput from './inputs/markdown-input.svelte';
  import BooleanInput from './inputs/boolean-input.svelte';
  import SelectInput from './inputs/select-input.svelte';
  import type { CollectionStateClass } from '../../../routes/(auth)/collections/[collection]/CollectionState.svelte';
  import TextInput from './inputs/text-input.svelte';

  interface Props {
    collectionState: CollectionStateClass;
    record?: Bird.Record | null;
  }

  let { collectionState, record = null }: Props = $props();

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
    if (record) {
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

    if (record) {
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
      class={buttonVariants({ variant: !record ? 'default' : 'secondary' })}
      onclick={() => {
        open = true;
      }}
      >{#if record}
        <Button variant="ghost"><Pen /></Button>
      {:else}
        <span>Create Record</span>
      {/if}</Sheet.Trigger
    >
    <Sheet.Content side="right">
      <Sheet.Header>
        <Sheet.Title>{!record ? 'Create Record' : 'Edit Record'}</Sheet.Title>
      </Sheet.Header>

      <form
        id="upsertRecord"
        class="grid gap-4 py-4 mx-4"
        onsubmit={createRecordAction}
      >
        {#each collectionState.fields as field}
          <div class="grid grid-cols-4 items-center gap-4">
            {#if field.type === 'String' || field.type === 'Float' || field.type === 'Integer' || field.type === 'Date'}
              <TextInput bind:value={formData[field.name]} {field} />
            {:else if field.type === 'File'}
              <FileInput bind:value={formData[field.name]} {field} />
            {:else if field.type === 'Markdown'}
              <MarkdownInput bind:value={formData[field.name]} {field} />
            {:else if field.type === 'Boolean'}
              <BooleanInput bind:value={formData[field.name]} {field} />
            {:else if field.type === 'Select'}
              <SelectInput bind:value={formData[field.name]} {field} />
            {:else if field.type === 'Relation'}
              <RelationField value={formData[field.name]} {field} />
            {/if}
          </div>
        {/each}
      </form>
      <Sheet.Footer>
        <Button type="submit" form="upsertRecord"
          >{!record ? 'Create Record' : 'Update Record'}</Button
        >
      </Sheet.Footer>
    </Sheet.Content>
  </Sheet.Root>
{/if}
