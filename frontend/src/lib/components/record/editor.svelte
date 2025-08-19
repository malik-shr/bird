<script lang="ts">
  import EasyMDE from 'easymde';
  import { onMount } from 'svelte';
  import 'easymde/dist/easymde.min.css';
  import { newEditor } from '$lib/editor';

  let editor: EasyMDE;

  let { value = $bindable() } = $props();

  onMount(() => {
    editor = newEditor();

    editor.codemirror.on('change', () => {
      value = editor.value();
    });
  });
</script>

<textarea id="markdown-editor"></textarea>
