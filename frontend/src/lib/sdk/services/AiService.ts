import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { Bird } from '../Bird';

export default class AiService {
  bird: Bird;
  baseUrl: string;

  constructor(bird: Bird) {
    this.bird = bird;
    this.baseUrl = `${this.bird.url}/api/ai`;
  }

  async prompt(
    message: string,
    onMessage: (data: string) => void,
    onComplete?: () => void,
    onError?: (error: any) => void
  ) {
    const token = localStorage.getItem('token');

    try {
      await fetchEventSource(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: message }),

        async onopen(response) {
          if (response.ok && response.status === 200) {
            // console.log('Connection established successfully');
          } else if (
            response.status >= 400 &&
            response.status < 500 &&
            response.status !== 429
          ) {
            // Client error (4xx) - don't retry
            throw new Error(`Client error: ${response.status}`);
          } else {
            // Server error or rate limit - will retry
            throw new Error(`Server error: ${response.status}`);
          }
        },

        onmessage(event) {
          if (event.event === 'message' && event.data) {
            onMessage(event.data);
          } else if (event.event === 'end' && event.data === 'done') {
            if (onComplete) onComplete();
          }
        },

        onerror(error) {
          console.error('EventSource error:', error);
          if (onError) onError(error);
          throw error;
        },
      });
    } catch (error) {
      console.error('Failed to establish connection:', error);
      if (onError) onError(error);
      throw error;
    }
  }
}
