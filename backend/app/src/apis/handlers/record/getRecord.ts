import { db } from '../../../core/db';

export async function getRecord(collection_name: string, id: string) {
  const query = db.query(`SELECT * FROM ${collection_name} WHERE id=$id`);
  const record = query.get({
    $id: id,
  });

  return { record: record };
}
