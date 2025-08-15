<script lang="ts">
  import NavMain from './nav-main.svelte';
  import NavUser from './nav-user.svelte';
  import TeamSwitcher from './team-switcher.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';

  let {
    ref = $bindable(null),
    collapsible = 'icon',
    ...restProps
  }: any = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <TeamSwitcher />
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
