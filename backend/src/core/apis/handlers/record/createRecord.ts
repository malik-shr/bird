import { t } from 'elysia';
import { db } from '../../../../db/db';

export const RecordCreateBody = t.Object({
  values: t.Record(t.String(), t.Any()),
});

export async function createRecord(
  values: Record<string, any>,
  collection_name: string
) {
  try {
    const collection = await db
      .selectFrom('collections_meta')
      .selectAll()
      .where('name', '=', collection_name)
      .executeTakeFirstOrThrow();

    if (!collection) {
      throw Error('Collection not found');
    }

    if (collection.type !== 'base') {
      throw Error('Wrong collection type');
    }

    values['id'] = crypto.randomUUID();

    await db.insertInto(collection_name).values(values).execute();

    return { message: 'Successfully created Record' };
  } catch (e) {
    console.log(e);
  }
}
