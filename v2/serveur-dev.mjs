// Usage : node v2/serveur-dev.mjs  → http://localhost:5180/v2/
// Petit serveur statique pour regarder le site vitrine en dev (racine = depot landing).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.pdf': 'application/pdf', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.xml': 'application/xml' };
http.createServer((req, res) => {
	let u = decodeURIComponent(req.url.split('?')[0]);
	if (u.endsWith('/')) u += 'index.html';
	const f = path.join(RACINE, u);
	if (!f.startsWith(path.normalize(RACINE)) || !fs.existsSync(f)) { res.writeHead(404); return res.end('404'); }
	res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] ?? 'application/octet-stream' });
	fs.createReadStream(f).pipe(res);
}).listen(5180, () => console.log('http://localhost:5180/v2/'));
