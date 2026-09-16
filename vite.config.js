import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function tempCloudPlugin() {
  const storageDir = path.resolve(process.cwd(), '.temp_cloud_storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  return {
    name: 'temp-cloud-storage',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const host = req.headers.host || 'localhost';
        const url = new URL(req.url, `http://${host}`);

        // 1. Upload Handler: POST /api/temp-cloud/upload
        if (url.pathname === '/api/temp-cloud/upload' && req.method === 'POST') {
          const shortId = req.headers['x-short-id'] || Math.random().toString(36).substring(2, 8);
          const rawName = req.headers['x-file-name'] || 'file';
          const fileName = decodeURIComponent(rawName);
          const expiresAt = Number(req.headers['x-expires-at'] || (Date.now() + 24 * 3600 * 1000));

          const filePath = path.join(storageDir, `${shortId}.bin`);
          const metaPath = path.join(storageDir, `${shortId}.json`);

          const writeStream = fs.createWriteStream(filePath);
          req.pipe(writeStream);

          writeStream.on('finish', () => {
            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            const meta = {
              shortId,
              fileName,
              safeFileName: fileName.replace(/[^\w\.\-]/g, '_'),
              sizeMB,
              sizeBytes: stats.size,
              createdAt: Date.now(),
              expiresAtTimestamp: expiresAt,
              expiresAtFormatted: new Date(expiresAt).toLocaleString('id-ID'),
              storageType: 'local_server',
            };
            fs.writeFileSync(metaPath, JSON.stringify(meta));

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, metadata: meta }));
          });

          writeStream.on('error', (err) => {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          });
          return;
        }

        // 2. Metadata Handler: GET /api/temp-cloud/meta/:id
        if (url.pathname.startsWith('/api/temp-cloud/meta/') && req.method === 'GET') {
          const shortId = url.pathname.replace('/api/temp-cloud/meta/', '').trim();
          const metaPath = path.join(storageDir, `${shortId}.json`);
          if (fs.existsSync(metaPath)) {
            try {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
              if (Date.now() > meta.expiresAtTimestamp) {
                try {
                  fs.unlinkSync(metaPath);
                  fs.unlinkSync(path.join(storageDir, `${shortId}.bin`));
                } catch (e) {}
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'File expired' }));
                return;
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(meta));
              return;
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to read metadata' }));
              return;
            }
          }
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        // 3. File Download Handler: GET /api/temp-cloud/file/:id
        if (url.pathname.startsWith('/api/temp-cloud/file/') && req.method === 'GET') {
          const shortId = url.pathname.replace('/api/temp-cloud/file/', '').trim();
          const filePath = path.join(storageDir, `${shortId}.bin`);
          const metaPath = path.join(storageDir, `${shortId}.json`);

          if (fs.existsSync(filePath) && fs.existsSync(metaPath)) {
            try {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
              res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(meta.fileName)}"`);
              res.setHeader('Content-Type', 'application/octet-stream');
              fs.createReadStream(filePath).pipe(res);
              return;
            } catch (e) {}
          }
          res.statusCode = 404;
          res.end('File not found');
          return;
        }

        // 4. Set Worker URL Config: POST /api/set-worker-url
        if (url.pathname === '/api/set-worker-url' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              fs.writeFileSync(path.join(storageDir, 'public_config.json'), JSON.stringify(data));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        // 5. Get Public Config: GET /api/public-config
        if (url.pathname === '/api/public-config' && req.method === 'GET') {
          const cfgPath = path.join(storageDir, 'public_config.json');
          if (fs.existsSync(cfgPath)) {
            res.setHeader('Content-Type', 'application/json');
            fs.createReadStream(cfgPath).pipe(res);
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({}));
          return;
        }

        next();
      });
    },
  };
}

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, path.join(distDir, '200.html'));
        fs.copyFileSync(indexPath, path.join(distDir, '404.html'));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tempCloudPlugin(), spaFallbackPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['st.test'],
    hmr: {
      host: 'st.test',
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'esnext',
  },
});