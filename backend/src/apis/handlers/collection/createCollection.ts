import Field from '../../../core/Field';
import { Static, t } from 'elysia';
import Collection from '../../../core/Collection';

const fieldTypesSchema = t.Object({
  String: t.Literal('TEXT'),
  Integer: t.Literal('INTEGER'),
  Float: t.Literal('FLOAT'),
  Boolean: t.Literal('BOOLEAN'),
  Date: t.Literal('DATE'),
  Select: t.Literal('TEXT'),
  Relation: t.Literal('TEXT'),
});

const options = t.Object({
  value: t.Integer(),
  text: t.String(),
});

const FieldDefinition = t.Object({
  name: t.String(),
  type: t.KeyOf(fieldTypesSchema),
  relationCollection: t.Optional(t.String()),
  isPrimaryKey: t.Boolean(),
  isRequired: t.Boolean(),
  isSecure: t.Boolean(),
  isHidden: t.Boolean(),
  options: t.Optional(t.Array(options)),
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
  try {
    const collectionFields: Field[] = [];

    for (const field of fields) {
      collectionFields.push(
        new Field({
          name: field.name,
          type: field.type,
          isPrimaryKey: field.isPrimaryKey,
          isRequired: field.isRequired,
          relationCollection: field.relationCollection,
          options: field.options,
          isSecure: field.isSecure,
          isHidden: field.isHidden,
        })
      );
    }

    const newCollection = new Collection({
      name: table_name,
      type: type,
      fields: collectionFields,
      ruleData: ruleData,
    });
    newCollection.createTable();
    newCollection.insertMetaData();

    return {
      collection: {
        id: newCollection.id,
        name: newCollection.name,
        type: newCollection.type,
        requires_auth: newCollection.requiresAuth,
        system: newCollection.isSystem,
      },
    };
  } catch (e) {
    console.log(e);
  }
}
