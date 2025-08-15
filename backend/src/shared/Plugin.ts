import Elysia from 'elysia';
import { PluginContext } from './PluginContext';
import Collection from './Collection';

export default class Plugin {
  ctx: PluginContext;
  collections: Collection[] = [];
  app;

  constructor(ctx: PluginContext, prefix: string) {
    this.app = new Elysia({ prefix });
    this.ctx = ctx;
  }
}
