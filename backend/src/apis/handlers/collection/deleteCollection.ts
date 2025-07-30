import { bb } from '../../../core/db';

export async function deleteCollection(collection_name: string) {
  try {
    //TODO make delete a transaction

    // Delete fields
    bb.raw(
      'DELETE FROM fields_meta WHERE collection = (SELECT MAX(id) FROM collections_meta WHERE name = $collection_name)',
      { $collection_name: collection_name }
    ).run();

    // Delete select_options
    bb.raw(
      'DELETE FROM select_options WHERE collection = (SELECT MAX(id) FROM collections_meta WHERE name = $collection_name)',
      { $collection_name: collection_name }
    ).run();

    // Delete collection_meta
    bb.raw('DELETE FROM collections_meta WHERE name = $collection_name', {
      $collection_name: collection_name,
    }).run();

    // Drop Table
    bb.raw(`DROP TABLE "${collection_name}"`).run();

    return {
      message: 'Collection deleted',
      data: collection_name,
    };
  } catch (e) {
    console.log(e);
  }
}
