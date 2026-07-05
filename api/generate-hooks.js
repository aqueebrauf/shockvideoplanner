import { adaptWebHandler } from './_adapter.js';
import handler from '../netlify/functions/generate-hooks.mjs';

export default adaptWebHandler(handler);
