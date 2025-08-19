<script lang="ts">
  import { Label } from '$lib/components/ui/label/index.js';
  import EditorDialog from '../editor-dialog.svelte';

  let { column, value = $bindable() } = $props();
</script>

<Label for={column.name} class="text-right">{column.name}</Label>

<EditorDialog bind:value field={column} />
