import { bb } from '../core/db';
import { UserRow } from '../db/models';

export function getUser(username: string) {
  const user = bb
    .select('id', 'username', 'email', 'password')
    .from('users')
    .where(['username', '=', username])
    .as(UserRow)
    .get();

  return user;
}
