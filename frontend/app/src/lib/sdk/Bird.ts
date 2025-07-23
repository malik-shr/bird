import { AuthService } from './services/AuthService';
import CollectionService from './services/CollectionService';
import RecordService from './services/RecordService';

interface SendOptions {
  method: SendMethod;
  body?: any;
  headers?: { [key: string]: string };
}

export enum SendMethod {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export default class Bird {
  url: string;
  collections: CollectionService;
  auth: AuthService;

  private recordServices: { [key: string]: RecordService } = {};

  constructor(url: string) {
    this.url = url;
    this.collections = new CollectionService(this);
    this.auth = new AuthService(this);
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
