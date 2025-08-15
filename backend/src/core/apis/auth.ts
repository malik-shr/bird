import Elysia from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { login, loginBody } from './handlers/auth/login';
import { me } from './handlers/auth/me';
import { authMiddleware } from './middleware/authMiddleware';

export const authApi = new Elysia({ prefix: '/auth' })
  .use(swagger())
  .use(authMiddleware)

  .post(
    '/login',
    async ({ body: { username, password }, jwt_auth }) =>
      await login(username, password, jwt_auth),
    { body: loginBody }
  )
  .guard(
    {
      beforeHandle({ user, set }) {
        if (!user) return (set.status = 'Unauthorized');
      },
    },
    (app) => app.get('/me', ({ user }) => me(user))
  )
  .get('/private', ({ user }) => {
    return { private: true };
  });
