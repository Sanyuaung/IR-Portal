import { app } from './app.js';

export default function handler(req: any, res: any) {
  // If original URL or matched path is present, normalize req.url
  const originalUrl = req.headers['x-matched-path'] || req.url || '';
  if (originalUrl && !originalUrl.startsWith('/api') && originalUrl !== '/') {
    req.url = '/api' + (originalUrl.startsWith('/') ? originalUrl : '/' + originalUrl);
  }
  return app(req, res);
}
