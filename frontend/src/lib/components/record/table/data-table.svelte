<script lang="ts" generics="TData, TValue">
  import {
    type ColumnDef,
    getCoreRowModel,
    getPaginationRowModel,
    type PaginationState,
    type RowSelectionState,
    type VisibilityState,
  } from '@tanstack/table-core';
  import {
    createSvelteTable,
    FlexRender,
  } from '$lib/components/ui/data-table/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import DeletePanel from './delete-panel.svelte';
  import { bird } from '$lib/lib';
  import { page } from '$app/state';

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  };

  let { data, columns }: DataTableProps<TData, TValue> = $props();

  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 12 });
  let rowSelection = $state<RowSelectionState>({});
  let columnVisibility = $state<VisibilityState>({});
  let pageCount = $state<number>(-1); // -1 means "unknown" until first fetch
  let loading = $state(true);

  // 👇 Fetch from backend whenever pagination changes
  async function refetchData(pageNumber: number) {
    loading = true;
    if (page.params.collection) {
      // assume bird.collection().getList(page, pageSize) returns { items, totalCount }
      const res = await bird
        .collection(page.params.collection)
        .getList(pageNumber, 12);

      data = res?.records; // current 12 rows

      pageCount = Math.ceil(res?.totalCount / pagination.pageSize);

      if (pageCount === 0) {
        pageCount = 1;
      }
    }
    loading = false;
  }

  $effect(() => {
    refetchData(pagination.pageIndex);
  });

  const table = createSvelteTable({
    manualPagination: true,

    // 👇 use a getter so pageCount is always reactive
    get pageCount() {
      return pageCount;
    },

    get data() {
      return data;
    },
    columns,
    onRowSelectionChange: (updater) => {
      rowSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
    },
    onPaginationChange: (updater) => {
      loading = true;
      pagination =
        typeof updater === 'function' ? updater(pagination) : updater;
    },
    onColumnVisibilityChange: (updater) => {
      columnVisibility =
        typeof updater === 'function' ? updater(columnVisibility) : updater;
    },
    state: {
      get pagination() {
        return pagination;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return rowSelection;
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
</script>

<div>
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head colspan={header.colSpan}>
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#if !loading}
          {#each table.getRowModel().rows as row (row.id)}
            <Table.Row data-state={row.getIsSelected() && 'selected'}>
              {#each row.getVisibleCells() as cell (cell.id)}
                <Table.Cell>
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                </Table.Cell>
              {/each}
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell colspan={columns.length} class="h-24 text-center">
                No results.
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  <!-- 🔹 Pagination controls -->
  <div class="flex items-center justify-end space-x-2 py-4">
    <Button
      variant="outline"
      size="sm"
      onclick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      Previous
    </Button>
    <span>Page {pagination.pageIndex + 1} of {pageCount}</span>
    <Button
      variant="outline"
      size="sm"
      onclick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      Next
    </Button>
  </div>

  <div class="flex items-center text-muted-foreground flex-1 text-sm">
    <span>
      {table.getFilteredSelectedRowModel().rows.length} of{' '}
      {table.getFilteredRowModel().rows.length} row(s) selected
    </span>

    {#if table.getFilteredSelectedRowModel().rows.length > 0}
      <DeletePanel
        rows={table.getFilteredSelectedRowModel().rows}
        refetchData={() => refetchData(0)}
      />
    {/if}
  </div>
</div>
