<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Form from '$lib/components/ui/form/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import Label from '$lib/components/ui/label/label.svelte';
  import { bird } from '$lib/lib';

  async function loginAction(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    await bird.auth.register(
      formObject['username'],
      formObject['email'],
      formObject['password'],
      formObject['confirmPassword']
    );
    goto('/#/login');
  }
</script>

<div>
  <h1>Register</h1>
  <form method="POST" class="w-2/3 space-y-6" onsubmit={loginAction}>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <Label for="username">Email</Label>
      <Input id="email" name="email" />
    </div>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <Label for="username">Username</Label>
      <Input id="username" name="username" />
    </div>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <Label for="password">Password</Label>
      <Input type="password" id="password" name="password" />
    </div>
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <Label for="password">Confirm Password</Label>
      <Input type="password" id="confirmPassword" name="confirmPassword" />
    </div>

    <Button type="submit">Register</Button>
  </form>

  <p>Already have an account? <a href="/#/login">Login</a></p>
</div>
