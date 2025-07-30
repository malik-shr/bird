import { FieldType, FieldTypes } from '../apis/schemas/types';
import { LengthRow } from '../db/models';
import { bb, db } from './db';

type Option = {
  value: number;
  text: string;
};

type FieldProps = {
  id?: string;
  name: string;
  type: FieldType;
  relationCollection?: null | string;
  options?: null | Option[];
  isSecure?: boolean;
  isSystem?: boolean;
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
  isSecure: boolean;
  isSystem: boolean;
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
    isSecure = false,
    isSystem = false,
    isHidden = false,
    isRequired = false,
    isPrimaryKey = false,
    isUnique = false,
  }: FieldProps) {
    this.name = name;
    this.type = type;
    this.relationCollection = relationCollection;
    this.options = options;
    this.isSecure = isSecure;
    this.isSystem = isSystem;
    this.isHidden = isHidden;
    this.isRequired = isRequired;
    this.isPrimaryKey = isPrimaryKey;
    this.isUnique = isUnique;

    this.id = id;

    if (id === '') {
      this.id = crypto.randomUUID();
    }
  }

  exists(collection_id: string) {
    try {
      const query = db
        .query(
          `SELECT COUNT(*) AS length FROM fields_meta AS f WHERE f.name = $name AND f.collection = $collection`
        )
        .as(LengthRow);
      const result = query.get({
        name: this.name,
        collection: collection_id,
      });

      if (result) {
        return result.length !== 0;
      }

      return false;
    } catch (e) {
      console.log(e);
    }
  }

  insertMetaData(collection_id: string) {
    if (!this.exists(collection_id)) {
      try {
        bb.insertInto('fields_meta')
          .values({
            id: this.id,
            name: this.name,
            type: this.type,
            collection: collection_id,
            is_secure: this.isSecure,
            is_required: this.isRequired,
            relation_collection: this.relationCollection,
            is_system: this.isSystem,
            is_hidden: this.isHidden,
            is_primary_key: this.isPrimaryKey,
            is_unique: this.isUnique,
          })
          .run();

        if (this.type === 'Select' && this.options) {
          for (const option of this.options) {
            const optionsQuery = db.query(
              `
              INSERT INTO select_options
              (id, collection, field, text, value)
              VALUES
              ($id, $collection, $field, $text, $value)
              `
            );

            optionsQuery.run({
              id: crypto.randomUUID(),
              collection: collection_id,
              field: this.id,
              text: option.text,
              value: option.value,
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  sql() {
    const notNull = this.isRequired ? ' NOT NULL' : '';
    const unique = this.isUnique ? ' UNIQUE' : '';

    const col = `"${this.name}" ${FieldTypes[this.type]}${notNull}${unique}`;

    return col.trim();
  }
}
