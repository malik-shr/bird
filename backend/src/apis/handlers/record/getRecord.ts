import { bb, db } from '../../../core/db';

export async function getRecord(collection_name: string, id: string) {
  const record = bb.select().from(collection_name).where(['id', '=', id]).get();

  return { record: record };
}
