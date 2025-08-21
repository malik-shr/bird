<script lang="ts">
  import { page } from '$app/state';
  import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { bird } from '$lib/lib';
  import Progress from '../ui/progress/progress.svelte';

  let { fetchRecords } = $props();

  let file = $state('');

  let progress = $state(0);

  function handleFileChange(e: any) {
    file = e.target.files[0];
  }

  async function importRecords(e: Event) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    await bird.collection(page.params.collection!).import(formData, (data) => {
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        console.error('Failed to parse progress data:', error);
        return;
      }

      if (parsedData.progress) {
        progress = parseInt(parsedData.progress);
      }
    });
    await fetchRecords(page.params.collection!);
  }
</script>

<Dialog.Root>
  <Dialog.Trigger class={buttonVariants({ variant: 'outline' })}
    >Import Records</Dialog.Trigger
  >
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Import Records</Dialog.Title>
    </Dialog.Header>
    <form method="post" onsubmit={importRecords}>
      <div class="flex gap-1 mt-5">
        <Input type="file" name="file" onchange={handleFileChange} />
        <Button type="submit">Import</Button>
      </div>
    </form>

    {#if progress !== 0}
      <div class="flex gap-2 items-center">
        <Progress value={progress} />
        <p>{progress}%</p>
      </div>{/if}
  </Dialog.Content>
</Dialog.Root>
