<script lang="ts">
  import CreateRecord from '$lib/components/record/upsert-record.svelte';
  import DataTable from '$lib/components/record/table/data-table.svelte';

  import { bird } from '$lib/lib';
  import { page } from '$app/state';
  import type { ColumnDef } from '@tanstack/table-core';
  import { renderComponent } from '$lib/components/ui/data-table';
  import UpsertRecord from '$lib/components/record/upsert-record.svelte';
  import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
  import UpsertCollection from '$lib/components/collection/upsert-collection.svelte';
  import TableHeader from '$lib/components/record/table/table-header.svelte';
  import ToggleColumns from '$lib/components/record/table/toggle-columns.svelte';
  import type Bird from '$lib/sdk';
  import TableCell from '$lib/components/record/table/table-cell.svelte';
  import Button from '$lib/components/ui/button/button.svelte';

  let records: Bird.Record[] = $state([]);
  let columns: Bird.Field[] = $state([]);
  let tableColumns: ColumnDef<Bird.Record>[] = $state([]);
  let loading: boolean = $state(true);

  let collection_name: string = $state(page.params.collection!);

  $effect(() => {
    if (page.params.collection) {
      loading = true;
      load(page.params.collection);
    }
  });

  async function fetchRecords(collection_name: string) {
    records = await bird.collection(collection_name).getList();
  }

  async function load(collection: string) {
    collection_name = page.params.collection!;

    records = await bird.collection(collection).getList();
    columns = await bird.collections.columns(collection);

    const dataColumns: ColumnDef<Bird.Record>[] = columns
      .filter((field) => !field.isHidden)
      .map((field) => {
        return {
          accessorKey: field.name,
          header: () =>
            renderComponent(TableHeader, {
              field,
            }),
          cell: ({ row }) =>
            renderComponent(TableCell, {
              field,
              value: row.getValue(field.name),
            }),
        };
      });

    tableColumns = [
      {
        id: 'select',
        header: ({ table }) =>
          renderComponent(Checkbox, {
            checked: table.getIsAllPageRowsSelected(),
            indeterminate:
              table.getIsSomePageRowsSelected() &&
              !table.getIsAllPageRowsSelected(),
            onCheckedChange: (value) =>
              table.toggleAllPageRowsSelected(!!value),
            'aria-label': 'Select all',
          }),
        cell: ({ row }) =>
          renderComponent(Checkbox, {
            checked: row.getIsSelected(),
            onCheckedChange: (value) => row.toggleSelected(!!value),
            'aria-label': 'Select row',
          }),
        enableSorting: false,
        enableHiding: false,
      },
      ...dataColumns,
      {
        id: 'actions',
        enableHiding: false,
        header: ({ table }) => renderComponent(ToggleColumns, { table: table }),

        cell: ({ row }) => {
          return renderComponent(UpsertRecord, {
            collection: collection_name,
            columns: columns,
            record_id: String(row.original.id),
            fetchRecords,
          });
        },
      },
    ];

    loading = false;
  }

  async function exportCollection() {
    await bird.collections.export(collection_name);
  }
</script>

{#if !loading}
  <div class="m-10">
    <div class="flex justify-between w-full items-center mb-10">
      <div class="flex gap-5 items-center">
        <h2 class="text-2xl">{page.params.collection}</h2>
        <UpsertCollection selectedCollectionName={page.params.collection} />
      </div>

      <div class="flex gap-5 items-center">
        <Button variant="outline" onclick={exportCollection}>Export</Button>
        <CreateRecord {fetchRecords} {columns} collection={collection_name} />
      </div>
    </div>

    <DataTable data={records} columns={tableColumns} />
  </div>
{/if}
