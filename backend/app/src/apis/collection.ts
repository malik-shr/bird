import { db } from '../core/db';
import Field from '../core/Field';
import { Collections } from '../core/store';
import Elysia, { t } from 'elysia';

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

const CollectionCreateBody = t.Object({
  table_name: t.String(),
  fields: t.Array(FieldDefinition),
  type: t.String(),
});

export const collectionApi = new Elysia({ prefix: '/api/collections' })
  .get('/', async () => {
    try {
      const query = db.query(
        'SELECT id, name, type, require_auth, system FROM collections_meta ORDER BY system'
      );
      const collections = query.all();

      return { collections: collections };
    } catch (e) {
      console.log(e);
    }
  })
  .post(
    '/',
    async ({ body }) => {
      // Example: You can now use the body to create a collection
      const fields: Field[] = [];

      for (const field of body.fields) {
        fields.push(
          new Field({
            name: field.name,
            type: field.type,
            primary_key: field.primary_key,
            required: !field.nullable,
          })
        );
      }
    },
    { body: CollectionCreateBody }
  )
  .get('/:collection_name', ({ params }) => {
    const collection = Collections.get(params.collection_name);

    if (collection) {
      return { columns: collection.fields };
    }
  })
  .delete('/:collection_name', ({ params }) => {
    const collection = Collections.get(params.collection_name);

    if (collection) {
      collection.delete();
    }

    return {
      message: 'Collection deleted',
      data: collection,
    };
  });
