<script lang="ts">
  import { goto } from '$app/navigation';
  import AppSidebar from '$lib/components/sidebar/app-sidebar.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { fetchCollections } from '$lib/lib';
  import { onMount } from 'svelte';

  let { children } = $props();

  let loading = $state(true);

  onMount(async () => {
    try {
      await fetchCollections();
      loading = false;
    } catch (e) {
      goto('/#/login');
    }
  });
</script>

{#if loading}
  <div>Fetching user...</div>
{:else}
  <div class="w-full">
    <Sidebar.Provider>
      <AppSidebar />
      <main class="w-full">
        {@render children?.()}
      </main>
    </Sidebar.Provider>
  </div>
{/if}
