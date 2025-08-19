import { AuthService } from './services/AuthService';
import CollectionService from './services/CollectionService';
import FileService from './services/FileService';
import RecordService from './services/RecordService';

export const SendMethod = {
  GET: 'GET',
  POST: 'POST',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

interface SendOptions {
  method: (typeof SendMethod)[keyof typeof SendMethod];
  body?: any;
  headers?: { [key: string]: string };
}

export class Bird {
  url: string;
  collections: CollectionService;
  auth: AuthService;
  file: FileService;

  private recordServices: { [key: string]: RecordService } = {};

  constructor(url: string) {
    this.url = url;
    this.collections = new CollectionService(this);
    this.auth = new AuthService(this);
    this.file = new FileService(this);
  }

  collection(collectionName: string) {
    if (!this.recordServices[collectionName]) {
      this.recordServices[collectionName] = new RecordService(
        this,
        collectionName
      );
    }

    return this.recordServices[collectionName];
  }

  async send(path: string, options: SendOptions) {
    try {
      let body = undefined;

      if (options.body) {
        const contentType = options.headers?.['Content-Type'] || '';

        if (contentType.includes('application/json')) {
          body = JSON.stringify(options.body);
        } else {
          body = options.body; // Assume already stringified (e.g., form data)
        }
      }

      const response = await fetch(path, {
        method: options.method,
        headers: {
          ...options.headers,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Request failed: ${e.message}`);
      }
      throw new Error('Request failed: Unknown error');
    }
  }
}

export namespace Bird {
  export type Record = { [key: string]: any };
  export type RuleData = {
    viewRule: number;
    createRule: number;
    updateRule: number;
    deleteRule: number;
  };

  export type Collection = {
    id: string;
    name: string;
    type: string;
    description: string;
    is_system: boolean;
  };

  export type User = {
    id: string;
    username: string;
    email: string;
    role: number;
  };

  export type Field = {
    name: string;
    type: string;
    relationCollection?: null | string;

    isPrimaryKey: boolean;
    isHidden: boolean;
    isUnique: boolean;
    isRequired: boolean;

    options?: {
      value: number;
      text: string;
    }[];
  };

  export type Message = {
    role: string;
    content: string;
  };
}
