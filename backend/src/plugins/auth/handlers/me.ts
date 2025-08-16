import { UserTable } from '../db.types';

export async function me(user: UserTable | null) {
  if (!user) return new Error('Not Authorized');

  return { user: user };
}
