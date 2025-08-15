<script lang="ts">
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import Button from '$lib/components/ui/button/button.svelte';
  import type { Table } from '@tanstack/table-core';
  import { EllipsisVertical } from '@lucide/svelte/icons';
  import type Bird from '$lib/sdk';

  let { table }: { table: Table<Bird.Record> } = $props();
</script>

<div>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="ghost" class="ml-auto"
          ><EllipsisVertical /></Button
        >
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      {#each table
        .getAllColumns()
        .filter((col) => col.getCanHide()) as column (column.id)}
        <DropdownMenu.CheckboxItem
          bind:checked={
            () => column.getIsVisible(), (v) => column.toggleVisibility(!!v)
          }
        >
          {column.id}
        </DropdownMenu.CheckboxItem>
      {/each}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
