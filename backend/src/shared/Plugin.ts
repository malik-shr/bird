import { PluginContext } from './PluginContext';
import Collection from './Collection';
import Elysia from 'elysia';

export default interface Plugin {
  ctx: PluginContext;
  collections?: Collection[];
  app: Elysia<any>; // Children must set this
}
