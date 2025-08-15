import { db } from '../../../../db/db';

export async function deleteCollection(collection_name: string) {
  try {
    //TODO make delete a transaction

    const collection_id = db
      .selectFrom('collections_meta')
      .select(({ fn }) => fn.max('id').as('max_id'))
      .where('name', '=', collection_name);

    await db.transaction().execute(async (transaction) => {
      // Delete fields
      await transaction
        .deleteFrom('fields_meta')
        .where('collection', '=', collection_id)
        .execute();
      // Delete select_options
      await transaction
        .deleteFrom('select_options')
        .where('collection', '=', collection_id)
        .execute();
      // Delete collection_meta
      await transaction
        .deleteFrom('collections_meta')
        .where('name', '=', collection_name)
        .execute();

      await transaction.schema.dropTable(collection_name).execute();
    });

    return {
      message: 'Collection deleted',
      data: collection_name,
    };
  } catch (e) {
    console.log(e);
  }
}
