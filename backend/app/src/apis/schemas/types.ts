export const FieldTypes = {
  String: 'TEXT',
  Integer: 'INTEGER',
  Float: 'FLOAT',
  Boolean: 'BOOLEAN',
  Date: 'DATE',
  Select: 'TEXT',
  Reference: 'TEXT',
};

export type FieldType = keyof typeof FieldTypes;
