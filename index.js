import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const __dirname = import.meta.dirname

const PORT = process.env.PORT || 3000;

const types = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
  }

const server = http.createServer(async (req, res) => {
  if (req.url === '/live') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.flushHeaders();

    const intervalId = setInterval(() => {
      const randomNumber = Math.floor(Math.random() * (5000 - 2000) + 2000);
      console.log(randomNumber);
      res.write(`data: ${randomNumber}\n\n`);
    }, 5000);

    req.on('close', () => clearInterval(intervalId));
    return;
  }

  if (req.url === '/log' && req.method === 'POST') {
    let body = ''
    for await (const chunk of req) {
      body += chunk
    }
    try {
      await fs.appendFile(path.join(__dirname,'log.txt'), body + '\n')
    } catch (error) {
      console.error('Error writing to log file:', error)
    }

    res.writeHead(201, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ok: true}))
    return
  }

  const filePath = path.join(__dirname ,'public', req.url === '/' ? 'index.html' : req.url);
  try {
    const fileContent = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = types[ext] || 'text/html';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fileContent);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
