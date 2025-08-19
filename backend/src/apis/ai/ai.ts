import Collection from '@shared/Collection';
import Plugin from '@shared/Plugin';
import { PluginContext } from '@shared/PluginContext';
import Elysia from 'elysia';
import { aiRequest, getAiResponse } from './handlers/getAiResponse';
import { authMiddleware } from '../auth/middleware/authMiddleware';
import { messages } from './tables';

export default class AiApi implements Plugin {
  ctx: PluginContext;
  collections: Collection[];
  app;
  constructor(ctx: PluginContext) {
    this.ctx = ctx;
    this.app = new Elysia({ prefix: '/ai' });

    this.collections = [messages];

    this.app.use(authMiddleware(this.ctx.db)).guard(
      {
        beforeHandle(ctx) {
          if (ctx.user === null) {
            return (ctx.set.status = 'Forbidden');
          }
        },
      },
      (app) =>
        app.post(
          '/',
          (ctx) => getAiResponse(ctx.body.message, ctx.user!, this.ctx.db),
          { body: aiRequest }
        )
    );
  }
}
