<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import Button from '$lib/components/ui/button/button.svelte';
  import { Input } from '$lib/components/ui/input/index.js';
  import Label from '$lib/components/ui/label/label.svelte';
  import { bird, user } from '$lib/lib';
  import { onMount } from 'svelte';

  onMount(async () => {
    if ($user !== null) {
      goto('/collections');
    }
  });

  async function loginAction(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    await bird.auth.login(formObject.username, formObject.password);
    goto('/collections');
  }
</script>

<div>
  <h1>Login</h1>
  <form method="POST" class="w-2/3 space-y-6" onsubmit={loginAction}>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <Label for="username">Username</Label>
      <Input id="username" name="username" />
    </div>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <Label for="password">Password</Label>
      <Input id="password" name="password" type="password" />
    </div>

    <Button type="submit">Login</Button>
  </form>

  <p>No Account? <a href="/register">Register</a></p>
</div>
