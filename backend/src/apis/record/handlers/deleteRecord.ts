import { Kysely } from 'kysely';

export async function deleteRecord(
  collection_name: string,
  id: string,
  db: Kysely<DB>
) {
  try {
    await db.deleteFrom(collection_name).where('id', '=', id).execute();
  } catch (e) {
    console.error(e);
  }
  return { message: `Succesfully deleted Record ${id}` };
}
