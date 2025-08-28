import Collection from '@shared/Collection';

export const users = new Collection('users', 'auth')
  .addField({
    name: 'username',
    type: 'String',
    isRequired: true,
    isUnique: true,
  })
  .addField({ name: 'email', type: 'String', isUnique: true })
  .addField({
    name: 'password',
    type: 'String',
    isHidden: true,
    isRequired: true,
  })
  .addField({ name: 'disabled', type: 'Boolean' })
  .addField({ name: 'role', type: 'Integer', isRequired: true })
  .setRuleData({ viewRule: 6, createRule: 0, updateRule: 1, deleteRule: 1 })
  .setRelationAlias('username');
