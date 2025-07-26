import { FieldType, FieldTypes } from '../apis/schemas/types';
import { LengthRow } from '../db/models';
import { db } from './db';

type Option = {
  value: number;
  text: string;
};

type FieldProps = {
  id?: string;
  name: string;
  type: FieldType;
  references?: null | string;
  options?: null | Option[];
  secure?: boolean;
  system?: boolean;
  hidden?: boolean;
  required?: boolean;
  primary_key?: boolean;
  unique?: boolean;
};

export default class Field {
  id: string;
  name: string;
  type: FieldType;
  references: null | string;
  options?: null | Option[];
  secure: boolean;
  system: boolean;
  hidden: boolean;
  required: boolean;
  primary_key: boolean;
  unique: boolean;

  constructor({
    id = '',
    name,
    type,
    references = null,
    options = null,
    secure = false,
    system = false,
    hidden = false,
    required = false,
    primary_key = false,
    unique = false,
  }: FieldProps) {
    this.name = name;
    this.type = type;
    this.references = references;
    this.options = options;
    this.secure = secure;
    this.system = system;
    this.hidden = hidden;
    this.required = required;
    this.primary_key = primary_key;
    this.unique = unique;

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
        $name: this.name,
        $collection: collection_id,
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
      const insertFieldMeta = db.query(
        `
            INSERT INTO fields_meta 
                ("id", "name", "type", "collection", "secure", "required", "references", "system", "hidden", "primary_key", "unique") 
                VALUES 
                ($id, $name, $type, $collection, $secure, $required, $references, $system, $hidden, $primary_key, $unique )
        `
      );

      try {
        insertFieldMeta.run({
          $id: this.id,
          $name: this.name,
          $type: this.type,
          $collection: collection_id,
          $secure: this.secure,
          $required: this.required,
          $references: this.references,
          $system: this.system,
          $hidden: this.hidden,
          $primary_key: this.primary_key,
          $unique: this.unique,
        });

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
              $id: crypto.randomUUID(),
              $collection: collection_id,
              $field: this.id,
              $text: option.text,
              $value: option.value,
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  sql() {
    const notNull = this.required ? ' NOT NULL' : '';
    const unique = this.unique ? ' UNIQUE' : '';

    const col = `"${this.name}" ${FieldTypes[this.type]}${notNull}${unique}`;

    return col.trim();
  }
}
