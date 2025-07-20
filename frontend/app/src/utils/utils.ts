export interface IField {
  name: string;
  type: string;
  required?: boolean;
  primary_key: boolean;
  secure: boolean;
  hidden: boolean;
}

export const fieldIconMap: Record<string, string> = {
  String: 'ri:text',
  Integer: 'ri:hashtag',
  Float: 'ri:calculator-line',
  Boolean: 'ri:toggle-line',
};
