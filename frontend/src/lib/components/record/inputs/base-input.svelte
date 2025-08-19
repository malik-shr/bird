<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { getInputType } from '../utils';

  let { column, value = $bindable() } = $props();
</script>

<Label for={column.name} class="text-right">{column.name}</Label>
<Input
  id={column.name}
  name={column.name}
  bind:value
  class="col-span-3"
  type={getInputType(column)}
  disabled={column.name === 'id'}
/>
