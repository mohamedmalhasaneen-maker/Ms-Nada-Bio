import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      const indexHtmlPath = path.resolve(distPath, 'index.html');
      app.use(express.static(distPath, { index: false }));
      app.get('*', (req, res) => {
        if (fs.existsSync(indexHtmlPath)) {
          const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || req.protocol || 'https';
          const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0] || req.get('host');
          const origin = (process.env.APP_URL || (host ? `${proto}://${host}` : '')).replace(/\/$/, '');
          let html = fs.readFileSync(indexHtmlPath, 'utf-8');
          if (origin) {
            html = html.replace(/content="\/logo-atlas\.png\?v=2"/g, `content="${origin}/logo-atlas.png?v=2"`);
          }
          res.type('html').send(html);
          return;
        }
        res.status(404).send('Not found');
      });
    }
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BioAnatomy 3D Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
