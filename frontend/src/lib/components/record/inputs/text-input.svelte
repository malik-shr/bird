<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js';
  import type Bird from '$lib/sdk';
  import { getInputType } from '../utils';
  import BaseInput from './base-input.svelte';

  let { field, value = $bindable() }: { field: Bird.Field; value: string } =
    $props();
</script>

<BaseInput {field}>
  <Input
    id={field.name}
    name={field.name}
    bind:value
    class="col-span-3"
    type={getInputType(field)}
    disabled={field.name === 'id'}
    required={field.isRequired}
  />
</BaseInput>
