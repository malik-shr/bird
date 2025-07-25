import { db } from '../../../core/db';

export async function deleteRecord(collection_name: string, id: string) {
  try {
    const query = db.query(`DELETE FROM ${collection_name} WHERE id = $id`);

    query.run({
      $id: id,
    });
  } catch (e) {
    console.log(e);
  }
  return { message: 'Succesfully deleted Record' };
}
