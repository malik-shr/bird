<script lang="ts">
  import { getIcon } from '$lib/utils';

  let { field } = $props();
  let TypeIcon = getIcon(field);
</script>

<div class="flex gap-2 items-center">
  <TypeIcon size={14} />
  <span>{field.name}</span>
</div>
