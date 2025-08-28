import { UserTable } from '@shared/db.types';

export async function me(user: UserTable | null) {
  if (!user) throw Error('Not Authorized');

  return { user: user };
}
