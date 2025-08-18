import swagger from '@elysiajs/swagger';
import Plugin from '@shared/Plugin';
import { PluginContext } from '@shared/PluginContext';
import { authMiddleware } from './middleware/authMiddleware';
import { login, loginBody } from './handlers/login';
import { me } from './handlers/me';
import { users } from './tables';
import { register, registerBody } from './handlers/register';
import Elysia, { sse } from 'elysia';
import Collection from '@shared/Collection';
import { realtTimeHandler } from './handlers/realtimeHandler';

export default class AuthApi implements Plugin {
  app;
  ctx: PluginContext;
  collections: Collection[];

  constructor(ctx: PluginContext) {
    this.ctx = ctx;

    this.collections = [users];
    this.app = new Elysia({ prefix: '/auth' });

    this.app
      .use(swagger())
      .use(authMiddleware(this.ctx.db))

      .post(
        '/login',
        async ({ body: { username, password }, jwt_auth }) =>
          await login(username, password, jwt_auth, this.ctx.db),
        { body: loginBody }
      )
      .post(
        '/register',
        async ({ body: { username, email, password, confirmPassword } }) =>
          await register(
            username,
            email,
            password,
            confirmPassword,
            this.ctx.db
          ),
        { body: registerBody }
      )
      .guard(
        {
          beforeHandle({ user, set }) {
            if (!user) return (set.status = 'Unauthorized');
          },
        },
        (app) => app.get('/me', ({ user }) => me(user))
      )
      .get('/realtime', async ({ user }) => realtTimeHandler(user))
      .get('/private', ({ user }) => {
        return { private: true };
      });
  }
}
