export interface CollectionsTable {
  id: string;
  name: string;
  type: string;
  description: string;
  is_system: boolean;
}

export interface FieldsTable {
  id: string;
  name: string;
  type: string;
  collection: string;
  is_hidden: boolean;
  is_required: boolean;
  is_primary_key: boolean;
  is_unique: boolean;
  relation_collection: string | null;
}

export interface AuthRulesTable {
  id: string;
  collection: string;
  rule: string;
  permission: number;
}

export interface SelectOptionsTable {
  id: string;
  collection: string;
  field: string;
  text: string;
  value: number;
}

declare global {
  interface DB {
    collections_meta: CollectionsTable;
    fields_meta: FieldsTable;
    auth_rules: AuthRulesTable;
    select_options: SelectOptionsTable;
    [key: string]: any;
  }
}

export {};
