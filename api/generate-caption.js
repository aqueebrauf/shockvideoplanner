import { adaptWebHandler } from './_adapter.js';
import handler from '../netlify/functions/generate-caption.mjs';

export default adaptWebHandler(handler);
