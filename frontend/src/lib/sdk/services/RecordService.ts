import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Bird, SendMethod } from '../Bird';

export default class RecordService {
  private bird: Bird;
  private collectionName: string;
  private baseUrl: string;

  constructor(bird: Bird, collectionName: string) {
    this.bird = bird;
    this.collectionName = collectionName;
    this.baseUrl = `${this.bird.url}/api/collections/${this.collectionName}/records`;
  }

  async getOne(id: string) {
    try {
      const data = await this.bird.send(`${this.baseUrl}/${id}`, {
        method: SendMethod.GET,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return data.record;
    } catch (e) {
      console.error(e);
    }
  }

  async getList(
    id: string = '',
    limit = 100,
    offset = 0,
    fields = [],
    filter = []
  ) {
    try {
      const data = await this.bird.send(this.baseUrl, {
        method: SendMethod.GET,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return data.records;
    } catch (e) {
      console.error(e);
    }
  }

  async create(values = new FormData()) {
    try {
      const data = await this.bird.send(this.baseUrl, {
        method: SendMethod.POST,
        body: values,
      });

      return data.message;
    } catch (e) {
      console.error(e);
    }
  }

  async update(id: string, values = new FormData()) {
    try {
      const data = await this.bird.send(`${this.baseUrl}/${id}`, {
        method: SendMethod.PATCH,
        body: values,
      });

      return data.message;
    } catch (e) {
      console.error(e);
    }
  }

  async delete(id: string) {
    try {
      const data = await this.bird.send(`${this.baseUrl}/${id}`, {
        method: SendMethod.DELETE,
      });

      return data.message;
    } catch (e) {
      console.error(e);
    }
  }

  async subscribe(onMessage: (event: MessageEvent) => void) {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    await fetchEventSource(`${this.baseUrl}/realtime`, {
      onmessage(msg) {
        const parsed = JSON.parse(msg.data);
        onMessage(parsed);
      },
    });
  }
}
