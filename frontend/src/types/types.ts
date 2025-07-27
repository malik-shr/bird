export type Collection = {
  id: string;
  name: string;
  type: string;
  requires_auth: boolean;
  is_system: boolean;
};

export type User = {
  id: string;
  username: string;
  email: string;
  disabled: boolean;
  role: number;
};
