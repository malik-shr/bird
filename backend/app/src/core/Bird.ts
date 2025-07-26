import Elysia from 'elysia';
import { cors } from '@elysiajs/cors';
import { recordApi } from '../apis/record';
import { collectionApi } from '../apis/collection';
import { authApi } from '../apis/auth';
import { predefined_collections } from '../db/tables';
import pc from 'picocolors';

export class Bird extends Elysia {
  startTime = performance.now();

  constructor() {
    super();

    this.use(cors());

    this.setupDatabase();
    this.registerRoutes();
  }

  private setupDatabase() {
    for (const collection of predefined_collections) {
      collection.createTable();
    }

    for (const collection of predefined_collections) {
      collection.insertMetaData();
    }
  }

  private registerRoutes() {
    this.use(recordApi);

    this.use(collectionApi);

    this.use(authApi);
  }

  start() {
    this.listen(3000);
    const endTime = performance.now();
    const totalTime = Math.round(endTime - this.startTime);

    const title = pc.yellow(`${pc.bold('Bird')} v1.0.0`);
    const ready = pc.gray(`ready in`);
    const time = pc.bold(totalTime);

    console.log(` ${title}  ${ready} ${pc.white(time)} ms`);
    console.log(
      `\n ${pc.green('➜')}  ${pc.white(pc.bold('Local:'))}   ${pc.cyan(
        'http://localhost:3000'
      )}`
    );
  }
}
