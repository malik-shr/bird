import { Bird, SendMethod } from '../Bird';

export default class CollectionService {
  private bird: Bird;
  private baseUrl: string;

  constructor(bird: Bird) {
    this.bird = bird;
    this.baseUrl = `${this.bird.url}/api/collections`;
  }

  async list() {
    try {
      const data = await this.bird.send(this.baseUrl, {
        method: SendMethod.GET,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return data.collections;
    } catch (e) {
      console.error(e);
    }
  }

  async create(
    table_name: string,
    columns: Bird.Field[],
    type: string,
    ruleData: Bird.RuleData
  ) {
    try {
      const data = await this.bird.send(this.baseUrl, {
        method: SendMethod.POST,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          table_name: table_name,
          fields: columns,
          type: type,
          ruleData: ruleData,
        },
      });

      return data.collection;
    } catch (e) {
      console.error(e);
    }
  }

  async columns(collectionName: string) {
    try {
      const data = await this.bird.send(`${this.baseUrl}/${collectionName}`, {
        method: SendMethod.GET,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return data.fields;
    } catch (e) {
      console.error(e);
    }
  }

  async export(collection_name: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${collection_name}/export`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection_name}.csv`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  async trucate(collectionName: string) {
    try {
      const data = await this.bird.send(
        `${this.baseUrl}/${collectionName}/truncate`,
        {
          method: SendMethod.DELETE,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return data.message;
    } catch (e) {
      console.error(e);
    }
  }

  async delete(collectionName: string) {
    try {
      const data = await this.bird.send(`${this.baseUrl}/${collectionName}`, {
        method: SendMethod.DELETE,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return data.message;
    } catch (e) {
      console.error(e);
    }
  }
}
