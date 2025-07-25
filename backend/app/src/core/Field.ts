import { FieldType, FieldTypes } from '../apis/schemas/types';
import { LengthRow } from '../db/models';
import { db } from './db';

type FieldProps = {
  id?: string | null;
  name: string;
  type: FieldType;
  secure?: boolean;
  system?: boolean;
  hidden?: boolean;
  required?: boolean;
  primary_key?: boolean;
  unique?: boolean;
};

export default class Field {
  id: string | null;
  name: string;
  type: FieldType;
  secure: boolean;
  system: boolean;
  hidden: boolean;
  required: boolean;
  primary_key: boolean;
  unique: boolean;

  constructor({
    id = null,
    name,
    type,
    secure = false,
    system = false,
    hidden = false,
    required = false,
    primary_key = false,
    unique = false,
  }: FieldProps) {
    this.name = name;
    this.type = type;
    this.secure = secure;
    this.system = system;
    this.hidden = hidden;
    this.required = required;
    this.primary_key = primary_key;
    this.unique = unique;

    this.id = id ?? crypto.randomUUID();
  }

  exists(collection_id: string) {
    const query = db
      .query(
        `SELECT COUNT(*) FROM fields_meta f WHERE f.name = $name AND f.collection = $collection`
      )
      .as(LengthRow);
    const result = query.get({ $name: self.name, $collection: collection_id });

    if (result) {
      return result.length !== 0;
    }

    return false;
  }

  insertMetaData(collection_id: string) {
    if (!this.exists(collection_id)) {
      const query = db.query(
        `
            INSERT INTO fields_meta 
                (id, name, type, collection, secure, system, hidden, primary_key, unique) 
                VALUES 
                ($id, $name, $type, $collection, $secure, $system, $hidden, $primary_key, $unique)
        `
      );

      try {
        query.run({
          $id: this.id,
          $name: this.name,
          $type: this.type,
          $collection: collection_id,
          $secure: this.secure,
          $system: this.system,
          $hidden: this.hidden,
          $primary_key: this.primary_key,
          $unique: this.unique,
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  string() {
    const notNull = this.required ? ' NOT NULL' : '';
    const unique = this.unique ? ' UNIQUE' : '';

    const col = `${this.name} ${FieldTypes[this.type]}${notNull}${unique}`;

    return col.trim();
  }
}
