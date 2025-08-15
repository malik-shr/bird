import { Kysely } from 'kysely';
import { DB } from './db.types';

export interface PluginContext {
  db: Kysely<DB>;
}
