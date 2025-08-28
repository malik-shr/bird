import { Kysely } from 'kysely';
import { FieldType } from './utils';

type Option = {
  value: number;
  text: string;
};

export type FieldProps = {
  id?: string;
  name: string;
  type: FieldType;
  relationCollection?: null | string;
  options?: null | Option[];
  isHidden?: boolean;
  isRequired?: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
};

export default class Field {
  id: string;
  name: string;
  type: FieldType;
  relationCollection: null | string;
  options?: null | Option[];
  isHidden: boolean;
  isRequired: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;

  constructor({
    id = '',
    name,
    type,
    relationCollection = null,
    options = null,
    isHidden = false,
    isRequired = false,
    isPrimaryKey = false,
    isUnique = false,
  }: FieldProps) {
    this.name = name;
    this.type = type;
    this.relationCollection = relationCollection;
    this.options = options;
    this.isHidden = isHidden;
    this.isRequired = isRequired;
    this.isPrimaryKey = isPrimaryKey;
    this.isUnique = isUnique;

    this.id = id;

    if (id === '') {
      this.id = crypto.randomUUID();
    }
  }

  async exists(collection_id: string, db: Kysely<DB>) {
    try {
      const result = await db
        .selectFrom('fields_meta as f')
        .select(({ fn }) => fn.countAll().as('length'))
        .where('f.name', '=', this.name)
        .where('f.collection', '=', collection_id)
        .executeTakeFirst();

      if (result) {
        return result.length !== 0;
      }

      return false;
    } catch (e) {
      console.error(e);
    }
  }

  async insertMetaData(collection_id: string, db: Kysely<DB>) {
    if (!(await this.exists(collection_id, db))) {
      try {
        await db
          .insertInto('fields_meta')
          .values({
            id: this.id,
            name: this.name,
            type: this.type as string,
            collection: collection_id,
            is_required: this.isRequired,
            relation_collection: this.relationCollection,
            is_hidden: this.isHidden,
            is_primary_key: this.isPrimaryKey,
            is_unique: this.isUnique,
          })
          .execute();

        if (this.type === 'Select' && this.options) {
          for (const option of this.options) {
            await db
              .insertInto('select_options')
              .values({
                id: crypto.randomUUID(),
                collection: collection_id,
                field: this.id,
                text: option.text,
                value: option.value,
              })
              .execute();
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
