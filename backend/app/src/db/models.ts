import { FieldType } from '../apis/schemas/types';

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
  type: FieldType;

  secure: boolean;
  system: boolean;
  hidden: boolean;
  required: boolean;
  primary_key: boolean;
  unique: boolean;
}

export class CollectionRow {
  id: string;
  name: string;
  type: string;
  description: string;

  require_auth: boolean;
  system: boolean;
}

export class LengthRow {
  length: number;
}

export class AuthRuleRow {
  viewRule: number;
  createRule: number;
  updateRule: number;
  deleteRule: number;
}
