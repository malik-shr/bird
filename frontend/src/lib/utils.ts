import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type Bird from './sdk';
import {
  Pen,
  Key,
  Lock,
  Mail,
  File,
  Type,
  Hash,
  Calculator,
  ToggleRight,
  Calendar,
  MoveHorizontal,
  ListCheck,
} from '@lucide/svelte';

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
  Markdown: Pen,
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
