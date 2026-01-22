import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MIME 타입 설정
const mimeTypes = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};

// 정적 파일 서빙 (MIME 타입 명시)
app.use(express.static(join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    const ext = filePath.substring(filePath.lastIndexOf('.'));
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  }
}));

// SPA 라우팅 - 파일이 없는 경우에만 index.html 반환
app.get('*', (req, res) => {
  const filePath = join(__dirname, 'dist', req.path);
  if (existsSync(filePath) && !req.path.endsWith('/')) {
    res.sendFile(filePath);
  } else {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
