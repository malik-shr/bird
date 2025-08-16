import Elysia from 'elysia';
import { cors } from '@elysiajs/cors';
import { recordApi } from './apis/record';
import { collectionApi } from './apis/collection';
import pc from 'picocolors';
import { staticPlugin } from '@elysiajs/static';
import { predefined_collections } from './db/tables';
import { PluginContext } from '@shared/PluginContext';
import { db } from './db/db';
import Plugin from '@shared/Plugin';
import AuthApi from '@plugins/auth/api';

export class Bird extends Elysia {
  startTime: number;
  ctx: PluginContext;
  plugins: Plugin[] = [];

  constructor() {
    super();

    this.startTime = performance.now();
    this.use(cors());
    this.use(
      staticPlugin({
        assets: '../frontend/build',
        prefix: '/',
      })
    );

    this.ctx = {
      db: db,
    };

    this.plugins.push(new AuthApi(this.ctx));

    this.setupDatabase();
    this.registerRoutes();
  }

  private async setupDatabase() {
    for (const collection of predefined_collections) {
      await collection.createTable();
    }

    for (const collection of predefined_collections) {
      await collection.insertMetaData();
    }

    for (const plugin of this.plugins) {
      for (const collection of plugin.collections) {
        await collection.createTable();
        await collection.insertMetaData();
      }
    }
  }

  private registerRoutes() {
    const api = new Elysia({ prefix: '/api' });

    api.use(recordApi).use(collectionApi);

    for (const plugin of this.plugins) {
      api.use(plugin.app);
    }

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
    console.log(
      ` ${pc.green('➜')}  ${pc.white(pc.bold('UI: '))}   ${pc.cyan(
        'http://localhost:3000'
      )}`
    );
  }
}
