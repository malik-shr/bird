import { Static } from 'elysia';
import Field, { FieldProps } from './Field';
import { FieldTypes } from '../apis/record/utils';
import { Kysely } from 'kysely';
import { RuleData } from '../apis/collection/handlers/createCollection';

export default class Collection {
  id;
  name;
  type;
  description = '';
  isSystem = false;
  relationAlias = 'id';
  fields;
  ruleData = {
    viewRule: 0,
    createRule: 0,
    updateRule: 0,
    deleteRule: 0,
  };

  idField = new Field({
    name: 'id',
    type: 'String',
    isHidden: false,
    isRequired: true,
    isPrimaryKey: true,
    isUnique: true,
  });

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;

    this.fields = [this.idField];

    this.id = crypto.randomUUID();
  }

  async exists(db: Kysely<DB>) {
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

  async createTable(db: Kysely<DB>) {
    try {
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
    } catch (e) {
      console.error(e);
    }
  }

  async insertMetaData(db: Kysely<DB>) {
    if (!(await this.exists(db))) {
      try {
        await db
          .insertInto('collections_meta')
          .values({
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            is_system: this.isSystem,
            relation_alias: this.relationAlias,
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
          await field.insertMetaData(this.id, db);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  addField(props: FieldProps) {
    const field = new Field(props);
    this.fields.push(field);
    return this;
  }

  addDescription(description: string) {
    this.description = description;
  }

  setSystem(isSystem: boolean) {
    this.isSystem = isSystem;
    return this;
  }

  setRuleData(ruleData: Static<typeof RuleData>) {
    this.ruleData = ruleData;
    return this;
  }

  setRelationAlias(relationAlias: string) {
    this.relationAlias = relationAlias;
    return this;
  }
}
