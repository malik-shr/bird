import { Kysely } from 'kysely';
import { listRecords } from './listRecords';
import { sse } from 'elysia';

export async function* realtimeHandler(
  collection_name: string,
  db: Kysely<DB>
) {
  while (true) {
    const data = await listRecords(collection_name, db);

    yield sse({ event: 'update_collection', data: data });

    await Bun.sleep(5000);
  }
}
