<script lang="ts">
  import CreateRecord from '$lib/components/record/upsert-record.svelte';
  import DataTable from '$lib/components/record/table/data-table.svelte';

  import { page } from '$app/state';
  import UpsertCollection from '$lib/components/collection/upsert-collection.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import ImportRecords from '$lib/components/record/import-records.svelte';
  import { CollectionStateClass } from './CollectionState.svelte';

  const collectionState = new CollectionStateClass();

  $effect(() => {
    if (page.params.collection) {
      collectionState.loading = true;
      collectionState.load(page.params.collection);
    }
  });
</script>

{#if !collectionState.loading}
  <div class="m-10">
    <div class="flex justify-between w-full items-center mb-10">
      <div class="flex gap-5 items-center">
        <h2 class="text-2xl">{page.params.collection}</h2>
        <UpsertCollection
          selectedCollectionName={collectionState.collection_name}
        />
      </div>

      <div class="flex gap-5 items-center">
        <ImportRecords fetchRecords={collectionState.fetchRecords} />
        <Button variant="outline" onclick={collectionState.exportCollection}
          >Export</Button
        >
        <CreateRecord {collectionState} />
      </div>
    </div>

    <DataTable
      data={collectionState.records}
      columns={collectionState.tableColumns}
    />
  </div>
{/if}
