import { JWTPayloadSpec } from '@elysiajs/jwt';
import { getUser } from '../../../utils/utils';

type me = false | (Record<string, string | number> & JWTPayloadSpec) | null;

export async function me(user: me) {
  if (!user) return new Error('Not Authorized');

  const activeUser = getUser(user.username);

  return { activeUser };
}
