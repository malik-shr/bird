import { db } from '../../../core/db';

export async function deleteCollection(collection_name: string) {
  const deleteStatement = db.query(`
      DELETE FROM collections_meta AS c WHERE c.name = $name;
      DELETE FROM fields_meta AS f WHERE f.collection = (SELECT MAX(id) FROM collections_meta WHERE name = $name);
      
      DROP TABLE ${collection_name};
    `);

  deleteStatement.run({ $name: collection_name });

  return {
    message: 'Collection deleted',
    data: collection_name,
  };
}
