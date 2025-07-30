import { bb, db } from '../../../core/db';

export async function deleteRecord(collection_name: string, id: string) {
  try {
    bb.deleteFrom(collection_name).where(['id', '=', id]).run();
  } catch (e) {
    console.log(e);
  }
  return { message: 'Succesfully deleted Record' };
}
