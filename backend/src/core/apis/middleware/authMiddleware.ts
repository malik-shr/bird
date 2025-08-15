import Elysia from 'elysia';
import { jwtConfig } from './jwt.config';
import { getUser } from '../../utils';

export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .use(jwtConfig)
  .derive({ as: 'global' }, async ({ headers, jwt_auth }) => {
    const auth = headers['authorization'];
    const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) return { user: null };

    const userObj = await jwt_auth.verify(token);

    if (userObj) {
      const user = await getUser(String(userObj.username));
      return { user };
    }

    return { user: null };
  });
