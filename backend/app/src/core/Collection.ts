import { db } from './db';
import Field from './Field';
import { Collections } from './store';

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

    const idField = new Field({
      name: 'id',
      type: 'String',
      secure: false,
      system: true,
      hidden: false,
      required: true,
      primary_key: true,
    });

    this.fields = fields;

    if (type === 'auth') {
      const authFields = [
        new Field({ name: 'username', type: 'String', required: true }),
        new Field({ name: 'email', type: 'String' }),
        new Field({
          name: 'password',
          type: 'String',
          secure: true,
          hidden: true,
          required: true,
        }),
        new Field({ name: 'disabled', type: 'Boolean' }),
        new Field({ name: 'role', type: 'Integer', required: true }),
      ];

      this.fields = [...authFields, ...this.fields];
    }

    this.fields = [idField, ...this.fields];

    this.system = system;
    this.require_auth = require_auth;

    this.id = id;

    if (id === null) {
      this.id = crypto.randomUUID();
    }
  }

  exists() {
    const query = db.query(
      `SELECT COUNT(*) AS length FROM collections_meta c WHERE c.name = $name`
    );

    const result = query.get({ $name: self.name }) as
      | { length: number }
      | undefined;
    const length = result?.length ?? 0;
    return length !== 0;
  }

  createTable() {
    let fieldsString = '';

    for (let i = 0; i < this.fields.length; i++) {
      if (i < this.fields.length - 1) {
        fieldsString += `${this.fields[i].string()},\n`;
        continue;
      }

      fieldsString += this.fields[i].string();
    }

    const createStatement = `
        CREATE TABLE IF NOT EXISTS ${this.name}(
            ${fieldsString}
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
