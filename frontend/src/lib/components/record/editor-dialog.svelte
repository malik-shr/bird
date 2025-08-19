<script lang="ts">
  import 'easymde/dist/easymde.min.css';

  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button, buttonVariants } from '../ui/button';
  import Editor from './editor.svelte';

  let { value = $bindable(), field } = $props();
</script>

<Dialog.Root>
  <Dialog.Trigger class={buttonVariants({ variant: 'outline' })}
    >Open Editor</Dialog.Trigger
  >
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{field.name}</Dialog.Title>
    </Dialog.Header>

    <Editor bind:value />

    <Dialog.Footer>
      <Dialog.Close><Button type="submit">Save changes</Button></Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
