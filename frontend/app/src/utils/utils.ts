import type { Collection } from '../types/types';

export interface IField {
  name: string;
  type: string;
  required: boolean;
  primary_key: boolean;
  secure: boolean;
  hidden: boolean;
  references?: string;
  options?: {
    value: number;
    text: string;
  }[];
}

export const fieldIconMap: Record<string, string> = {
  String: 'ri:text',
  Integer: 'ri:hashtag',
  Float: 'ri:calculator-line',
  Boolean: 'ri:toggle-line',
  Date: 'ri:calendar-line',
  Reference: 'ri:mind-map',
  Select: 'ri:list-check',
};

export const collectionIconMap: Record<string, string> = {
  base: 'ri:folder-3-line',
  view: 'ri:eye-line',
  auth: 'ri:folder-user-line',
  system: 'ri:folder-settings-line',
};

export const getFieldIcon = (field: IField) => {
  if (field.primary_key) {
    return 'ri:key-2-line';
  }

  if (field.name === 'password') {
    return 'ri:lock-2-line';
  }

  if (field.name === 'email') {
    return 'ri:mail-line';
  }

  return fieldIconMap[field.type];
};
