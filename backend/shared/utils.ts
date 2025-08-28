import { Kysely } from 'kysely';
import { FieldsTable } from './db.types';
import { DataTypeExpression } from 'kysely/dist/cjs/parser/data-type-parser';

/** Get alls fields and validate in memory if fields of this collection exist, to prevent sql injection */
export async function validateUserInput(
  fieldNames: string[],
  collectionName: string,
  db: Kysely<DB>
) {
  const fields = await db.selectFrom('fields_meta').selectAll().execute();

  const collection = await isValidCollection(collectionName, db);

  if (!collection) {
    return false;
  }

  for (const fieldName of fieldNames) {
    const isValid = validateField(fields, fieldName, collection.name);
    if (!isValid) return false;
  }

  return true;
}

/** Get all collections from collection_meta and check if it includes the user provided collection in memory
 * to prevent sql injection
 */
export async function isValidCollection(name: string, db: Kysely<DB>) {
  const collections = await db
    .selectFrom('collections_meta')
    .selectAll()
    .execute();

  return collections.find((collection) => collection.name === name) ?? null;
}

function validateField(
  fields: FieldsTable[],
  fieldName: string,
  collectionName: string
) {
  const fieldExists = fields.map((field) => {
    if (field.name === fieldName && field.collection === collectionName) {
      return field;
    }
  });

  return fieldExists.length > 0;
}

export const FieldTypes: { [key: string]: DataTypeExpression } = {
  String: 'text',
  Integer: 'integer',
  Float: 'float4',
  Boolean: 'boolean',
  Date: 'date',
  Select: 'text',
  Relation: 'text',
  File: 'text',
  Markdown: 'text',
};

export type FieldType = keyof typeof FieldTypes;
