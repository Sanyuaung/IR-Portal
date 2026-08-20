import path from 'path';
import fs from 'fs';
import express from 'express';
import { app } from './app';

const PORT = process.env.PORT || 3000;

// Serve static build assets in production
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  const router = express.Router();
  router.use(express.static(distPath));
  router.get('*', (req: any, res: any, next: any) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.use(router);
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 KBZ Bank IR Portal server listening on 0.0.0.0:${PORT}`);
});
