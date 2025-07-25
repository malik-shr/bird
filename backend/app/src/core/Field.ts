import { db } from './db';

export const fieldTypes = {
  String: 'TEXT',
  Integer: 'INTEGER',
  Float: 'FLOAT',
  Boolean: 'BOOLEAN',
};

type FieldType = keyof typeof fieldTypes;

type FieldProps = {
  id?: string | null;
  name: string;
  type: FieldType;
  secure?: boolean;
  system?: boolean;
  hidden?: boolean;
  required?: boolean;
  primary_key?: boolean;
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

  constructor({
    id = null,
    name,
    type,
    secure = false,
    system = false,
    hidden = false,
    required = false,
    primary_key = false,
  }: FieldProps) {
    this.name = name;
    this.type = type;
    this.secure = secure;
    this.system = system;
    this.hidden = hidden;
    this.required = required;
    this.primary_key = primary_key;

    this.id = id ?? crypto.randomUUID();
  }

  exists(collection_id: string) {
    const query = db.query(
      `SELECT COUNT(*) FROM fields_meta f WHERE f.name = $name AND f.collection = $collection`
    );
    const length = query.get({ $name: self.name, $collection: collection_id });

    return length !== 0;
  }

  insertMetaData(collection_id: string) {
    if (!this.exists(collection_id)) {
      const query = db.query(
        `
            INSERT INTO fields_meta 
                (id, name, type, collection, secure, system, hidden, primary_key) 
                VALUES 
                ($id, $name, $type, $collection, $secure, $system, $hidden, $primary_key)
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
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  string() {
    const notNull = this.required ? ' NOT NULL' : '';
    const primaryKey = this.primary_key ? ' PRIMARY KEY' : '';

    const col = `${this.name} ${fieldTypes[this.type]}${primaryKey}${notNull}`;

    return col.trim();
  }
}
