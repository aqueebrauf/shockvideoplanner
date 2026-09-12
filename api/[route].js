import { adaptWebHandler } from '../server/_adapter.js';
import generateHooks from '../server/handlers/generate-hooks.mjs';
import showedMe from '../server/handlers/showed-me.mjs';

const handlers = {
  'generate-hooks': generateHooks,
  'showed-me': showedMe,
  'person-video': showedMe,
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
