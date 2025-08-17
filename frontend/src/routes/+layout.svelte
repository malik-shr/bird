<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { user } from '$lib/lib';
  import { goto } from '$app/navigation';

  let { children } = $props();

  $effect(() => {
    if ($user) {
      goto('/#/collections');
    } else {
      goto('/#/login');
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
