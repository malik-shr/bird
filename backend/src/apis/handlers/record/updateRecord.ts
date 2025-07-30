import { t } from 'elysia';
import { bb, db } from '../../../core/db';

export const RecordUpdateBody = t.Object({
  values: t.Record(t.String(), t.Any()),
});

export async function updateRecord(
  values: Record<string, any>,
  collection_name: string,
  id: string
) {
  try {
    bb.updateTable(collection_name).set(values).where(['id', '=', id]).run();

    return { message: 'Succesfully updated Record' };
  } catch (e) {
    console.log(e);
  }
}
