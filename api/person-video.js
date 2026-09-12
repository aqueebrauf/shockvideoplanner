import { adaptWebHandler } from './_adapter.js';
import handler from './handlers/person-video.mjs';

export default adaptWebHandler(handler);
