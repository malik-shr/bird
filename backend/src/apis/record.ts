import Elysia, { HTTPHeaders, StatusMap } from 'elysia';
import { listRecords } from './handlers/record/listRecords';
import { RecordUpdateBody, updateRecord } from './handlers/record/updateRecord';
import { getRecord } from './handlers/record/getRecord';
import { deleteRecord } from './handlers/record/deleteRecord';
import { bb } from '../core/db';
import { AuthRuleRow, UserRow } from '../db/models';
import { authMiddleware } from '../middleware/auhtMiddleware';
import { ElysiaCookie } from 'elysia/dist/cookies';
import { createRecord, RecordCreateBody } from './handlers/record/createRecord';

export const recordApi = new Elysia({
  prefix: '/collections/:collection_name/records',
})
  .use(authMiddleware)
  .derive(async ({ params: { collection_name }, user }) => {
    const rules = bb
      .raw(
        `
    SELECT
      MAX(CASE WHEN rule = 'viewRule' THEN rules.permission END) AS viewRule,
      MAX(CASE WHEN rule = 'createRule' THEN rules.permission END) AS createRule,
      MAX(CASE WHEN rule = 'updateRule' THEN rules.permission END) AS updateRule,
      MAX(CASE WHEN rule = 'deleteRule' THEN rules.permission END) AS deleteRule
    FROM 
      auth_rules AS rules 
      JOIN collections_meta AS c
        ON rules.collection = c.id
    WHERE c.name = $collection_name;
    `,
        { collection_name: collection_name }
      )
      .as(AuthRuleRow)
      .get();

    return { rules };
  })

  .guard(
    {
      beforeHandle({ user, rules, set }) {
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
      beforeHandle({ user, rules, set }) {
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
      beforeHandle({ user, rules, set }: any) {
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
      beforeHandle({ user, rules, set }: any) {
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
      beforeHandle({ user, rules, set }) {
        beforeRecord(user, rules, 'deleteRule', set);
      },
    },
    (app) =>
      app.delete('/:id', ({ params: { collection_name, id } }) =>
        deleteRecord(collection_name, id)
      )
  );

function beforeRecord(
  user: UserRow | null,
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
