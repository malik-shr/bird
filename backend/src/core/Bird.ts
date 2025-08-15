import Elysia from 'elysia';
import { cors } from '@elysiajs/cors';
import { recordApi } from './apis/record';
import { collectionApi } from './apis/collection';
import { authApi } from './apis/auth';
import { predefined_collections } from '../db/tables';
import pc from 'picocolors';
import { staticPlugin } from '@elysiajs/static';

export class Bird extends Elysia {
  startTime: number;

  constructor() {
    super();

    this.startTime = performance.now();
    this.use(cors());
    // this.use(
    //   staticPlugin({
    //     assets: '../frontend/dist',
    //     prefix: '/',
    //   })
    // );

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
    const api = new Elysia({ prefix: '/api' });

    api.use(recordApi).use(collectionApi).use(authApi);
    this.use(api);
  }

  start() {
    this.listen(3000);
    const endTime = performance.now();
    const totalTime = Math.round(endTime - this.startTime);

    const title = pc.yellow(`${pc.bold('Bird')} v1.0.0`);
    const ready = pc.gray(`ready in`);
    const time = pc.bold(totalTime);

    console.log(` ${title}  ${ready} ${pc.white(time)} ms`);
    console.log('\n');
    console.log(
      ` ${pc.green('➜')}  ${pc.white(pc.bold('API:'))}   ${pc.cyan(
        'http://localhost:3000/api'
      )}`
    );
    // console.log(
    //   ` ${pc.green('➜')}  ${pc.white(pc.bold('UI: '))}   ${pc.cyan(
    //     'http://localhost:3000'
    //   )}`
    // );
  }
}
