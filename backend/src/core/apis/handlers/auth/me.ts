import { UserRow } from '../../../../db/models';

export async function me(user: UserRow | null) {
  if (!user) return new Error('Not Authorized');

  return { user: user };
}
