<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';

  let { column, value = $bindable() } = $props();

  function handleFileChange(e: any) {
    value = e.target.files[0];
  }
</script>

<Label for={column.name} class="text-right">{column.name}</Label>
<Input
  id={column.name}
  name={column.name}
  class="col-span-3"
  type="file"
  onchange={(e) => handleFileChange(e)}
/>
