import Field from '../../../core/Field';
import { Static, t } from 'elysia';
import Collection from '../../../core/Collection';

const fieldTypesSchema = t.Object({
  String: t.Literal('TEXT'),
  Integer: t.Literal('INTEGER'),
  Float: t.Literal('FLOAT'),
  Boolean: t.Literal('BOOLEAN'),
});

const FieldDefinition = t.Object({
  name: t.String(),
  type: t.KeyOf(fieldTypesSchema),
  nullable: t.Boolean(),
  primary_key: t.Boolean(),
});

export const CollectionCreateBody = t.Object({
  table_name: t.String(),
  fields: t.Array(FieldDefinition),
  type: t.String(),
});

export async function createCollection(
  table_name: string,
  fields: Static<typeof FieldDefinition>[],
  type: string
) {
  const collectionFields: Field[] = [];

  for (const field of fields) {
    collectionFields.push(
      new Field({
        name: field.name,
        type: field.type,
        primary_key: field.primary_key,
        required: !field.nullable,
      })
    );
  }

  const collection = new Collection(table_name, type, '', collectionFields);
  collection.createTable();
  collection.insertMetaData();

  return { message: 'Record successfully created' };
}
