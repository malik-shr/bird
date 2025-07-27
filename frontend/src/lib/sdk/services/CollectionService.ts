import Bird, { SendMethod } from '../Bird';

export type ColumnDefinition = {
  id: string;
  name: string;
  type: string;
  relationCollection?: null | string;

  isPrimaryKey: boolean;
  isHidden: boolean;
  isUnique: boolean;
  isRequired: boolean;
  isSecure: boolean;
  isSystem: boolean;

  options?: {
    value: number;
    text: string;
  }[];
};

export type ColumnRequest = {
  name: string;
  type: string;
  relationCollection?: null | string;

  isPrimaryKey: boolean;
  isHidden: boolean;
  isUnique: boolean;
  isRequired: boolean;
  isSecure: boolean;
  isSystem: boolean;

  options?: {
    value: number;
    text: string;
  }[];
};

export type RuleData = {
  viewRule: number;
  createRule: number;
  updateRule: number;
  deleteRule: number;
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
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return data.collections;
    } catch (e) {
      console.log(e);
    }
  }

  async create(
    table_name: string,
    columns: ColumnRequest[],
    type: string,
    ruleData: RuleData
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
      console.log(e);
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
      console.log(e);
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
      console.log(e);
    }
  }
}
