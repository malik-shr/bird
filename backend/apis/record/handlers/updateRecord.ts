import { t } from 'elysia';
import { Kysely } from 'kysely';

export const RecordUpdateBody = t.Record(
  t.String(),
  t.Union([t.String(), t.Number(), t.Boolean(), t.File()])
);

export async function updateRecord(
  values: Record<string, any>,
  collection_name: string,
  id: string,
  db: Kysely<DB>
) {
  try {
    const previousData = await db
      .selectFrom(collection_name)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

    const fields = await db
      .selectFrom('fields_meta')
      .selectAll()
      .where(
        'collection',
        '=',
        db
          .selectFrom('collections_meta')
          .select(({ fn }) => fn.max('id').as('max_id'))
          .where('name', '=', collection_name)
      )
      .execute();

    for (const field of fields) {
      const value = values[field.name];
      if (field.type === 'File' && value instanceof File) {
        const previousFile = Bun.file(
          `bird_data/storage/${previousData[field.name]}`
        );

        // Delete previous File
        await previousFile.delete();

        const filePath = `bird_data/storage/${collection_name}/${id}/${value.name}`;
        await Bun.write(filePath, value);

        values[field.name] = `${collection_name}/${id}/${value.name}`;
      }
    }

    await db
      .updateTable(collection_name)
      .set(values)
      .where('id', '=', id)
      .execute();

    return { message: 'Succesfully updated Record' };
  } catch (e) {
    console.error(e);
  }
}
