import { adaptWebHandler } from './_adapter.js';
import handler from './handlers/generate-this-person.mjs';

export default adaptWebHandler(handler);
