import { sse } from 'elysia';
import { me } from './me';
import { UserTable } from '@shared/db.types';

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
