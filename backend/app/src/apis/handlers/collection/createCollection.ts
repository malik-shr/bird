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

export const RuleData = t.Object({
  viewRule: t.Integer(),
  createRule: t.Integer(),
  updateRule: t.Integer(),
  deleteRule: t.Integer(),
});

export const CollectionCreateBody = t.Object({
  table_name: t.String(),
  fields: t.Array(FieldDefinition),
  type: t.String(),
  ruleData: RuleData,
});

export async function createCollection(
  table_name: string,
  fields: Static<typeof FieldDefinition>[],
  type: string,
  ruleData: Static<typeof RuleData>
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

  const collection = new Collection({
    name: table_name,
    type: type,
    fields: collectionFields,
    ruleData: ruleData,
  });
  collection.createTable();
  collection.insertMetaData();

  return { message: 'Record successfully created' };
}
