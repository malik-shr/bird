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
  Reference: t.Literal('TEXT'),
});

const options = t.Object({
  value: t.Integer(),
  text: t.String(),
});

const FieldDefinition = t.Object({
  name: t.String(),
  type: t.KeyOf(fieldTypesSchema),
  primary_key: t.Boolean(),
  required: t.Boolean(),
  references: t.Optional(t.String()),
  options: t.Optional(t.Array(options)),
  secure: t.Boolean(),
  hidden: t.Boolean(),
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
          primary_key: field.primary_key,
          required: field.required,
          references: field.references,
          options: field.options,
          secure: field.secure,
          hidden: field.hidden,
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
        require_auth: newCollection.require_auth,
        system: newCollection.system,
      },
    };
  } catch (e) {
    console.log(e);
  }
}
