import TableCell from '$lib/components/record/table/table-cell.svelte';
import TableHeader from '$lib/components/record/table/table-header.svelte';
import ToggleColumns from '$lib/components/record/table/toggle-columns.svelte';
import UpsertRecord from '$lib/components/record/upsert-record.svelte';

import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { renderComponent } from '$lib/components/ui/data-table';
import { bird } from '$lib/lib';
import type Bird from '$lib/sdk';

import type { ColumnDef } from '@tanstack/table-core';

interface CollectionState {
  collection_name: string;
  records: Bird.Record[];
  fields: Bird.Field[];
  tableColumns: ColumnDef<Bird.Record>[];
  loading: boolean;
}

export class CollectionStateClass implements CollectionState {
  collection_name = $state('');
  records: Bird.Record[] = $state([]);
  fields: Bird.Field[] = $state([]);
  tableColumns: ColumnDef<Bird.Record>[] = $state([]);
  loading: boolean = $state(true);

  async fetchRecords(collection_name: string) {
    const data = await bird.collection(collection_name).getList(0, 12);
    this.records = data?.records;
  }

  async load(collection: string) {
    this.collection_name = collection;

    this.fetchRecords(collection);
    this.fields = await bird.collections.columns(collection);

    const dataColumns: ColumnDef<Bird.Record>[] = this.fields
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

    this.tableColumns = [
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
            collectionState: this,
            record_id: String(row.original.id),
          });
        },
      },
    ];

    this.loading = false;
  }

  async exportCollection() {
    await bird.collections.export(this.collection_name);
  }
}
