<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { Toaster } from '$lib/components/ui/sonner/index.js';

  let { children } = $props();
</script>

<svelte:head>
  <title>Bird</title>
  <link rel="icon" href={favicon} />
</svelte:head>

<Toaster position="top-center" />
{@render children?.()}
