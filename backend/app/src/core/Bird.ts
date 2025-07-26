import Elysia from 'elysia';
import { cors } from '@elysiajs/cors';
import { db } from './db';
import Field from './Field';
import Collection from './Collection';
import { Collections, Fields } from './store';
import { recordApi } from '../apis/record';
import { collectionApi } from '../apis/collection';
import { authApi } from '../apis/auth';
import { predefined_collections } from '../db/tables';
import { AuthRuleRow, FieldRow } from '../db/models';

export class Bird extends Elysia {
  constructor() {
    super();

    this.use(cors());

    this.setupDatabase();
    this.registerRoutes();
    this.setupMetadata();
  }

  private setupDatabase() {
    for (const collection of predefined_collections) {
      collection.createTable();
    }

    for (const collection of predefined_collections) {
      collection.insertMetaData();
    }
  }

  private setupMetadata() {
    const query = db
      .query(
        `
        SELECT 
          id, 
          name, 
          type,
          description,  
          require_auth, 
          system 
        FROM collections_meta
        `
      )
      .as(Collection);

    const collectionsMeta = query.all();

    for (const collectionMeta of collectionsMeta) {
      const collectionFields: Field[] = [];

      const query = db
        .query(
          `
          SELECT 
              id,
              name, 
              type, 
              secure, 
              system, 
              hidden, 
              required, 
              primary_key
          FROM 
            fields_meta AS f 
          WHERE 
            f.collection = $collectionMeta_id
        `
        )
        .as(FieldRow);

      const fieldMetas = query.all({ $collectionMeta_id: collectionMeta.id });

      for (const fieldMeta of fieldMetas) {
        const field = new Field({
          id: fieldMeta.id,
          name: fieldMeta.name,
          type: fieldMeta.type,
          secure: fieldMeta.secure,
          system: fieldMeta.system,
          required: fieldMeta.required,
          primary_key: fieldMeta.primary_key,
          unique: fieldMeta.unique,
        });
        Fields.set(fieldMeta.name, field);
        if (fieldMeta.name !== 'id') {
          collectionFields.push(field);
        }
      }

      const authRulesQuery = db
        .query(
          `
            SELECT
              MAX(CASE WHEN rule = 'viewRule' THEN permission END) AS viewRule,
              MAX(CASE WHEN rule = 'createRule' THEN permission END) AS createRule,
              MAX(CASE WHEN rule = 'updateRule' THEN permission END) AS updateRule,
              MAX(CASE WHEN rule = 'deleteRule' THEN permission END) AS deleteRule
            FROM auth_rules
            WHERE collection = $collectionMeta_id;
          `
        )
        .as(AuthRuleRow);

      const authRules = authRulesQuery.get({
        $collectionMeta_id: collectionMeta.id,
      });

      if (authRules) {
        const collection = new Collection({
          name: collectionMeta.name,
          type: collectionMeta.type,
          description: collectionMeta.description,
          fields: collectionFields,
          ruleData: {
            viewRule: authRules.viewRule,
            createRule: authRules.createRule,
            updateRule: authRules.updateRule,
            deleteRule: authRules.deleteRule,
          },
        });

        Collections.set(collectionMeta.name, collection);
      }
    }
  }

  private registerRoutes() {
    this.use(recordApi);

    this.use(collectionApi);

    this.use(authApi);
  }

  start() {
    this.listen(3000);
    console.log(
      '\x1b[32m%s\x1b[0m %s',
      'Server is listening on:',
      'http://localhost:3000'
    );
  }
}
