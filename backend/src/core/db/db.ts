import { Kysely } from 'kysely';
import { BunSqliteDialect } from 'kysely-bun-worker/normal';

export const db = new Kysely<DB>({
  dialect: new BunSqliteDialect({ url: 'data.db' }),
});
