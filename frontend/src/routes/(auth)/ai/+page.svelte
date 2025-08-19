<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import Input from '$lib/components/ui/input/input.svelte';
  import { bird } from '$lib/lib';
  import type Bird from '$lib/sdk';
  import { onMount } from 'svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Label } from '$lib/components/ui/dropdown-menu';
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
  import DOMPurify from 'isomorphic-dompurify';
  import { marked } from 'marked';

  let messages: Bird.Message[] = [];
  let message = '';
  let loading = false;

  onMount(async () => {
    messages = await bird.collection('messages').getList();
  });

  async function sendAiRequest(event: Event) {
    event.preventDefault();
    if (!message.trim()) return;

    messages = [...messages, { role: 'user', content: message }];
    const userMessage = message;
    message = '';
    loading = true;

    const token = localStorage.getItem('token');
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessage = '';

    // Add initial assistant message
    messages = [...messages, { role: 'assistant', content: '' }];

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete SSE events
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep incomplete event in buffer

      for (const event of events) {
        if (!event.trim()) continue;

        const lines = event.split('\n');
        let eventType = '';
        let data = '';
        let id = '';

        // Parse SSE event
        for (const line of lines) {
          if (line.startsWith('id: ')) {
            id = line.slice(4);
          } else if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ')) {
            data = line.slice(6);
          }
        }

        // Handle different event types
        if (eventType === 'message' && data) {
          aiMessage += data;

          // Create a new array with updated assistant message
          messages = [
            ...messages.slice(0, -1), // All messages except the last
            { role: 'assistant', content: aiMessage }, // Updated assistant message
          ];
        } else if (eventType === 'end' && data === 'done') {
          console.log('Streaming completed');
          break;
        }
      }
    }

    loading = false;
  }
</script>

<div class="flex w-full items-center justify-center mt-15">
  <Card.Root class="w-full max-w-[1400px]">
    <Card.Header>
      <Card.Title>Bird Assistant</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="overflow-y-scroll min-h-[600px] max-h-[600px] mt-10">
        <div class="gap-10 flex flex-col mx-5">
          {#each messages as msg}
            {#if msg.role === 'user'}
              <div
                class="border-1 rounded-md p-4 bg-gray-100 w-60/100 self-end"
              >
                {msg.content}
              </div>
            {:else if msg.role === 'system'}
              <div class="border-1 rounded-md p-4 border-gray-300 w-90/100">
                {@html DOMPurify.sanitize(marked.parse(msg.content))}
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </Card.Content>
    <Card.Footer class="flex-col gap-2 w-full">
      <form on:submit={sendAiRequest} class="w-full">
        <div class="flex my-10 gap-2 items-center">
          <Textarea bind:value={message} />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </Card.Footer>
  </Card.Root>
</div>
