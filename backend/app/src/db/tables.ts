import { RuleData } from '../apis/handlers/collection/createCollection';
import Collection from '../core/Collection';
import Field from '../core/Field';

const users = new Collection({
  name: 'users',
  type: 'auth',
  fields: [
    new Field({
      name: 'username',
      type: 'String',
      required: true,
      unique: true,
    }),
    new Field({ name: 'email', type: 'String', unique: true }),
    new Field({
      name: 'password',
      type: 'String',
      secure: true,
      hidden: true,
      required: true,
    }),
    new Field({ name: 'disabled', type: 'Boolean' }),
    new Field({ name: 'role', type: 'Integer', required: true }),
  ],
  ruleData: { viewRule: 0, createRule: 0, updateRule: 0, deleteRule: 0 },
});

const collectionsMeta = new Collection({
  name: 'collections_meta',
  type: 'system',
  fields: [
    new Field({
      name: 'name',
      type: 'String',
      required: true,
    }),
    new Field({ name: 'type', type: 'String', required: true }),
    new Field({ name: 'description', type: 'String' }),
    new Field({ name: 'require_auth', type: 'Boolean', required: true }),
    new Field({ name: 'system', type: 'Boolean', required: true }),
  ],
  system: true,
  ruleData: {
    viewRule: 0,
    createRule: 0,
    updateRule: 0,
    deleteRule: 0,
  },
});

const fieldsMeta = new Collection({
  name: 'fields_meta',
  type: 'system',
  fields: [
    new Field({
      name: 'name',
      type: 'String',
      required: true,
    }),
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
    new Field({
      name: 'unique',
      type: 'Boolean',
      required: true,
    }),
  ],
  system: true,
  ruleData: { viewRule: 0, createRule: 0, updateRule: 0, deleteRule: 0 },
});

const authRules = new Collection({
  name: 'auth_rules',
  type: 'system',
  fields: [
    new Field({
      name: 'collection',
      type: 'String',
      required: true,
    }),
    new Field({ name: 'rule', type: 'String', required: true }),
    new Field({ name: 'permission', type: 'Integer', required: true }),
  ],
  system: true,
  ruleData: { viewRule: 0, createRule: 0, updateRule: 0, deleteRule: 0 },
});

export const predefined_collections: Collection[] = [
  users,
  collectionsMeta,
  fieldsMeta,
  authRules,
];
