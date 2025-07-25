import { db } from '../../../core/db';

export async function listCollection() {
  try {
    const query = db.query(
      'SELECT id, name, type, require_auth, system FROM collections_meta ORDER BY system'
    );
    const collections = query.all();

    return { collections: collections };
  } catch (e) {
    console.log(e);
  }
}
