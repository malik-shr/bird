<script lang="ts">
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

  import FolderLock from '@lucide/svelte/icons/folder-lock';
  import FolderClosed from '@lucide/svelte/icons/folder-closed';
  import { page } from '$app/state';
  import type { Collection } from '$lib/sdk/services/CollectionService';

  let { items }: { items: Collection[] } = $props();
</script>

<Collapsible.Root open={true} class="group/collapsible">
  {#snippet child({ props })}
    <Sidebar.MenuItem {...props}>
      <Collapsible.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton {...props} tooltipContent="Collections">
            <FolderClosed />

            <span>System</span>
            <ChevronRightIcon
              class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
            />
          </Sidebar.MenuButton>
        {/snippet}
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Sidebar.MenuSub>
          {#each items as subItem}
            <Sidebar.MenuSubItem>
              <Sidebar.MenuSubButton
                class={page.params.collection === subItem.name
                  ? 'bg-sidebar-accent'
                  : ''}
              >
                {#snippet child({ props })}
                  <a href={`/collections/${subItem.name}`} {...props}>
                    <FolderLock />
                    <span>{subItem.name}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuSubButton>
            </Sidebar.MenuSubItem>
          {/each}
        </Sidebar.MenuSub>
      </Collapsible.Content>
    </Sidebar.MenuItem>
  {/snippet}
</Collapsible.Root>
