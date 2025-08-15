import { Kysely } from 'kysely';

export async function getUser(username: string, db: Kysely<DB>) {
  const user = await db
    .selectFrom('users')
    .selectAll()
    .where('username', '=', username)
    .executeTakeFirstOrThrow();

  return user;
}
