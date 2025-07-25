import { LengthRow } from '../db/models';
import { db } from './db';
import Field from './Field';
import { Collections } from './store';

const idField = new Field({
  name: 'id',
  type: 'String',
  secure: false,
  system: true,
  hidden: false,
  required: true,
  primary_key: true,
  unique: true,
});

export default class Collection {
  name: string;
  type: string;
  description: string;
  fields: Field[];
  system: boolean;
  require_auth: boolean;
  id: string | null;

  constructor(
    name: string,
    type: string,
    description: string = '',
    fields: Field[] = [],
    system: boolean = false,
    require_auth: boolean = false,
    id: string | null = null
  ) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.fields = fields;

    this.fields = [idField, ...this.fields];

    this.system = system;
    this.require_auth = require_auth;

    this.id = id;

    if (id === null) {
      this.id = crypto.randomUUID();
    }
  }

  exists() {
    const query = db
      .query(
        `SELECT COUNT(*) AS length FROM collections_meta WHERE name = $name`
      )
      .as(LengthRow);

    const result = query.get({ $name: this.name });

    if (result) {
      return result.length !== 0;
    }

    return false;
  }

  createTable() {
    let fieldsString = '';
    const primary_keys: string[] = [];

    for (const field of this.fields) {
      fieldsString += `${field.string()},\n`;
      if (field.primary_key) {
        primary_keys.push(field.name);
      }
    }

    const createStatement = `
      CREATE TABLE IF NOT EXISTS ${this.name}(
          ${fieldsString}
          PRIMARY KEY(${primary_keys.join(', ')})
      )
  `;

    db.run(createStatement);
  }

  delete() {
    const deleteStatement = db.query(`
      DELETE FROM collections_meta AS c WHERE c.name = $name;
      DELETE FROM fields_meta AS f WHERE f.collection = $id;
      
      DROP TABLE ${this.name};
    `);

    deleteStatement.run({ $name: this.name, $id: this.id });

    Collections.delete(this.name);
  }

  insertMetaData() {
    if (!this.exists()) {
      const query = db.query(
        `
            INSERT INTO collections_meta 
                (id, name, type, description, require_auth, system) 
                VALUES 
                ($id, $name, $type, $description, $require_auth, $system)
        `
      );

      try {
        query.run({
          $id: this.id,
          $name: this.name,
          $type: this.type,
          $description: this.description,
          $require_auth: this.require_auth,
          $system: this.system,
        });

        Collections.set(this.name, this);

        for (const field of this.fields) {
          field.insertMetaData(this.id!);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
}
