import { t } from 'elysia';
import { db } from '../../../core/db';

export const RecordUpsertBody = t.Object({
  values: t.Record(t.String(), t.Any()),
});

export async function createRecord(
  values: Record<string, any>,
  collection_name: string
) {
  values['id'] = crypto.randomUUID();

  if (values['password_confirm']) {
    if (values['password'] !== values['password_confirm']) {
      throw new Error('Password and password confirmation do not match');
    }
    delete values['password_confirm'];
  }

  if (values['password']) {
    values['password'] = await Bun.password.hash(values['password'], 'bcrypt');
  }

  const keys = Object.keys(values);
  const placeholders = keys.map(() => '?').join(', ');

  const insertSQL = `INSERT INTO ${collection_name} (${keys.join(
    ', '
  )}) VALUES (${placeholders})`;

  db.run(insertSQL, Object.values(values));

  return { message: 'Successfully created Record' };
}

export async function updateRecord(
  values: Record<string, any>,
  collection_name: string,
  id: string
) {
  const setClause = Object.keys(values)
    .map((key) => `${key} = ?`)
    .join(', ');

  const sql = `UPDATE ${collection_name} SET ${setClause} WHERE id = ?`;
  const valuesStr = [...Object.values(values), id];

  db.run(sql, valuesStr);

  return { message: 'Succesfully updated Record' };
}
