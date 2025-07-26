import { db } from '../../../core/db';
import { FieldRow, OptionRow } from '../../../db/models';

export async function listRecords(collection_name: string) {
  try {
    const fieldsQuery = db
      .query(
        `SELECT * FROM fields_meta WHERE collection = (SELECT MAX(id) FROM collections_meta WHERE name = $collection_name) AND hidden = 0`
      )
      .as(FieldRow);

    const fieldResponse = fieldsQuery.all({
      $collection_name: collection_name,
    });

    const selectFields = [];
    const joins = [];
    let joinCounter = 0;

    for (const field of fieldResponse) {
      const optionsQuery = db
        .query(
          `
        SELECT value, text
        FROM select_options
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

      if (field.references) {
        const joinAlias = `ref_${joinCounter++}`;
        const referencedCollection = field.references;

        joins.push(
          `LEFT JOIN \`${referencedCollection}\` AS ${joinAlias} ON \`${collection_name}\`.\`${field.name}\` = ${joinAlias}.\`id\``
        );
        selectFields.push(`${joinAlias}.\`name\` AS \`${field.name}\``);
      } else if (optionsResponse.length > 0) {
        const optionsAlias = `opt_${joinCounter++}`;
        joins.push(
          `LEFT JOIN select_options AS ${optionsAlias} ON \`${collection_name}\`.\`${field.name}\` = ${optionsAlias}.\`value\` AND ${optionsAlias}.\`field\` = "${field.id}"`
        );
        selectFields.push(`${optionsAlias}.\`text\` AS \`${field.name}\``);
      } else {
        selectFields.push(`\`${collection_name}\`.\`${field.name}\``);
      }
    }

    let query = `SELECT ${selectFields.join(', ')} FROM \`${collection_name}\``;
    if (joins.length > 0) {
      query += ` ${joins.join(' ')}`;
    }
    const records = db.query(query).all();

    return { records: records };
  } catch (e) {
    console.log(e);
  }
}
