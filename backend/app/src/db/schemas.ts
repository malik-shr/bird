import Collection from '../core/Collection';
import Field from '../core/Field';

const users = new Collection('users', 'auth', '');

const collectionsMeta = new Collection(
  'collections_meta',
  'system',
  '',
  [
    new Field({ name: 'name', type: 'String', required: true }),
    new Field({ name: 'type', type: 'String', required: true }),
    new Field({ name: 'description', type: 'String' }),
    new Field({ name: 'require_auth', type: 'Boolean', required: true }),
    new Field({ name: 'system', type: 'Boolean', required: true }),
  ],
  true
);

const fieldsMeta = new Collection(
  'fields_meta',
  'system',
  '',
  [
    new Field({ name: 'name', type: 'String', required: true }),
    new Field({ name: 'type', type: 'String', required: true }),
    new Field({
      name: 'collection',
      type: 'String',
      required: true,
    }),
    new Field({ name: 'secure', type: 'Boolean', required: true }),
    new Field({ name: 'system', type: 'Boolean', required: true }),
    new Field({ name: 'hidden', type: 'Boolean', required: true }),
    new Field({
      name: 'required',
      type: 'Boolean',
      required: true,
    }),
    new Field({
      name: 'primary_key',
      type: 'Boolean',
      required: true,
    }),
  ],
  true
);

export const predefined_collections: Collection[] = [
  users,
  collectionsMeta,
  fieldsMeta,
];
