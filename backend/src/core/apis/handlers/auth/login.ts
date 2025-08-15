import { t } from 'elysia';
import { JWTPayloadSpec } from '@elysiajs/jwt';
import { getUser } from '../../../utils';

export const loginBody = t.Object({
  username: t.String(),
  password: t.String(),
});

interface JWTAuth {
  sign(data: Record<string, string | number> & JWTPayloadSpec): Promise<string>;
  verify(
    jwt?: string
  ): Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
}

export async function login(
  username: string,
  password: string,
  jwt_auth: JWTAuth
) {
  try {
    const foundUser = await getUser(username);
    if (!foundUser) throw new Error('User does not exist');

    const isPasswordCorrect = await verifyPassword(
      password,
      foundUser.password
    );

    if (!isPasswordCorrect) throw new Error('Invalid password');

    const token = await jwt_auth.sign({ username: foundUser.username });

    return { access_token: token };
  } catch (e) {
    console.log(e);
  }
}

async function verifyPassword(password: string, hash: string) {
  return await Bun.password.verify(password, hash, 'bcrypt');
}
