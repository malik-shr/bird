import { Kysely } from 'kysely';

export async function listRecords(
  collection_name: string,
  page: string,
  page_size: string,
  db: Kysely<DB>
) {
  try {
    const MAX_PAGE_SIZE = 100;

    const parsedPage = parseInt(page);
    const parsedPageSize = parseInt(page_size);

    if (parsedPageSize > MAX_PAGE_SIZE) {
      return Error('The maximum page size is 100');
    }

    const selectFields: string[] = [];
    let joinCounter = 0;
    const collection_id = db
      .selectFrom('collections_meta as c')
      .select(({ fn }) => fn.max('id').as('max_id'))
      .where('name', '=', collection_name);

    let query = db.selectFrom(collection_name);

    const fields = await db
      .selectFrom('fields_meta')
      .selectAll()
      .where('is_hidden', '=', false)
      .where('collection', '=', collection_id)
      .execute();

    for (const field of fields) {
      if (field.relation_collection !== null) {
        query = query.leftJoin(
          `${field.relation_collection} as ref_${joinCounter}`,
          `${collection_name}.${field.name}`,
          `ref_${joinCounter}.id`
        );

        const relationCollectionMeta = await db
          .selectFrom('collections_meta')
          .selectAll()
          .where('name', '=', field.relation_collection)
          .executeTakeFirstOrThrow();

        selectFields.push(
          `ref_${joinCounter}.${relationCollectionMeta.relation_alias} as ${field.name}`
        );
        ++joinCounter;
      } else if (field.type === 'Select') {
        query = query.leftJoin(`select_options as ref_${joinCounter}`, (join) =>
          join
            .on(`ref_${joinCounter}.collection`, '=', collection_id)
            .on(`ref_${joinCounter}.field`, '=', field.id) // match field_id properly
            .onRef(
              `ref_${joinCounter}.value`,
              '=',
              `${collection_name}.${field.name}` // must be a valid column ref
            )
        );

        selectFields.push(`ref_${joinCounter}.text as ${field.name}`);
        ++joinCounter;
      } else {
        selectFields.push(`${collection_name}.${field.name}`);
      }
    }

    query = query.select(selectFields);
    const records = await query
      .offset(parsedPage * parsedPageSize)
      .limit(parsedPageSize)
      .execute();

    const totalCount = await db
      .selectFrom(collection_name)
      .select(({ fn }) => fn.countAll().as('total_count'))
      .executeTakeFirstOrThrow();

    return { records: records, totalCount: totalCount.total_count };
  } catch (e) {
    console.error(e);
  }
}
