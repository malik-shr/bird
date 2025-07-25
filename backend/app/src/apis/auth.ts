import Elysia, { t } from 'elysia';
import { db } from '../core/db';
import { jwtConfig } from '../core/jwt.config';
import { swagger } from '@elysiajs/swagger';
import cors from '@elysiajs/cors';

class User {
  id: string;
  username: string;
  email: string;
  password: string;
  disabled: boolean;
  role: number;

  constructor(
    id: string,
    username: string,
    email: string,
    password: string,
    disabled: boolean,
    role: number
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.disabled = disabled;
    this.role = role;
  }
}

function getUser(username: string) {
  const query = db
    .query(
      'SELECT id, username, email, password, disabled, role FROM users WHERE username = $username'
    )
    .as(User);
  const user = query.get({ $username: username });

  return user;
}

async function verifyPassword(password: string, hash: string) {
  return await Bun.password.verify(password, hash, 'bcrypt');
}

// Define the schema for the request body, including 'email' and 'password' fields
const loginBody = t.Object({
  username: t.String(),
  password: t.String(),
});

export const authApi = new Elysia({ prefix: '/api/auth' })
  .use(jwtConfig)
  .use(swagger())

  .derive(async ({ headers, jwt_auth }) => {
    const auth = headers['authorization'];

    const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) return { user: null };

    const user = await jwt_auth.verify(token);

    return { user };
  })
  .post(
    '/login',
    async ({ body, error, jwt_auth }) => {
      try {
        const foundUser = getUser(body.username);
        if (!foundUser) throw new Error('User does not exist');

        const isPasswordCorrect = await verifyPassword(
          body.password,
          foundUser.password
        );

        if (!isPasswordCorrect) return error('Bad Request', 'Invalid password');

        const token = await jwt_auth.sign({ id: foundUser.id });

        return { access_token: token };
      } catch (e) {
        console.log(e);
      }
    },
    { body: loginBody }
  )
  .guard(
    {
      beforeHandle({ user, set }: any) {
        if (!user) return (set.status = 'Unauthorized');
      },
    },
    (app) =>
      app.get('/me', ({ user, error }) => {
        if (!user) return error(401, 'Not Authorized');

        return { user };
      })
  )
  .get('/private', ({ user }) => {
    return { private: true };
  });
