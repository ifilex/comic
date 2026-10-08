import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Cloud file fetch proxy to bypass browser CORS
  app.post('/api/fetch-cloud', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'URL es requerida' });
        return;
      }

      let targetUrl = url.trim();

      // Transform Google Drive links to direct download
      const gDriveMatch = targetUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (gDriveMatch && gDriveMatch[1]) {
        targetUrl = `https://drive.google.com/uc?export=download&id=${gDriveMatch[1]}`;
      } else {
        const gDriveIdMatch = targetUrl.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
        if (gDriveIdMatch && gDriveIdMatch[1]) {
          targetUrl = `https://drive.google.com/uc?export=download&id=${gDriveIdMatch[1]}`;
        }
      }

      // Transform Dropbox links to direct download
      if (targetUrl.includes('dropbox.com')) {
        targetUrl = targetUrl.replace('dl=0', 'dl=1');
        if (!targetUrl.includes('dl=1')) {
          targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'dl=1';
        }
      }

      // Transform OneDrive links if sharing link
      if (targetUrl.includes('1drv.ms') || targetUrl.includes('onedrive.live.com')) {
        targetUrl = targetUrl.replace('redir?', 'download?');
      }

      // Fetch with stream and follow redirects
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        res.status(response.status).json({
          error: `Error al obtener el archivo desde la nube: ${response.status} ${response.statusText}`,
        });
        return;
      }

      // Extract filename from Content-Disposition header or URL
      let filename = 'comic.cbz';
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1].replace(/['"]/g, ''));
        }
      } else {
        try {
          const parsed = new URL(targetUrl);
          const pathname = parsed.pathname;
          const baseName = path.basename(pathname);
          if (baseName && (baseName.endsWith('.cbr') || baseName.endsWith('.cbz') || baseName.endsWith('.zip') || baseName.endsWith('.rar'))) {
            filename = decodeURIComponent(baseName);
          }
        } catch {
          // fallback
        }
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('X-Filename', encodeURIComponent(filename));
      res.send(buffer);
    } catch (err: any) {
      console.error('Fetch cloud error:', err);
      res.status(500).json({ error: err.message || 'Error al descargar el archivo de la nube' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Comic Reader Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
