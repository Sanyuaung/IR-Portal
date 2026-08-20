import { app } from '../src/server/app.ts';

export default function handler(req: any, res: any) {
  // Normalize URL in case Vercel rewrites changed req.url
  if (req.headers && req.headers['x-matched-path']) {
    req.url = req.headers['x-matched-path'];
  }
  return app(req, res);
}
