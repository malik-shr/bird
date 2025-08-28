import Plugin from '@shared/Plugin';
import { PluginContext } from '@shared/PluginContext';
import Elysia from 'elysia';
import { download } from './handlers/download';

export default class FileApi implements Plugin {
  ctx: PluginContext;
  app;

  constructor(ctx: PluginContext) {
    this.app = new Elysia({ prefix: '/file' });

    this.app.get(
      '/:collection_name/:record_id/:file_name',
      async ({ params: { collection_name, record_id, file_name } }) =>
        download(collection_name, record_id, file_name)
    );
  }
}
