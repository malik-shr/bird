import { t } from 'elysia';
import { db } from '../../../core/db';

export const RecordUpdateBody = t.Object({
  values: t.Record(t.String(), t.Any()),
});

export async function updateRecord(
  values: Record<string, any>,
  collection_name: string,
  id: string
) {
  try {
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');

    const sql = `UPDATE ${collection_name} SET ${setClause} WHERE id = ?`;
    const valuesStr = [...Object.values(values), id];

    db.run(sql, valuesStr);

    return { message: 'Succesfully updated Record' };
  } catch (e) {
    console.log(e);
  }
}
