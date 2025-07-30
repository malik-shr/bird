import { QueryBuilder } from 'bird-sql';
import { Database } from 'bun:sqlite';

export const db = new Database('data.db');

export const bb = new QueryBuilder(db);
