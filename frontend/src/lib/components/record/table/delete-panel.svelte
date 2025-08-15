<script>
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/button';
  import { bird } from '$lib/lib';

  let { rows, refetchData } = $props();

  let collection_name = $derived(page.params.collection);

  async function deleteRows() {
    for (const row of rows) {
      if (collection_name) {
        await bird.collection(collection_name).delete(row.original.id);
      }
    }
    rows.length = 0;
    await refetchData();
  }
</script>

<div>
  <Button variant="link" class="text-destructive" onclick={deleteRows}
    >Delete</Button
  >
</div>
