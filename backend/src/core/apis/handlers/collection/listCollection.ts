import { db } from '@core/db/db';

export async function listCollection() {
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
