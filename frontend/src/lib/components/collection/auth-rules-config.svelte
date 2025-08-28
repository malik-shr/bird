<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import type Bird from '$lib/sdk';

  let { authRules = $bindable() }: { authRules: Bird.RuleData } = $props();
</script>

<Card.Root class="h-[45em]">
  <Card.Header>
    <Card.Title>Auth Rules</Card.Title>
  </Card.Header>
  <Card.Content class="grid gap-6 overflow-y-scroll ">
    <div class="grid gap-3">
      <Label for="viewRule">View Rule</Label>
      <Input
        id="viewRule"
        type="number"
        bind:value={authRules['viewRule']}
        min="0"
        max="6"
      />
    </div>
    <div class="grid gap-3">
      <Label for="createRule">Create Rule</Label>
      <Input
        id="createRule"
        type="number"
        bind:value={authRules['createRule']}
        min="0"
        max="6"
      />
    </div>
    <div class="grid gap-3">
      <Label for="updateRule">update Rule</Label>
      <Input
        id="updateRule"
        type="number"
        bind:value={authRules['updateRule']}
        min="0"
        max="6"
      />
    </div>
    <div class="grid gap-3">
      <Label for="deleteRule">Delete Rule</Label>
      <Input
        id="deleteRule"
        type="number"
        bind:value={authRules['deleteRule']}
        min="0"
        max="6"
      />
    </div>
  </Card.Content>
</Card.Root>
