<script lang="ts">
  import { Switch } from '$lib/components/ui/switch/index.js';
  import { Label } from '$lib/components/ui/label/index.js';

  let { column, value = $bindable() } = $props();
</script>

<Label for={column.name}>{column.name}</Label>
<Switch id={column.name} name={column.name} bind:checked={value} />
