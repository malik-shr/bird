// test-cors.ts - Create this in a NEW folder, not your existing project
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { recordApi } from './apis/record';
import { collectionApi } from './apis/collection';
import { authApi } from './apis/auth';
import { Bird } from './core/Bird';

const app = new Bird();
app.start();
