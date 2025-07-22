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
    this.auth = new AuthService();
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
      const response = await fetch(path, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers, // Allow additional headers to be passed
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (e) {
      // Properly handle different error types
      if (e instanceof Error) {
        throw new Error(`Request failed: ${e.message}`);
      }
      throw new Error('Request failed: Unknown error');
    }
  }
}
