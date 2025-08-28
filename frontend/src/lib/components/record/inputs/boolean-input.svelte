<script lang="ts">
  import { Switch } from '$lib/components/ui/switch/index.js';
  import BaseInput from './base-input.svelte';

  let { field, value = $bindable() } = $props();
</script>

<BaseInput {field}>
  <Switch
    id={field.name}
    name={field.name}
    bind:checked={value}
    required={field.isRequired}
  />
</BaseInput>
