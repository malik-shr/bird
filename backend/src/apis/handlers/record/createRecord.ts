import { t } from 'elysia';
import { bb, db } from '../../../core/db';

export const RecordCreateBody = t.Object({
  values: t.Record(t.String(), t.Any()),
});

export async function createRecord(
  values: Record<string, any>,
  collection_name: string
) {
  try {
    // Clone and strip out password_confirm
    const { confirmPassword, ...filteredValues } = values;

    filteredValues['id'] = crypto.randomUUID();

    if (confirmPassword) {
      if (filteredValues['password'] !== confirmPassword) {
        throw new Error('Password and password confirmation do not match');
      }
    }

    if (filteredValues['password']) {
      filteredValues['password'] = await Bun.password.hash(
        filteredValues['password'],
        'bcrypt'
      );
    }

    bb.insertInto(collection_name).values(filteredValues).run();

    return { message: 'Successfully created Record' };
  } catch (e) {
    console.log(e);
  }
}
