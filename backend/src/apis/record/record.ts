import Elysia from 'elysia';
import { listRecords } from './handlers/listRecords';
import { RecordUpdateBody, updateRecord } from './handlers/updateRecord';
import { getRecord } from './handlers/getRecord';
import { deleteRecord } from './handlers/deleteRecord';
import { createRecord, RecordCreateBody } from './handlers/createRecord';

import { sql } from 'kysely';
import { authMiddleware } from '../auth/middleware/authMiddleware';
import { isValidCollection, validateUserInput } from './utils';
import { realtimeHandler } from './handlers/realtimeHandler';
import Plugin from '@shared/Plugin';
import { PluginContext } from '@shared/PluginContext';

interface AuthRuleRow {
  viewRule: number;
  createRule: number;
  updateRule: number;
  deleteRule: number;
}

export default class RecordApi implements Plugin {
  app;
  ctx: PluginContext;

  constructor(ctx: PluginContext) {
    this.ctx = ctx;
    this.app = new Elysia({ prefix: '/collections/:collection_name/records' });

    this.app
      .use(authMiddleware(this.ctx.db))
      .derive(async ({ params: { collection_name }, set }) => {
        /** Validate collection_name otherways set request status forbidden*/
        if (!isValidCollection(collection_name, this.ctx.db)) {
          return { rules: null };
        }

        const rules = await this.ctx.db
          .selectFrom('auth_rules as rules')
          .innerJoin('collections_meta as c', 'rules.collection', 'c.id')
          .select([
            sql<number>`MAX(CASE WHEN rules.rule = 'viewRule' THEN rules.permission END)`.as(
              'viewRule'
            ),
            sql<number>`MAX(CASE WHEN rules.rule = 'createRule' THEN rules.permission END)`.as(
              'createRule'
            ),
            sql<number>`MAX(CASE WHEN rules.rule = 'updateRule' THEN rules.permission END)`.as(
              'updateRule'
            ),
            sql<number>`MAX(CASE WHEN rules.rule = 'deleteRule' THEN rules.permission END)`.as(
              'deleteRule'
            ),
          ])
          .where('c.name', '=', collection_name)
          .executeTakeFirstOrThrow();

        return { rules };
      })

      .guard(
        {
          beforeHandle: (ctx) => {
            this.beforeRecord(ctx, 'viewRule');
          },
        },
        (app) =>
          app.get('/', (ctx) =>
            listRecords(ctx.params.collection_name, this.ctx.db)
          )
      )

      .guard(
        {
          beforeHandle: (ctx) => {
            this.beforeRecord(ctx, 'viewRule');
          },
        },
        (app) =>
          app.get('/realtime', async (ctx) =>
            realtimeHandler(ctx.params.collection_name, this.ctx.db)
          )
      )

      .guard(
        {
          beforeHandle: (ctx: any) => {
            this.beforeRecord(ctx, 'createRule');
          },
        },
        (app) =>
          app.post(
            '/',
            async ({ body, params: { collection_name } }) =>
              await createRecord(body, collection_name, this.ctx.db),
            {
              body: RecordCreateBody,
            }
          )
      )

      .guard(
        {
          beforeHandle: (ctx) => this.beforeRecord(ctx, 'viewRule'),
        },
        (app) =>
          app.get('/:id', ({ params: { collection_name, id } }) =>
            getRecord(collection_name, id, this.ctx.db)
          )
      )

      .guard(
        {
          beforeHandle: (ctx) => this.beforeRecord(ctx, 'updateRule'),
        },
        (app) =>
          app.patch(
            '/:id',
            (ctx) =>
              updateRecord(
                ctx.body,
                ctx.params.collection_name,
                ctx.params.id,
                this.ctx.db
              ),
            { body: RecordUpdateBody }
          )
      )

      .guard(
        {
          beforeHandle: (ctx) => this.beforeRecord(ctx, 'deleteRule'),
        },
        (app) =>
          app.delete('/:id', (ctx) =>
            deleteRecord(ctx.params.collection_name, ctx.params.id, this.ctx.db)
          )
      );
  }

  beforeRecord(ctx: any, key: keyof AuthRuleRow) {
    const userRole = ctx.user ? ctx.user.role : 0;

    if (ctx.authRules) {
      if (ctx.authRules[key] > userRole) {
        return (ctx.set.status = 'Unauthorized');
      }
    }
  }
}
