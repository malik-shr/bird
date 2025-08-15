import { db } from '../../../../db/db';

export async function getRecord(collection_name: string, id: string) {
  const record = await db
    .selectFrom(collection_name)
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow();

  return { record: record };
}
