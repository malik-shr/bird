import Collection from '@shared/Collection';

export const collectionsMeta = new Collection('collections_meta', 'system')
  .addField({ name: 'name', type: 'String', isRequired: true, isUnique: true })
  .addField({ name: 'type', type: 'String', isRequired: true })
  .addField({ name: 'description', type: 'String' })
  .addField({ name: 'is_system', type: 'Boolean', isRequired: true })
  .setSystem(true);

export const fieldsMeta = new Collection('fields_meta', 'system')
  .addField({
    name: 'name',
    type: 'String',
    isRequired: true,
  })
  .addField({ name: 'type', type: 'String', isRequired: true })
  .addField({
    name: 'collection',
    type: 'Relation',
    isRequired: true,
    relationCollection: 'collections_meta',
  })
  .addField({ name: 'is_hidden', type: 'Boolean', isRequired: true })
  .addField({
    name: 'is_required',
    type: 'Boolean',
    isRequired: true,
  })
  .addField({
    name: 'is_primary_key',
    type: 'Boolean',
    isRequired: true,
  })
  .addField({
    name: 'is_unique',
    type: 'Boolean',
    isRequired: true,
  })
  .addField({
    name: 'relation_collection',
    type: 'String',
  })
  .setSystem(true);

export const authRules = new Collection('auth_rules', 'system')
  .addField({
    name: 'collection',
    type: 'Relation',
    isRequired: true,
    relationCollection: 'collections_meta',
  })
  .addField({ name: 'rule', type: 'String', isRequired: true })
  .addField({ name: 'permission', type: 'Integer', isRequired: true })
  .setSystem(true);

export const select_options = new Collection('select_options', 'system')
  .addField({
    name: 'collection',
    type: 'Relation',
    isRequired: true,
    relationCollection: 'collections_meta',
  })
  .addField({
    name: 'field',
    type: 'Relation',
    isRequired: true,
    relationCollection: 'fields_meta',
  })
  .addField({ name: 'text', type: 'String', isRequired: true })
  .addField({ name: 'value', type: 'Integer', isRequired: true })
  .setSystem(true);
