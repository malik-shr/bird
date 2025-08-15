import { Kysely } from 'kysely';
import { BunSqliteDialect } from 'kysely-bun-worker/normal';
import { DB } from './db.types';

export const db = new Kysely<DB>({
  dialect: new BunSqliteDialect({ url: 'data.db' }),
});
