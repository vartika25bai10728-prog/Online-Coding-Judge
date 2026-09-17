import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(express.json());

const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.use(express.static(process.cwd()));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('*', (req, res) => {
  const distFile = path.join(distPath, 'index.html');
  const rootFile = path.join(process.cwd(), 'index.html');
  if (fs.existsSync(distFile)) {
    res.sendFile(distFile);
  } else {
    res.sendFile(rootFile);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
