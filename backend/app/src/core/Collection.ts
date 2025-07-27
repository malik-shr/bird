import { Static } from 'elysia';
import { db } from './db';
import Field from './Field';
import { RuleData } from '../apis/handlers/collection/createCollection';
import { LengthRow } from '../db/models';

type CollectionProps = {
  id?: string;
  name: string;
  type: string;
  description?: string;
  fields: Field[];
  isSystem?: boolean;
  requiresAuth?: boolean;
  ruleData: Static<typeof RuleData>;
};

export default class Collection {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: Field[];
  isSystem: boolean;
  requiresAuth: boolean;
  ruleData: Static<typeof RuleData>;

  idField = new Field({
    name: 'id',
    type: 'String',
    isSecure: false,
    isSystem: true,
    isHidden: false,
    isRequired: true,
    isPrimaryKey: true,
    isUnique: true,
  });

  constructor({
    id = '',
    name,
    type,
    description = '',
    fields,
    isSystem = false,
    requiresAuth = false,
    ruleData,
  }: CollectionProps) {
    this.name = name;
    this.type = type;
    this.description = description;

    this.fields = [this.idField, ...fields];

    this.isSystem = isSystem;
    this.requiresAuth = requiresAuth;

    this.ruleData = ruleData;

    this.id = id;

    if (id === '') {
      this.id = crypto.randomUUID();
    }
  }

  exists() {
    const query = db
      .query(
        `SELECT COUNT(*) AS length FROM collections_meta WHERE name = :name`
      )
      .as(LengthRow);

    const result = query.get({ name: this.name });

    if (result) {
      return result.length !== 0;
    }

    return false;
  }

  createTable() {
    let fieldsString = '';
    const primary_keys: string[] = [];

    for (const field of this.fields) {
      fieldsString += `${field.sql()},\n`;
      if (field.isPrimaryKey) {
        primary_keys.push(`${field.name}`);
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

  insertMetaData() {
    if (!this.exists()) {
      const query = db.query(
        `
          INSERT INTO collections_meta 
              (id, name, type, description, requires_auth, is_system) 
              VALUES 
              ($id, $name, $type, $description, $requires_auth, $is_system)
        `
      );

      try {
        query.run({
          id: this.id,
          name: this.name,
          type: this.type,
          description: this.description,
          requires_auth: this.requiresAuth,
          is_system: this.isSystem,
        });

        for (const [key, value] of Object.entries(this.ruleData)) {
          const query = db.query(
            'INSERT INTO auth_rules (id, collection, rule, permission) VALUES ($id, $collection, $rule, $permission)'
          );

          query.run({
            id: crypto.randomUUID(),
            collection: this.id,
            rule: key,
            permission: value,
          });
        }

        for (const field of this.fields) {
          field.insertMetaData(this.id);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
}
