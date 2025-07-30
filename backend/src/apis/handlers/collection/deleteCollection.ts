import { db } from '../../../core/db';

export async function deleteCollection(collection_name: string) {
  try {
    const deleteFields = db.prepare(
      'DELETE FROM fields_meta WHERE collection = (SELECT MAX(id) FROM collections_meta WHERE name = $collection_name)'
    );

    const deleteOptions = db.prepare(
      'DELETE FROM select_options WHERE collection = (SELECT MAX(id) FROM collections_meta WHERE name = $collection_name)'
    );
    const deleteCollectionMeta = db.prepare(
      'DELETE FROM collections_meta WHERE name = $collection_name'
    );

    deleteFields.run({ $collection_name: collection_name });
    deleteOptions.run({ $collection_name: collection_name });
    deleteCollectionMeta.run({ $collection_name: collection_name });
    db.exec(`DROP TABLE ${collection_name}`);

    return {
      message: 'Collection deleted',
      data: collection_name,
    };
  } catch (e) {
    console.log(e);
  }
}
