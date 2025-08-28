<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import EditorDialog from '../editor-dialog.svelte';
  import BaseInput from './base-input.svelte';

  let { field, value = $bindable() } = $props();
</script>

<BaseInput {field}>
  <Input
    id={field.name}
    name={field.name}
    bind:value
    type="text"
    disabled={field.name === 'id'}
    required={field.isRequired}
  />

  <EditorDialog bind:value {field} />
</BaseInput>
