<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { bird } from '$lib/lib';
  import type Bird from '$lib/sdk';
  import { onMount, tick } from 'svelte';
  import * as Card from '$lib/components/ui/card/index.js';
  import DOMPurify from 'isomorphic-dompurify';
  import { marked } from 'marked';
  import Input from '$lib/components/ui/input/input.svelte';

  let messages: Bird.Message[] = $state([]);
  let message = $state('');
  let bottomElement: HTMLDivElement;

  async function scrollToBottom() {
    await tick(); // Wait for DOM to update
    if (bottomElement) {
      bottomElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  $effect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  });

  onMount(async () => {
    const data = await bird.collection('messages').getList(0, 100);
    messages = data?.records;
  });

  async function sendAiRequest(event: Event) {
    event.preventDefault();
    if (!message.trim()) return;

    messages = [...messages, { role: 'user', content: message }];
    const userMessage = message;
    message = '';

    messages = [...messages, { role: 'assistant', content: '' }];
    let aiMessage = '';

    try {
      await bird.ai.prompt(
        userMessage,

        (data: string) => {
          aiMessage += data;

          messages = [...messages];
          messages[messages.length - 1] = {
            role: 'assistant',
            content: aiMessage,
          };
        }
      );
    } catch (error) {
      console.error('Failed to send AI request:', error);
    }
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
            {:else if msg.role === 'assistant'}
              <div class="border-1 rounded-md p-4 border-gray-300 w-90/100">
                {@html DOMPurify.sanitize(
                  marked.parse(msg.content, { async: false })
                )}
              </div>
            {/if}
          {/each}
          <div bind:this={bottomElement}></div>
        </div>
      </div>
    </Card.Content>
    <Card.Footer class="flex-col gap-2 w-full">
      <form onsubmit={sendAiRequest} class="w-full">
        <div class="flex my-10 gap-2 items-center">
          <Input bind:value={message} />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </Card.Footer>
  </Card.Root>
</div>
