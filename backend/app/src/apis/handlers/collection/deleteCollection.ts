import { Collections } from '../../../core/store';

export async function deleteCollection(collection_name: string) {
  const collection = Collections.get(collection_name);

  if (collection) {
    collection.delete();
  }

  return {
    message: 'Collection deleted',
    data: collection,
  };
}
