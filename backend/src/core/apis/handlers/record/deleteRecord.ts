import { db } from '../../../../db/db';

export async function deleteRecord(collection_name: string, id: string) {
  try {
    await db.deleteFrom(collection_name).where('id', '=', id).execute();
  } catch (e) {
    console.log(e);
  }
  return { message: `Succesfully deleted Record ${id}` };
}
