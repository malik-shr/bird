import { Kysely } from 'kysely';

export async function getRecord(
  collection_name: string,
  id: string,
  db: Kysely<DB>
) {
  try {
    const record = await db
      .selectFrom(collection_name)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

    return { record: record };
  } catch (e) {
    console.error(e);
  }
}
