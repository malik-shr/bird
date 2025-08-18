import type { Bird } from '../Bird';

export default class RealtimeService {
  private bird: Bird;
  private baseUrl: string;

  constructor(bird: Bird) {
    this.bird = bird;
    this.baseUrl = `${this.bird.url}/api/realtime`;
  }

  subscribe(url: string, onMessage: (event: any) => void): () => void {
    const eventSource = new EventSource(url);

    // Handle named events
    eventSource.addEventListener('update_collection', (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch {
        onMessage(event);
      }
    });

    eventSource.addEventListener('auth_update', (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch {
        onMessage(event);
      }
    });

    eventSource.addEventListener('auth-error', (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch {
        onMessage(event);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE error', error);
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }
}
