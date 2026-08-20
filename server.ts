import path from 'path';
import fs from 'fs';
import { app } from './src/server/app';

const PORT = process.env.PORT || 3000;

// Serve static build assets if available
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(expressStaticDist());
}

function expressStaticDist() {
  const express = require('express');
  const router = express.Router();
  router.use(express.static(distPath));
  router.get('*', (req: any, res: any, next: any) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
  return router;
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 KBZ Bank IR Portal server listening on 0.0.0.0:${PORT}`);
});
