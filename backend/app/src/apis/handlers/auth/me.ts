import { JWTPayloadSpec } from '@elysiajs/jwt';

type me = false | (Record<string, string | number> & JWTPayloadSpec) | null;

export async function me(user: me) {
  if (!user) return new Error('Not Authorized');

  return { user };
}
