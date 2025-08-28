import { Static, t } from 'elysia';
import { Kysely } from 'kysely';

export const RecordCreateBody = t.Record(
  t.String(),
  t.Union([t.String(), t.Number(), t.Boolean(), t.File()])
);

export async function createRecord(
  values: Static<typeof RecordCreateBody>,
  collection_name: string,
  db: Kysely<DB>
) {
  try {
    const collection = await db
      .selectFrom('collections_meta')
      .selectAll()
      .where('name', '=', collection_name)
      .executeTakeFirstOrThrow();

    if (collection.type !== 'base') {
      throw Error('Wrong collection type');
    }

    const id = crypto.randomUUID();

    const fields = await db
      .selectFrom('fields_meta')
      .selectAll()
      .where('collection', '=', collection.id)
      .execute();

    // Validate file types through fields_meta
    for (const field of fields) {
      const value = values[field.name];
      if (field.type === 'File' && value instanceof File) {
        const filePath = `bird_data/storage/${collection_name}/${id}/${value.name}`;
        await Bun.write(filePath, value);

        values[field.name] = `${collection_name}/${id}/${value.name}`;
      }
    }

    values['id'] = id;
    await db.insertInto(collection_name).values(values).execute();

    return { message: 'Successfully created Record' };
  } catch (e) {
    console.error(e);
  }
}
