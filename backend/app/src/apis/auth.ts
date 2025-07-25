import Elysia from 'elysia';
import { jwtConfig } from '../core/jwt.config';
import { swagger } from '@elysiajs/swagger';
import { login, loginBody } from './handlers/auth/login';
import { me } from './handlers/auth/me';

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
    async ({ body: { username, password }, jwt_auth }) =>
      await login(username, password, jwt_auth),
    { body: loginBody }
  )
  .guard(
    {
      beforeHandle({ user, set }: any) {
        if (!user) return (set.status = 'Unauthorized');
      },
    },
    (app) => app.get('/me', ({ user }) => me(user))
  )
  .get('/private', ({ user }) => {
    return { private: true };
  });
