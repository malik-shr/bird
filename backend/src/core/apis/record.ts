import Elysia, { HTTPHeaders, StatusMap } from 'elysia';
import { listRecords } from './handlers/record/listRecords';
import { RecordUpdateBody, updateRecord } from './handlers/record/updateRecord';
import { getRecord } from './handlers/record/getRecord';
import { deleteRecord } from './handlers/record/deleteRecord';
import { db } from '../../db/db';
import { ElysiaCookie } from 'elysia/dist/cookies';
import { createRecord, RecordCreateBody } from './handlers/record/createRecord';
import { isValidCollection, validateUserInput } from '../utils';
import { authMiddleware } from './middleware/authMiddleware';
import { sql } from 'kysely';
import { UserTable } from '../../db/db.types';

interface AuthRuleRow {
  viewRule: number;
  createRule: number;
  updateRule: number;
  deleteRule: number;
}

export const recordApi = new Elysia({
  prefix: '/collections/:collection_name/records',
})
  .use(authMiddleware)
  .derive(async ({ params: { collection_name }, set }) => {
    /** Validate collection_name otherways set request status forbidden*/

    const rules = await db
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
      beforeHandle({ user, rules, set, params: { collection_name } }) {
        if (!isValidCollection(collection_name)) {
          return (set.status = 'Forbidden');
        }

        beforeRecord(user, rules, 'viewRule', set);
      },
    },
    (app) =>
      app.get('/', ({ params: { collection_name } }) =>
        listRecords(collection_name)
      )
  )

  .guard(
    {
      beforeHandle({
        user,
        rules,
        set,
        body: { values },
        params: { collection_name },
      }: any) {
        if (!isValidCollection(collection_name)) {
          return (set.status = 'Forbidden');
        }
        if (!validateUserInput(Object.keys(values), collection_name)) {
          return (set.status = 'Forbidden');
        }
        beforeRecord(user, rules, 'createRule', set);
      },
    },
    (app) =>
      app.post(
        '/',
        async ({ body: { values }, params: { collection_name } }) =>
          await createRecord(values, collection_name),
        {
          body: RecordCreateBody,
        }
      )
  )

  .guard(
    {
      beforeHandle({ user, rules, set, params: { collection_name } }) {
        if (!isValidCollection(collection_name)) {
          return (set.status = 'Forbidden');
        }
        beforeRecord(user, rules, 'viewRule', set);
      },
    },
    (app) =>
      app.get('/:id', ({ params: { collection_name, id } }) =>
        getRecord(collection_name, id)
      )
  )

  .guard(
    {
      beforeHandle({ user, rules, set, params: { collection_name } }) {
        if (!isValidCollection(collection_name)) {
          return (set.status = 'Forbidden');
        }
        beforeRecord(user, rules, 'updateRule', set);
      },
    },
    (app) =>
      app.patch(
        '/:id',
        ({ body: { values }, params: { collection_name, id } }) =>
          updateRecord(values, collection_name, id),
        { body: RecordUpdateBody }
      )
  )

  .guard(
    {
      beforeHandle({ user, rules, set, params: { collection_name } }) {
        if (!isValidCollection(collection_name)) {
          return (set.status = 'Forbidden');
        }
        beforeRecord(user, rules, 'deleteRule', set);
      },
    },
    (app) =>
      app.delete('/:id', ({ params: { collection_name, id } }) =>
        deleteRecord(collection_name, id)
      )
  );

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
