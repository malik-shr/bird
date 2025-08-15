interface UserTable {
  id: string;
  username: string;
  email: string;
  password: string;
  disabled: boolean;
  role: number;
}

interface CollectionsTable {
  id: string;
  name: string;
  type: string;
  description: string;
  require_auth: boolean;
  is_system: boolean;
}

interface FieldsTable {
  id: string;
  name: string;
  type: string;
  collection: string;
  is_secure: boolean;
  is_system: boolean;
  is_hidden: boolean;
  is_required: boolean;
  is_primary_key: boolean;
  is_unique: boolean;
  relation_collection: string | null;
}

interface AuthRulesTable {
  id: string;
  collection: string;
  rule: string;
  permission: number;
}

interface SelectOptionsTable {
  id: string;
  collection: string;
  field: string;
  text: string;
  value: string;
}

export interface DB {
  users: UserTable;
  collections_meta: CollectionsTable;
  fields_meta: FieldsTable;
  authRules: AuthRulesTable;
  selectOptions: SelectOptionsTable;

  [tableName: string]: any;
}
