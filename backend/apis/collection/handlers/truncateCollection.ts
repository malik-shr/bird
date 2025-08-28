import { Kysely } from 'kysely';

export default async function truncateCollection(
  collection_name: string,
  db: Kysely<DB>
) {
  try {
    await db.deleteFrom(collection_name).execute();

    return {
      message: `Successfully deleted all record from ${collection_name}`,
    };
  } catch (e) {
    console.error(e);
  }
}
