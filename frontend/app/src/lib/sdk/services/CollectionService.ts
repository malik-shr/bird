import Bird, { SendMethod } from '../Bird';

type ColumnDefinition = {
  name: string;
  type: string;
  nullable?: boolean;
  primary_key: boolean;
};

export default class CollectionService {
  bird: Bird;
  baseUrl: string;

  constructor(bird: Bird) {
    this.bird = bird;
    this.baseUrl = `${this.bird.url}/api/collections`;
  }

  async list() {
    try {
      const data = await this.bird.send(this.baseUrl, {
        method: SendMethod.GET,
      });

      return data.collections;
    } catch (e) {
      console.log(e);
    }
  }

  async create(table_name: string, columns: ColumnDefinition[], type: string) {
    try {
      const data = await this.bird.send(this.baseUrl, {
        method: SendMethod.POST,
        body: {
          table_name: table_name,
          fields: columns,
          type: type,
        },
      });

      return data.collection;
    } catch (e) {
      console.log(e);
    }
  }

  async columns(collectionName: string) {
    try {
      const data = await this.bird.send(`${this.baseUrl}/${collectionName}`, {
        method: SendMethod.GET,
      });

      return data.columns;
    } catch (e) {
      console.log(e);
    }
  }

  async delete(collectionName: string) {
    try {
      const data = await this.bird.send(`${this.baseUrl}/${collectionName}`, {
        method: SendMethod.DELETE,
      });

      return data.message;
    } catch (e) {
      console.log(e);
    }
  }
}
