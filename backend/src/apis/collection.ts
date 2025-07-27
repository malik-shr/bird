import Elysia from 'elysia';
import { listCollection } from './handlers/collection/listCollection';
import {
  CollectionCreateBody,
  createCollection,
} from './handlers/collection/createCollection';
import { viewCollection } from './handlers/collection/viewCollection';
import { deleteCollection } from './handlers/collection/deleteCollection';

export const collectionApi = new Elysia({ prefix: '/collections' })
  .get('/', async () => listCollection())

  .post(
    '/',
    async ({ body: { table_name, fields, type, ruleData } }) =>
      await createCollection(table_name, fields, type, ruleData),
    {
      body: CollectionCreateBody,
    }
  )

  .get('/:collection_name', ({ params: { collection_name } }) =>
    viewCollection(collection_name)
  )

  .delete('/:collection_name', ({ params: { collection_name } }) =>
    deleteCollection(collection_name)
  );
