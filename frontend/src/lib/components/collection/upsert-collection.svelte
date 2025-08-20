<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet/index.js';

  import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import CollectionConfig from './collection-config.svelte';
  import AuthRulesConfig from './auth-rules-config.svelte';
  import Settings from '@lucide/svelte/icons/settings';

  import { bird, collections, fetchCollections } from '$lib/lib';
  import { goto } from '$app/navigation';
  import type Bird from '$lib/sdk';

  let { selectedCollectionName }: { selectedCollectionName?: string | null } =
    $props();

  let collection_name: string = $state('');
  let selectedCollectionColumns: Bird.Field[] | null = $state(null);
  let description: string = $state('');
  let fields: Bird.Field[] = $state([]);

  let open = $state(false);

  let authRules: Bird.RuleData = $state({
    viewRule: 0,
    createRule: 0,
    updateRule: 0,
    deleteRule: 0,
  });

  function addField(type: string) {
    fields = [
      ...fields,
      {
        type: type,
        name: 'field',
        isPrimaryKey: false,
        isHidden: false,
        isRequired: false,
        isUnique: false,
        options: [],
      },
    ];
  }

  async function createCollectionAction() {
    await bird.collections.create(collection_name, fields, 'base', authRules);
    fetchCollections();
    goto(`/#/collections/${collection_name}`);
    open = false;
  }

  async function load() {
    if (selectedCollectionName) {
      selectedCollectionColumns = await bird.collections.columns(
        selectedCollectionName
      );

      if (selectedCollectionColumns) {
        selectedCollectionColumns.shift();
        fields = selectedCollectionColumns;
        collection_name = selectedCollectionName;
      }
    } else {
      fields = [];
    }
  }

  async function deleteCollection() {
    if (selectedCollectionName) {
      open = false;
      fetchCollections();
      goto(`/#/collections/${$collections[0].name}`);
      await bird.collections.delete(selectedCollectionName);
    }
  }

  $effect(() => {
    if (selectedCollectionName || open === false) {
      load();
    }
  });
</script>

<Sheet.Root {open}>
  <Sheet.Trigger
    class={buttonVariants({ variant: 'outline' })}
    onclick={() => {
      open = true;
    }}
  >
    {#if selectedCollectionName}
      <Button variant="ghost"><Settings /></Button>
    {:else}
      <span>Create Collection</span>
    {/if}</Sheet.Trigger
  >
  <Sheet.Content side="right">
    <Sheet.Header>
      <Sheet.Title>
        <span
          >{selectedCollectionName ? 'Edit Collection' : 'Create Collection'}
        </span>
        {#if selectedCollectionName}
          <Button
            variant="link"
            class="text-destructive"
            onclick={deleteCollection}>Delete</Button
          >
        {/if}</Sheet.Title
      >
    </Sheet.Header>
    <div class="flex w-full flex-col gap-6">
      <Tabs.Root value="collection">
        <Tabs.List>
          <Tabs.Trigger value="collection">Collection</Tabs.Trigger>
          <Tabs.Trigger value="authRules">Auth Rules</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="collection">
          <CollectionConfig
            bind:collection_name
            bind:description
            bind:fields
            {addField}
          />
        </Tabs.Content>
        <Tabs.Content value="authRules">
          <AuthRulesConfig bind:authRules />
        </Tabs.Content>
      </Tabs.Root>
    </div>
    <Sheet.Footer>
      <Button onclick={createCollectionAction} variant="outline"
        >{selectedCollectionName
          ? 'Update Collection'
          : 'Create Collection'}</Button
      >
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
