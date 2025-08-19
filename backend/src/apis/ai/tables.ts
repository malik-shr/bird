import Collection from '@shared/Collection';

export const messages = new Collection('messages', 'base')
  .addField({ name: 'role', type: 'String', isRequired: true })
  .addField({ name: 'content', type: 'String', isRequired: true })
  .addField({
    name: 'user',
    type: 'Relation',
    isRequired: true,
    relationCollection: 'users',
  })
  .setRelationAlias('content');
