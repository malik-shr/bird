import { Kysely } from 'kysely';

export interface PluginContext {
  db: Kysely<DB>;
}
