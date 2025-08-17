import Field from '@shared/Field';
import { Kysely } from 'kysely';

export async function viewCollection(collection_name: string, db: Kysely<DB>) {
  try {
    const collection_id = db
      .selectFrom('collections_meta')
      .select(({ fn }) => fn.max<string>('id').as('max_id'))
      .where('name', '=', collection_name);

    const fieldResponse = await db
      .selectFrom('fields_meta')
      .selectAll()
      .where('collection', '=', collection_id)
      .execute();

    const fields: Field[] = [];

    for (const field of fieldResponse) {
      const optionsResponse = await db
        .selectFrom('select_options')
        .select(['value', 'text'])
        .where('collection', '=', collection_id)
        .where('field', '=', field.id)
        .execute();

      fields.push(
        new Field({
          id: field.id,
          name: field.name,
          type: field.type as any,
          relationCollection: field.relation_collection,
          isPrimaryKey: field.is_primary_key,
          isHidden: field.is_hidden,
          isUnique: field.is_unique,
          isRequired: field.is_required,
          options: optionsResponse,
        })
      );
    }

    return { fields: fields };
  } catch (e) {
    console.error(e);
  }
}
