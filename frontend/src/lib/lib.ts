import { writable } from 'svelte/store';
import Bird from './sdk';

export const bird = new Bird('');

export const user = writable<Bird.User | null>(null);
export const collections = writable<Bird.Collection[]>([]);

bird.auth.subscribe((e) => {
  user.set(e.user);
});

export async function fetchCollections() {
  try {
    const request = await bird.collections.list();
    collections.set(request);
  } catch (e) {
    console.error(e);
  }
}
