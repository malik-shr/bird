<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import Field from './field.svelte';

  let {
    fields = $bindable(),
    addField,
    collection_name = $bindable(),
    description = $bindable(),
  } = $props();

  function changeName(name: string, i: number) {
    fields[i].name = name;
    fields = [...fields];
  }

  function changeOptions(optionStr: string, i: number) {
    fields[i].options = optionStr.split(',').map((option, i) => {
      return { value: i, text: option };
    });
    fields = [...fields];
  }

  function changeReference(relation: string, i: number) {
    fields[i].relationCollection = relation;
    fields = [...fields];
  }
</script>

<Card.Root class="h-[45em]">
  <Card.Header>
    <Card.Title>Collection</Card.Title>
  </Card.Header>
  <Card.Content class="grid gap-6 overflow-y-scroll">
    <div>
      <div class="grid gap-3">
        <Label for="tabs-demo-name">Name</Label>
        <Input
          id="tabs-demo-name"
          name="table_name"
          bind:value={collection_name}
        />
      </div>
      <div class="grid gap-3">
        <Label for="tabs-demo-username">Description</Label>
        <Input
          id="tabs-demo-username"
          name="description"
          bind:value={description}
        />
      </div>

      <div class="grid gap-4 py-4">
        <Field
          field={{
            name: 'id',
            type: 'String',
            isHidden: false,
            isSecure: false,
            isPrimaryKey: true,
            isRequired: true,
            isSystem: false,
            isUnique: true,
          }}
          i={-1}
          {changeName}
          {changeOptions}
          {changeReference}
        />
        {#each fields as _, i}
          <Field
            bind:field={fields[i]}
            {changeName}
            {changeOptions}
            {changeReference}
            {i}
          />
        {/each}
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">+ New Field</Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-56" align="start">
          <DropdownMenu.Group>
            <DropdownMenu.Item onclick={() => addField('String')}
              >String</DropdownMenu.Item
            >
            <DropdownMenu.Item onclick={() => addField('Integer')}
              >Integer</DropdownMenu.Item
            >
            <DropdownMenu.Item onclick={() => addField('Float')}
              >Float</DropdownMenu.Item
            >
            <DropdownMenu.Item onclick={() => addField('Boolean')}
              >Boolean</DropdownMenu.Item
            >
            <DropdownMenu.Item onclick={() => addField('Date')}
              >Date</DropdownMenu.Item
            >
            <DropdownMenu.Item onclick={() => addField('Select')}
              >Select</DropdownMenu.Item
            >
            <DropdownMenu.Item onclick={() => addField('Relation')}
              >Relation</DropdownMenu.Item
            >
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </Card.Content>
</Card.Root>
