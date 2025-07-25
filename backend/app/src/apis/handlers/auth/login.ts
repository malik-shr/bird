import { t } from 'elysia';
import { db } from '../../../core/db';
import { UserRow } from '../../../db/models';
import { JWTPayloadSpec } from '@elysiajs/jwt';

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
    const foundUser = getUser(username);
    if (!foundUser) throw new Error('User does not exist');

    const isPasswordCorrect = await verifyPassword(
      password,
      foundUser.password
    );

    if (!isPasswordCorrect) throw new Error('Invalid password');

    const token = await jwt_auth.sign({ id: foundUser.id });

    return { access_token: token };
  } catch (e) {
    console.log(e);
  }
}

function getUser(username: string) {
  const query = db
    .query(
      'SELECT id, username, email, password, disabled, role FROM users WHERE username = $username'
    )
    .as(UserRow);
  const user = query.get({ $username: username });

  return user;
}

async function verifyPassword(password: string, hash: string) {
  return await Bun.password.verify(password, hash, 'bcrypt');
}
