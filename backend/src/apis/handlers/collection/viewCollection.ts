import { db } from '../../../core/db';
import Field from '../../../core/Field';
import { FieldRow, OptionRow } from '../../../db/models';

export async function viewCollection(collection_name: string) {
  try {
    const fieldsQuery = db
      .query(
        'SELECT * FROM fields_meta WHERE collection = (SELECT MAX(id) FROM collections_meta WHERE name = $collection_name)'
      )
      .as(FieldRow);

    const fieldResponse = fieldsQuery.all({
      $collection_name: collection_name,
    });

    const fields: Field[] = [];

    for (const field of fieldResponse) {
      const optionsQuery = db
        .query(
          `
          SELECT value, text 
          FROM 
            select_options 
          WHERE 
            collection = (SELECT MAX(id) FROM collections_meta WHERE name = $collection_name) 
            AND field = $field_id
          `
        )
        .as(OptionRow);

      const optionsResponse = optionsQuery.all({
        $collection_name: collection_name,
        $field_id: field.id,
      });
      fields.push(
        new Field({
          id: field.id,
          name: field.name,
          type: field.type,
          relationCollection: field.relation_collection,
          isPrimaryKey: field.is_primary_key,
          isHidden: field.is_hidden,
          isUnique: field.is_unique,
          isRequired: field.is_required,
          isSecure: field.is_secure,
          isSystem: field.is_system,
          options: optionsResponse,
        })
      );
    }

    return { fields: fields };
  } catch (e) {
    console.log(e);
  }
}
