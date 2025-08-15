import { db } from '@core/db/db';

export async function listCollection() {
  try {
    const collections = await db
      .selectFrom('collections_meta')
      .select(['id', 'name', 'type', 'require_auth', 'is_system'])
      .execute();

    return { collections: collections };
  } catch (e) {
    console.log(e);
  }
}
