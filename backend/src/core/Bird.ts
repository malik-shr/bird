import Elysia from 'elysia';
import { cors } from '@elysiajs/cors';
import pc from 'picocolors';
import { staticPlugin } from '@elysiajs/static';
import { PluginContext } from '@shared/PluginContext';
import Plugin from '@shared/Plugin';
import AuthApi from '../apis/auth/auth';
import RecordApi from '../apis/record/record';
import CollectionApi from '../apis/collection/collection';
import { Kysely } from 'kysely';
import { BunSqliteDialect } from 'kysely-bun-worker/normal';
import FileApi from '../apis/file/file';
import AiApi from '@apis/ai/ai';

export class Bird extends Elysia {
  startTime: number;
  ctx: PluginContext;
  plugins: Plugin[] = [];
  db: Kysely<DB>;

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

    this.db = new Kysely<DB>({
      dialect: new BunSqliteDialect({ url: 'bird_data/data.db' }),
    });

    this.ctx = {
      db: this.db,
    };

    this.plugins.push(
      new CollectionApi(this.ctx),
      new RecordApi(this.ctx),
      new AuthApi(this.ctx),
      new FileApi(this.ctx),
      new AiApi(this.ctx)
    );

    this.setupDatabase();
    this.registerRoutes();
  }

  private async setupDatabase() {
    for (const plugin of this.plugins) {
      if (plugin.collections) {
        for (const collection of plugin.collections) {
          await collection.createTable(this.db);
        }

        for (const collection of plugin.collections) {
          await collection.insertMetaData(this.db);
        }
      }
    }
  }

  private registerRoutes() {
    const api = new Elysia({ prefix: '/api' });

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
