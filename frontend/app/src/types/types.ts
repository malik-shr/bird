export type Collection = {
  id: string;
  name: string;
  type: string;
  require_auth: boolean;
  system: boolean;
};

export type User = {
  id: string;
  username: string;
  email: string;
  disabled: boolean;
  role: number;
};
