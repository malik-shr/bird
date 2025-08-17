import Elysia, { HTTPHeaders, StatusMap } from 'elysia';
import { listRecords } from './handlers/listRecords';
import { RecordUpdateBody, updateRecord } from './handlers/updateRecord';
import { getRecord } from './handlers/getRecord';
import { deleteRecord } from './handlers/deleteRecord';
import { ElysiaCookie } from 'elysia/dist/cookies';
import { createRecord, RecordCreateBody } from './handlers/createRecord';

import { sql } from 'kysely';
import { UserTable } from '../auth/db.types';
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
          beforeHandle: ({ user, rules, set, params: { collection_name } }) => {
            if (!isValidCollection(collection_name, this.ctx.db)) {
              return (set.status = 'Forbidden');
            }

            beforeRecord(user, rules, 'viewRule', set);
          },
        },
        (app) =>
          app.get('/', ({ params: { collection_name } }) =>
            listRecords(collection_name, this.ctx.db)
          )
      )

      .guard(
        {
          beforeHandle: ({ user, rules, set, params: { collection_name } }) => {
            if (!isValidCollection(collection_name, this.ctx.db)) {
              return (set.status = 'Forbidden');
            }

            beforeRecord(user, rules, 'viewRule', set);
          },
        },
        (app) =>
          app.get('/realtime', async ({ params: { collection_name } }) =>
            realtimeHandler(collection_name, this.ctx.db)
          )
      )

      .guard(
        {
          beforeHandle: ({
            user,
            rules,
            set,
            body: { values },
            params: { collection_name },
          }: any) => {
            if (!isValidCollection(collection_name, this.ctx.db)) {
              return (set.status = 'Forbidden');
            }
            if (
              !validateUserInput(
                Object.keys(values),
                collection_name,
                this.ctx.db
              )
            ) {
              return (set.status = 'Forbidden');
            }
            beforeRecord(user, rules, 'createRule', set);
          },
        },
        (app) =>
          app.post(
            '/',
            async ({ body: { values }, params: { collection_name } }) =>
              await createRecord(values, collection_name, this.ctx.db),
            {
              body: RecordCreateBody,
            }
          )
      )

      .guard(
        {
          beforeHandle: ({ user, rules, set, params: { collection_name } }) => {
            if (!isValidCollection(collection_name, this.ctx.db)) {
              return (set.status = 'Forbidden');
            }
            beforeRecord(user, rules, 'viewRule', set);
          },
        },
        (app) =>
          app.get('/:id', ({ params: { collection_name, id } }) =>
            getRecord(collection_name, id, this.ctx.db)
          )
      )

      .guard(
        {
          beforeHandle: ({ user, rules, set, params: { collection_name } }) => {
            if (!isValidCollection(collection_name, this.ctx.db)) {
              return (set.status = 'Forbidden');
            }
            beforeRecord(user, rules, 'updateRule', set);
          },
        },
        (app) =>
          app.patch(
            '/:id',
            ({ body: { values }, params: { collection_name, id } }) =>
              updateRecord(values, collection_name, id, this.ctx.db),
            { body: RecordUpdateBody }
          )
      )

      .guard(
        {
          beforeHandle: ({ user, rules, set, params: { collection_name } }) => {
            if (!isValidCollection(collection_name, this.ctx.db)) {
              return (set.status = 'Forbidden');
            }
            beforeRecord(user, rules, 'deleteRule', set);
          },
        },
        (app) =>
          app.delete('/:id', ({ params: { collection_name, id } }) =>
            deleteRecord(collection_name, id, this.ctx.db)
          )
      );
  }
}

function beforeRecord(
  user: UserTable | null,
  authRules: AuthRuleRow | null,
  key: keyof AuthRuleRow,
  set: {
    headers: HTTPHeaders;
    status?: number | keyof StatusMap;
    redirect?: string;
    cookie?: Record<string, ElysiaCookie>;
  }
) {
  const userRole = user ? user.role : 0;

  if (authRules) {
    if (authRules[key] > userRole) {
      return (set.status = 'Unauthorized');
    }
  }
}
