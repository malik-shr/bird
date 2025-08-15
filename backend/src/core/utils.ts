import { db } from '../db/db';
import { FieldsTable } from '../db/db.types';

export async function getUser(username: string) {
  const user = await db
    .selectFrom('users')
    .selectAll()
    .where('username', '=', username)
    .executeTakeFirstOrThrow();

  return user;
}

/** Get alls fields and validate in memory if fields of this collection exist, to prevent sql injection */
export async function validateUserInput(
  fieldNames: string[],
  collectionName: string
) {
  const fields = await db.selectFrom('fields_meta').selectAll().execute();

  const collection = await isValidCollection(collectionName);

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
export async function isValidCollection(name: string) {
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
