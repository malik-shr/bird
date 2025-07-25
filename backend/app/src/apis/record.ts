import Elysia from 'elysia';
import { listRecords } from './handlers/record/listRecords';
import {
  createRecord,
  RecordUpsertBody,
  updateRecord,
} from './handlers/record/upsertRecord';
import { getRecord } from './handlers/record/getRecord';
import { deleteRecord } from './handlers/record/deleteRecord';

export const recordApi = new Elysia({
  prefix: '/api/collections/:collection_name/records',
})
  .get('/', ({ params: { collection_name } }) => listRecords(collection_name))

  .post(
    '/',
    async ({ body: { values }, params: { collection_name } }) =>
      await createRecord(values, collection_name),
    {
      body: RecordUpsertBody,
    }
  )

  .get('/:id', ({ params: { collection_name, id } }) =>
    getRecord(collection_name, id)
  )

  .patch(
    '/:id',
    ({ body: { values }, params: { collection_name, id } }) =>
      updateRecord(values, collection_name, id),
    { body: RecordUpsertBody }
  )

  .delete('/:id', ({ params: { collection_name, id } }) =>
    deleteRecord(collection_name, id)
  );
