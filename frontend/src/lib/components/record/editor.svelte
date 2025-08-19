<script lang="ts">
  import EasyMDE from 'easymde';
  import { onMount } from 'svelte';
  import 'easymde/dist/easymde.min.css';
  import { newEditor } from '$lib/md-editor';
  import DOMPurify from 'isomorphic-dompurify';

  let editor: EasyMDE;

  let { value = $bindable() } = $props();

  onMount(() => {
    editor = newEditor(value);

    editor.codemirror.on('change', () => {
      value = DOMPurify.sanitize(editor.value());
    });
  });
</script>

<textarea id="markdown-editor"></textarea>
