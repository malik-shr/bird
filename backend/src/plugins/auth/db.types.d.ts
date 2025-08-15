export interface UserTable {
  id: string;
  username: string;
  email: string;
  password: string;
  disabled: boolean;
  role: number;
}

declare global {
  interface DB {
    users: UserTable;
  }
}
