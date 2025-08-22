import { bird } from '$lib/lib';
import type Bird from '$lib/sdk';

interface MessageState {
  messages: Bird.Message[];
}

export class MessageStateClass implements MessageState {
  messages: Bird.Message[] = $state([]);

  async sendAiRequest(e: Event, message: string) {
    if (!message.trim()) return;

    this.messages = [...this.messages, { role: 'user', content: message }];
    const userMessage = message;

    this.messages = [...this.messages, { role: 'assistant', content: '' }];
    let aiMessage = '';

    try {
      await bird.ai.prompt(
        userMessage,

        (data: string) => {
          aiMessage += data;

          this.messages = [...this.messages];
          this.messages[this.messages.length - 1] = {
            role: 'assistant',
            content: aiMessage,
          };
        }
      );
    } catch (error) {
      console.error('Failed to send AI request:', error);
    }
  }
}
