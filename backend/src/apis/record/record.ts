import Elysia, { getSchemaValidator } from 'elysia';
import { listRecords } from './handlers/listRecords';
import { RecordUpdateBody, updateRecord } from './handlers/updateRecord';
import { getRecord } from './handlers/getRecord';
import { deleteRecord } from './handlers/deleteRecord';
import { createRecord, RecordCreateBody } from './handlers/createRecord';

import { sql } from 'kysely';
import { authMiddleware } from '../auth/middleware/authMiddleware';
import { isValidCollection } from '../../shared/utils';
import { realtimeHandler } from './handlers/realtimeHandler';
import Plugin from '@shared/Plugin';
import { PluginContext } from '@shared/PluginContext';
import { getCollectionBody, transformBody } from './utils';
import { importRecords, importRecordsBody } from './handlers/importRecords';

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
      .derive(async ({ params: { collection_name } }) => {
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
          beforeHandle: (c) => {
            let rule: keyof AuthRuleRow = 'viewRule';

            switch (c.request.method) {
              case 'GET':
                rule = 'viewRule';
                break;
              case 'POST':
                rule = 'createRule';
                break;
              case 'PATCH':
                rule = 'updateRule';
                break;
              case 'DELETE':
                rule = 'deleteRule';
                break;
            }

            this.beforeRecord(ctx, rule);
          },
        },
        (app) =>
          app
            .get('/', (c) =>
              listRecords(
                c.params.collection_name,
                c.query.page,
                c.query.page_size,
                this.ctx.db
              )
            )

            .get('/:id', (c) =>
              getRecord(c.params.collection_name, c.params.id, this.ctx.db)
            )

            .get('/realtime', async (c) =>
              realtimeHandler(c.params.collection_name, this.ctx.db)
            )

            .post(
              '/import',
              (c) =>
                importRecords(c.params.collection_name, c.body, this.ctx.db),
              { body: importRecordsBody }
            )

            .guard(
              {
                beforeHandle: async (c) => {
                  const values = transformBody(
                    c.params.collection_name,
                    c.body,
                    this.ctx.db
                  );
                  const schema = await getCollectionBody(
                    c.params.collection_name,
                    this.ctx.db
                  );

                  if (!schema) {
                    return (c.set.status = 'Unprocessable Content');
                  }

                  const validator = getSchemaValidator(schema, {});

                  if (!validator.Check(values)) {
                    return (c.set.status = 'Unprocessable Content');
                  }
                },
              },
              (app) =>
                app
                  .post(
                    '/',
                    async (c) =>
                      await createRecord(
                        c.body,
                        c.params.collection_name,
                        this.ctx.db
                      ),
                    {
                      body: RecordCreateBody,
                    }
                  )
                  .patch(
                    '/:id',
                    (c) =>
                      updateRecord(
                        c.body,
                        c.params.collection_name,
                        c.params.id,
                        this.ctx.db
                      ),
                    { body: RecordUpdateBody }
                  )
            )

            .delete('/:id', (c) =>
              deleteRecord(c.params.collection_name, c.params.id, this.ctx.db)
            )
      );
  }

  beforeRecord(c: any, key: keyof AuthRuleRow) {
    const userRole = c.user ? c.user.role : 0;

    if (c.authRules) {
      if (c.authRules[key] > userRole) {
        return (c.set.status = 'Unauthorized');
      }
    }
  }
}
