import Plugin from '@shared/Plugin';
import { PluginContext } from '@shared/PluginContext';
import Elysia from 'elysia';

export default class FileApi implements Plugin {
  ctx: PluginContext;
  app;

  constructor(ctx: PluginContext) {
    this.app = new Elysia({ prefix: '/file' });

    this.app.get(
      '/:collection_name/:record_id/:file_name',
      async ({ params: { collection_name, record_id, file_name } }) => {
        const path = `bird_data/storage/${collection_name}/${record_id}/${file_name}`;

        const file = Bun.file(path);

        return new Response(file);
      }
    );
  }
}
