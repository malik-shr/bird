import { bb, db } from '../../../core/db';

export async function listCollection() {
  try {
    const collections = bb
      .select('id', 'name', 'type', 'requires_auth', 'is_system')
      .from('collections_meta')
      .all();

    return { collections: collections };
  } catch (e) {
    console.log(e);
  }
}
