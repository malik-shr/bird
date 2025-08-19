import Elysia from 'elysia';
import {
  CollectionCreateBody,
  createCollection,
} from './handlers/createCollection';
import { listCollection } from './handlers/listCollection';
import { viewCollection } from './handlers/viewCollection';
import { deleteCollection } from './handlers/deleteCollection';
import Plugin from '@shared/Plugin';
import { PluginContext } from '@shared/PluginContext';
import {
  authRules,
  collectionsMeta,
  fieldsMeta,
  select_options,
} from './tables';
import Collection from '@shared/Collection';
import { exportCollection } from './handlers/exportCollection';

export default class CollectionApi implements Plugin {
  app;
  ctx: PluginContext;
  collections: Collection[];

  constructor(ctx: PluginContext) {
    this.ctx = ctx;
    this.app = new Elysia({ prefix: '/collections' });

    this.collections = [collectionsMeta, fieldsMeta, authRules, select_options];

    this.app
      .get('/', async () => listCollection(this.ctx.db))

      .post(
        '/',
        async ({ body: { table_name, fields, type, ruleData } }) =>
          await createCollection(
            table_name,
            fields,
            type,
            ruleData,
            this.ctx.db
          ),
        {
          body: CollectionCreateBody,
        }
      )

      .get('/:collection_name', async ({ params: { collection_name } }) =>
        viewCollection(collection_name, this.ctx.db)
      )

      .delete('/:collection_name', async ({ params: { collection_name } }) =>
        deleteCollection(collection_name, this.ctx.db)
      )

      .get(
        '/:collection_name/export',
        async ({ params: { collection_name } }) =>
          exportCollection(collection_name, this.ctx.db)
      );
  }
}
