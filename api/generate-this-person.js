import { adaptWebHandler } from './_adapter.js';
import handler from '../netlify/functions/generate-this-person.mjs';

export default adaptWebHandler(handler);
