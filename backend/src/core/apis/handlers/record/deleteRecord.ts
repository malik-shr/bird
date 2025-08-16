import { db } from '@core/db/db';

export async function deleteRecord(collection_name: string, id: string) {
  try {
    await db.deleteFrom(collection_name).where('id', '=', id).execute();
  } catch (e) {
    console.error(e);
  }
  return { message: `Succesfully deleted Record ${id}` };
}
