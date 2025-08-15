import { FieldType } from '../core/apis/schemas/types';

export class UserRow {
  id: string;
  username: string;
  email: string;
  password: string;
  disabled: boolean;
  role: number;
}

export class FieldRow {
  id: string;
  name: string;
  collection: string;
  type: FieldType;
  relation_collection: string;

  is_secure: boolean;
  is_system: boolean;
  is_hidden: boolean;
  is_required: boolean;
  is_primary_key: boolean;
  is_unique: boolean;
}

export class CollectionRow {
  id: string;
  name: string;
  type: string;
  description: string;

  requires_auth: boolean;
  is_system: boolean;
}

export class LengthRow {
  length: number;
}

export interface AuthRuleRow {
  viewRule: number;
  createRule: number;
  updateRule: number;
  deleteRule: number;
}

export class OptionRow {
  value: number;
  text: string;
}

export class AliasFieldRow {
  name: string;
}
