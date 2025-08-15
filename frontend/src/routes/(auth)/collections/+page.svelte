<script lang="ts">
  import { goto } from '$app/navigation';
  import { collections } from '$lib/lib';

  $effect(() => {
    if ($collections.length > 0) {
      goto(`/#/collections/${$collections[0].name}`);
    }
  });
</script>

<div>Loading...</div>
