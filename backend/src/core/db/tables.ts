import Collection from '@shared/Collection';
import Field from '@shared/Field';

const collectionsMeta = new Collection({
  name: 'collections_meta',
  type: 'system',
  fields: [
    new Field({
      name: 'name',
      type: 'String',
      isRequired: true,
      isUnique: true,
    }),
    new Field({ name: 'type', type: 'String', isRequired: true }),
    new Field({ name: 'description', type: 'String' }),
    new Field({ name: 'requires_auth', type: 'Boolean', isRequired: true }),
    new Field({ name: 'is_system', type: 'Boolean', isRequired: true }),
  ],
  isSystem: true,
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
      isRequired: true,
    }),
    new Field({ name: 'type', type: 'String', isRequired: true }),
    new Field({
      name: 'collection',
      type: 'Relation',
      isRequired: true,
      relationCollection: 'collections_meta',
    }),
    new Field({ name: 'is_secure', type: 'Boolean', isRequired: true }),
    new Field({ name: 'is_system', type: 'Boolean', isRequired: true }),
    new Field({ name: 'is_hidden', type: 'Boolean', isRequired: true }),
    new Field({
      name: 'is_required',
      type: 'Boolean',
      isRequired: true,
    }),
    new Field({
      name: 'is_primary_key',
      type: 'Boolean',
      isRequired: true,
    }),
    new Field({
      name: 'is_unique',
      type: 'Boolean',
      isRequired: true,
    }),
    new Field({
      name: 'relation_collection',
      type: 'String',
    }),
  ],
  isSystem: true,
  ruleData: { viewRule: 0, createRule: 0, updateRule: 0, deleteRule: 0 },
});

const authRules = new Collection({
  name: 'auth_rules',
  type: 'system',
  fields: [
    new Field({
      name: 'collection',
      type: 'Relation',
      isRequired: true,
      relationCollection: 'collections_meta',
    }),
    new Field({ name: 'rule', type: 'String', isRequired: true }),
    new Field({ name: 'permission', type: 'Integer', isRequired: true }),
  ],
  isSystem: true,
  ruleData: { viewRule: 0, createRule: 0, updateRule: 0, deleteRule: 0 },
});

const select_options = new Collection({
  name: 'select_options',
  type: 'system',
  fields: [
    new Field({
      name: 'collection',
      type: 'Relation',
      isRequired: true,
      relationCollection: 'collections_meta',
    }),
    new Field({
      name: 'field',
      type: 'Relation',
      isRequired: true,
      relationCollection: 'fields_meta',
    }),
    new Field({ name: 'text', type: 'String', isRequired: true }),
    new Field({ name: 'value', type: 'Integer', isRequired: true }),
  ],
  isSystem: true,
  ruleData: { viewRule: 0, createRule: 0, updateRule: 0, deleteRule: 0 },
});

export const predefined_collections: Collection[] = [
  collectionsMeta,
  fieldsMeta,
  authRules,
  select_options,
];
