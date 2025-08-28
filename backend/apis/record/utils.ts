import { FieldType } from '@shared/utils';
import { t } from 'elysia';
import { Kysely } from 'kysely';

export async function transformBody(
  collection_name: string,
  body: any,
  db: Kysely<DB>
) {
  try {
    const newBody: Record<string, any> = {};

    const collection = await db
      .selectFrom('collections_meta')
      .selectAll()
      .where('name', '=', collection_name)
      .executeTakeFirstOrThrow();

    const fields = await db
      .selectFrom('fields_meta')
      .selectAll()
      .where('collection', '=', collection.id)
      .where('name', 'is not', 'id')
      .execute();

    for (const field of fields) {
      if (!body[field.name] && field.is_required) {
        throw Error('Expected: ' + field.name);
      }

      switch (field.type) {
        case 'Integer':
          newBody[field.name] = parseInt(body[field.name]);
          break;
        case 'Float':
          newBody[field.name] = parseFloat(body[field.name]);
          break;
        case 'Boolean':
          newBody[field.name] = body[field.name] === 'true';
          break;
        case 'Date':
          newBody[field.name] = Date.parse(newBody[field.name]);
          break;
        default:
          newBody[field.name] = body[field.name];
      }
    }
  } catch (e) {
    console.error(e);
  }
}

export async function getCollectionBody(
  collection_name: string,
  db: Kysely<DB>
) {
  try {
    const collection = await db
      .selectFrom('collections_meta')
      .selectAll()
      .where('name', '=', collection_name)
      .executeTakeFirstOrThrow();

    const fields = await db
      .selectFrom('fields_meta')
      .selectAll()
      .where('collection', '=', collection.id)
      .where('name', 'is not', 'id')
      .execute();

    // build a runtime object schema
    const shape: Record<string, ReturnType<typeof mapFieldType>> = {};
    for (const field of fields) {
      if (!field.is_required) {
        shape[field.name] = t.Optional(mapFieldType(field.type as FieldType));
        continue;
      }

      shape[field.name] = mapFieldType(field.type as FieldType);
    }

    // use t.Object instead of t.Record
    const body = t.Object(shape);

    return body;
  } catch (e) {
    console.error(e);
  }
}

function mapFieldType(type: FieldType) {
  switch (type) {
    case 'String':
    case 'Markdown':
    case 'Relation':
    case 'Select':
      return t.String();
    case 'Integer':
    case 'Float':
      return t.Number();
    case 'Boolean':
      return t.Boolean();
    case 'Date':
      return t.Date();
    case 'File':
      return t.File();
    default:
      return t.String();
  }
}
