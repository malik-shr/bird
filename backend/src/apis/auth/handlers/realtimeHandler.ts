import { sse } from 'elysia';
import { UserTable } from '../db.types';
import { me } from './me';

export async function* realtTimeHandler(user: UserTable | null) {
  while (true) {
    try {
      const data = await me(user);

      yield sse({
        event: 'auth_update',
        data: data,
      });
    } catch (err) {
      yield sse({
        event: 'auth-error',
        data: { user: null },
      });
    }

    await Bun.sleep(5000);
  }
}
