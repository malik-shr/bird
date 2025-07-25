import Elysia from 'elysia';
import { cors } from '@elysiajs/cors';
import { predefined_collections } from '../db/tables';
import { db } from './db';
import Field from './Field';
import Collection from './Collection';
import { Collections, Fields } from './store';
import { recordApi } from '../apis/record';
import { collectionApi } from '../apis/collection';
import { authApi } from '../apis/auth';
import { FieldRow } from '../db/models';

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
            fields_meta f 
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
        if (
          fieldMeta.name !== 'id' &&
          fieldMeta.name !== 'username' &&
          fieldMeta.name !== 'password' &&
          fieldMeta.name !== 'email' &&
          fieldMeta.name !== 'disabled' &&
          fieldMeta.name !== 'role'
        ) {
          collectionFields.push(field);
        }
      }

      const collection = new Collection(
        collectionMeta.name,
        collectionMeta.type,
        collectionMeta.description,
        collectionFields
      );

      Collections.set(collectionMeta.name, collection);
    }
  }

  private registerRoutes() {
    this.use(recordApi);

    this.use(collectionApi);

    this.use(authApi);
  }

  private async setupCors() {
    const origins = [
      'http://localhost:80',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8080',
    ];

    this.use(
      cors({
        origin: origins,
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );
  }

  start() {
    this.listen(3000);
    console.log(
      '\x1b[32m%s\x1b[0m %s',
      '✅ Server is listening on:',
      'http://localhost:3000'
    );
  }
}
