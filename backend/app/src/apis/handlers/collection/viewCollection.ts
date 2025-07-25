import { Collections } from '../../../core/store';

export async function viewCollection(collection_name: string) {
  const collection = Collections.get(collection_name);

  if (collection) {
    return { fields: collection.fields };
  }
}
