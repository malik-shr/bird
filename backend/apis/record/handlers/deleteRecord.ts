import { Kysely } from 'kysely';
import { rm } from 'node:fs/promises';

export async function deleteRecord(
  collection_name: string,
  id: string,
  db: Kysely<DB>
) {
  try {
    // Remove record directory in storage
    await rm(`bird_data/storage/${collection_name}/${id}`, {
      recursive: true,
      force: true,
    });

    await db.deleteFrom(collection_name).where('id', '=', id).execute();
  } catch (e) {
    console.error(e);
  }
  return { message: `Succesfully deleted Record ${id}` };
}
