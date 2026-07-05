export function adaptWebHandler(handler) {
  return async function vercelHandler(req, res) {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      return res.status(204).end();
    }

    const protocol = req.headers['x-forwarded-proto'] ?? 'http';
    const host = req.headers.host ?? 'localhost';
    const init = {
      method: req.method,
      headers: req.headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body !== undefined && req.body !== '') {
        init.body =
          typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
    }

    const request = new Request(`${protocol}://${host}${req.url}`, init);
    const response = await handler(request);

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.send(Buffer.from(await response.arrayBuffer()));
  };
}
