import { DataTypeExpression } from 'kysely/dist/cjs/parser/data-type-parser';

type FieldTypesType = {
  [key: string]: DataTypeExpression;
};

export const FieldTypes: FieldTypesType = {
  String: 'text',
  Integer: 'integer',
  Float: 'float4',
  Boolean: 'boolean',
  Date: 'date',
  Select: 'text',
  Relation: 'text',
};

export type FieldType = keyof typeof FieldTypes;
