import { Kysely } from 'kysely';

export async function listCollection(db: Kysely<DB>) {
  try {
    const collections = await db
      .selectFrom('collections_meta')
      .select(['id', 'name', 'type', 'is_system'])
      .execute();

    return { collections: collections };
  } catch (e) {
    console.error(e);
  }
}
