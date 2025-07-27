import { db } from '../../../core/db';

export async function listCollection() {
  try {
    const query = db.query(
      'SELECT id, name, type, requires_auth, is_system FROM collections_meta ORDER BY is_system'
    );
    const collections = query.all();

    return { collections: collections };
  } catch (e) {
    console.log(e);
  }
}
