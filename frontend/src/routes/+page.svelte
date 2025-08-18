<script>
  import { goto } from '$app/navigation';
  import { user } from '$lib/lib';
  import { onMount } from 'svelte';

  onMount(() => {
    if ($user === null) {
      goto('/#/login');
    } else {
      goto('/#/collections');
    }
  });
</script>
