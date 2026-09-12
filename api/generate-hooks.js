import { adaptWebHandler } from './_adapter.js';
import handler from './handlers/generate-hooks.mjs';

export default adaptWebHandler(handler);
