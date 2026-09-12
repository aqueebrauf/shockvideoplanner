import { adaptWebHandler } from '../server/_adapter.js';
import generateCaption from '../server/handlers/generate-caption.mjs';
import generateHooks from '../server/handlers/generate-hooks.mjs';
import generateThisPerson from '../server/handlers/generate-this-person.mjs';
import personVideo from '../server/handlers/person-video.mjs';

const handlers = {
  'generate-caption': generateCaption,
  'generate-hooks': generateHooks,
  'generate-this-person': generateThisPerson,
  'person-video': personVideo,
};

async function router(request) {
  const { pathname } = new URL(request.url);
  const route = pathname.replace(/^\/api\/?/, '').split('/')[0];
  const handler = handlers[route];

  if (!handler) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return handler(request);
}

export default adaptWebHandler(router);
