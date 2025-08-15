import swagger from '@elysiajs/swagger';
import Plugin from '@shared/Plugin';
import { PluginContext } from '@shared/PluginContext';
import { authMiddleware } from './middleware/authMiddleware';
import { login, loginBody } from './handlers/login';
import { me } from './handlers/me';
import { users } from './tables';

export default class AuthApi extends Plugin {
  constructor(ctx: PluginContext) {
    super(ctx, 'auth');

    this.collections = [users];

    this.app
      .use(swagger())
      .use(authMiddleware(this.ctx.db))

      .post(
        '/login',
        async ({ body: { username, password }, jwt_auth }) =>
          await login(username, password, jwt_auth, this.ctx.db),
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
  }
}
