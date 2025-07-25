import { db } from '../../../core/db';

export async function listRecords(collection_name: string) {
  const query = db.query(`SELECT * FROM ${collection_name}`);

  const records = query.all();

  return { records: records };
}
