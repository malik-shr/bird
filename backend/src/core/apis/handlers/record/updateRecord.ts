import { t } from 'elysia';
import { db } from '@core/db/db';

export const RecordUpdateBody = t.Object({
  values: t.Record(t.String(), t.Any()),
});

export async function updateRecord(
  values: Record<string, any>,
  collection_name: string,
  id: string
) {
  try {
    await db
      .updateTable(collection_name)
      .set(values)
      .where('id', '=', id)
      .execute();

    return { message: 'Succesfully updated Record' };
  } catch (e) {
    console.log(e);
  }
}
