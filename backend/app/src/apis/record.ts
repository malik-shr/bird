import Elysia, { t } from 'elysia';
import { db } from '../core/db';

const RecordUpsertBody = t.Object({
  values: t.Record(t.String(), t.Any()),
});

export const recordApi = new Elysia({
  prefix: '/api/collections/:collection_name/records',
})
  .get('/', ({ params }) => {
    const query = db.query(`SELECT * FROM ${params.collection_name}`);

    const records = query.all();

    return { records: records };
  })
  .post(
    '/',
    async ({ body, params }) => {
      body.values['id'] = crypto.randomUUID();
      const keys = Object.keys(body.values);
      const placeholders = keys.map(() => '?').join(', ');

      if (body.values['password']) {
        body.values['password'] = await Bun.password.hash(
          body.values['password'],
          'bcrypt'
        );
      }

      const insertSQL = `INSERT INTO ${params.collection_name} (${keys.join(
        ', '
      )}) VALUES (${placeholders})`;

      db.run(insertSQL, Object.values(body.values));

      return { message: 'Successfully created Record' };
    },
    {
      body: RecordUpsertBody,
    }
  )
  .get('/:id', ({ params }) => {
    const query = db.query(
      `SELECT * FROM ${params.collection_name} WHERE id=$id`
    );
    const record = query.get({
      $id: params.id,
    });

    return { record: record };
  })
  .patch(
    '/:id',
    ({ body, params }) => {
      const setClause = Object.keys(body.values)
        .map((key) => `${key} = ?`)
        .join(', ');

      const sql = `UPDATE ${params.collection_name} SET ${setClause} WHERE id = ?`;
      const values = [...Object.values(body.values), params.id];

      db.run(sql, values);

      return { message: 'Succesfully updated Record' };
    },
    { body: RecordUpsertBody }
  )
  .delete('/:id', ({ params }) => {
    try {
      const query = db.query(
        `DELETE FROM ${params.collection_name} WHERE id = $id`
      );

      query.run({
        $id: params.id,
      });
    } catch (e) {
      console.log(e);
    }
    return { message: 'Succesfully deleted Record' };
  });
