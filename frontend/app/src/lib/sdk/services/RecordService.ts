import Bird, { SendMethod } from '../Bird';

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
      });

      return data.record;
    } catch (e) {
      console.log(e);
    }
  }

  async getList(id: string, limit = 100, offset = 0, fields = [], filter = []) {
    try {
      const data = await this.bird.send(this.baseUrl, {
        method: SendMethod.GET,
      });

      return data.records;
    } catch (e) {
      console.log(e);
    }
  }

  async create(values = []) {
    try {
      const data = await this.bird.send(this.baseUrl, {
        method: SendMethod.POST,
        body: {
          values: values,
        },
      });

      return data.message;
    } catch (e) {
      console.log(e);
    }
  }

  async update(id: string, values = []) {
    try {
      const data = await this.bird.send(`${this.baseUrl}/${id}`, {
        method: SendMethod.PATCH,
        body: {
          values: values,
        },
      });

      return data.message;
    } catch (e) {
      console.log(e);
    }
  }

  async delete(id: string) {
    try {
      const data = await this.bird.send(`${this.baseUrl}/${id}`, {
        method: SendMethod.DELETE,
      });

      return data.message;
    } catch (e) {
      console.log(e);
    }
  }
}
