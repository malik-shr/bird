<script lang="ts">
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
  import Settings from '@lucide/svelte/icons/settings';

  import FolderOpen from '@lucide/svelte/icons/folder-open';
  import Folder from '@lucide/svelte/icons/folder';

  import NavSystem from './nav-system.svelte';
  import UpsertCollectio from '../collection/upsert-collection.svelte';
  import { page } from '$app/state';
  import { collections } from '$lib/lib';
  import UpsertCollection from '../collection/upsert-collection.svelte';

  const systemItems = $derived($collections.filter((item) => item.is_system));

  const nonsystemItems = $derived(
    $collections.filter((item) => !item.is_system)
  );
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
  <Sidebar.Menu>
    <Collapsible.Root open={true} class="group/collapsible">
      {#snippet child({ props })}
        <Sidebar.MenuItem {...props}>
          <Collapsible.Trigger>
            {#snippet child({ props })}
              <Sidebar.MenuButton {...props} tooltipContent="Collections">
                <FolderOpen />

                <span>Collections</span>
                <ChevronRightIcon
                  class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                />
              </Sidebar.MenuButton>
            {/snippet}
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Sidebar.MenuSub>
              {#each nonsystemItems as subItem}
                <Sidebar.MenuSubItem>
                  <Sidebar.MenuSubButton
                    class={page.params.collection === subItem.name
                      ? 'bg-sidebar-accent'
                      : ''}
                  >
                    {#snippet child({ props })}
                      <a href={`/#/collections/${subItem.name}`} {...props}>
                        <Folder />
                        <span>{subItem.name}</span>
                      </a>
                    {/snippet}
                  </Sidebar.MenuSubButton>
                </Sidebar.MenuSubItem>
              {/each}
              <Sidebar.MenuSubItem>
                <NavSystem items={systemItems} />
              </Sidebar.MenuSubItem>
              <Sidebar.MenuSubItem>
                <UpsertCollection />
              </Sidebar.MenuSubItem>
            </Sidebar.MenuSub>
          </Collapsible.Content>
        </Sidebar.MenuItem>
      {/snippet}
    </Collapsible.Root>

    <Sidebar.MenuItem>
      <Sidebar.MenuButton>
        {#snippet child({ props })}
          <a href="/#/settings" {...props}>
            <Settings />
            <span>Settings</span>
          </a>
        {/snippet}
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  </Sidebar.Menu>
</Sidebar.Group>
