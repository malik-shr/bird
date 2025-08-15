import { sql } from 'kysely';
import { db } from '../../../../db/db';

export async function listRecords(collection_name: string) {
  try {
    let records = await db.selectFrom(collection_name).selectAll().execute();

    return { records: records };
  } catch (e) {
    console.log(e);
  }
}
