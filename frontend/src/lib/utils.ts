import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import Type from '@lucide/svelte/icons/type';
import Hash from '@lucide/svelte/icons/hash';
import Calculator from '@lucide/svelte/icons/calculator';
import ToggleRight from '@lucide/svelte/icons/toggle-right';
import Calendar from '@lucide/svelte/icons/calendar';
import MoveHorizontal from '@lucide/svelte/icons/move-horizontal';
import ListCheck from '@lucide/svelte/icons/list-check';

import Key from '@lucide/svelte/icons/key';
import Lock from '@lucide/svelte/icons/lock';
import Mail from '@lucide/svelte/icons/mail';
import File from '@lucide/svelte/icons/file';
import type Bird from './sdk';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, 'children'>
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};

export function formDataToObject(formData: FormData): Record<string, any> {
  return Object.fromEntries(formData.entries());
}

export const iconNameMap = {
  id: Key,
  password: Lock,
  email: Mail,
};

export const IconMap = {
  String: Type,
  Integer: Hash,
  Float: Calculator,
  Boolean: ToggleRight,
  Date: Calendar,
  Relation: MoveHorizontal,
  Select: ListCheck,
  File: File,
};

export function getIcon(field: Bird.Field) {
  if (
    field.name === 'id' ||
    field.name === 'password' ||
    field.name === 'email'
  ) {
    return iconNameMap[field.name];
  }

  return IconMap[field.type as keyof typeof IconMap];
}
