<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js';
  import BaseInput from './base-input.svelte';

  let { field, value = $bindable() } = $props();

  function handleFileChange(e: any) {
    value = e.target.files[0];
  }
</script>

<BaseInput {field}
  ><Input
    id={field.name}
    name={field.name}
    class="col-span-3"
    type="file"
    onchange={(e) => handleFileChange(e)}
    required={field.isRequired}
  />
</BaseInput>
