import Collection from '@shared/Collection';
import Field from '@shared/Field';

export const users = new Collection({
  name: 'users',
  type: 'auth',
  fields: [
    new Field({
      name: 'username',
      type: 'String',
      isRequired: true,
      isUnique: true,
    }),
    new Field({ name: 'email', type: 'String', isUnique: true }),
    new Field({
      name: 'password',
      type: 'String',
      isSecure: true,
      isHidden: true,
      isRequired: true,
    }),
    new Field({ name: 'disabled', type: 'Boolean' }),
    new Field({ name: 'role', type: 'Integer', isRequired: true }),
  ],
  ruleData: { viewRule: 0, createRule: 0, updateRule: 0, deleteRule: 0 },
});
