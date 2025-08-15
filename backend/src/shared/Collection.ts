import { Static } from 'elysia';
import { db } from '../db/db';
import { RuleData } from '../core/apis/handlers/collection/createCollection';
import Field from './Field';
import { FieldTypes } from '../core/apis/schemas/types';

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

  async exists() {
    const result = await db
      .selectFrom('collections_meta')
      .select(({ fn }) => fn.countAll().as('length'))
      .where('name', '=', this.name)
      .executeTakeFirst();

    if (result) {
      return result.length !== 0;
    }

    return false;
  }

  async createTable() {
    let builder = db.schema.createTable(this.name).ifNotExists();

    for (const field of this.fields) {
      builder = builder.addColumn(
        field.name,
        FieldTypes[field.type],
        (colBuilder) => {
          if (field.isRequired) colBuilder.notNull();
          if (field.isPrimaryKey) colBuilder.primaryKey();
          return colBuilder;
        }
      );
    }

    await builder.execute();
  }

  async insertMetaData() {
    if (!this.exists()) {
      try {
        await db
          .insertInto('collections_meta')
          .values({
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            require_auth: this.requiresAuth,
            is_system: this.isSystem,
          })
          .execute();

        for (const [key, value] of Object.entries(this.ruleData)) {
          db.insertInto('auth_rules')
            .values({
              id: crypto.randomUUID(),
              collection: this.id,
              rule: key,
              permission: value,
            })
            .execute();
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
