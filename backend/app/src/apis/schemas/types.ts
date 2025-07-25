export const FieldTypes = {
  String: 'TEXT',
  Integer: 'INTEGER',
  Float: 'FLOAT',
  Boolean: 'BOOLEAN',
};

export type FieldType = keyof typeof FieldTypes;
