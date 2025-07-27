import { db } from '../core/db';
import { UserRow } from '../db/models';

export function getUser(username: string | number) {
  const query = db
    .query(
      'SELECT id, username, email, password, disabled, role FROM users WHERE username = $username'
    )
    .as(UserRow);
  const user = query.get({ username: username });

  return user;
}
