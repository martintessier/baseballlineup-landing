// Videos anglaises de la vitrine (version EN du site) : memes formats et meme compression que les francaises.
//   video/capsules-en/<id>.mp4|jpg|vtt         les 11 capsules (540 x 960) + 00-saison (1280 x 720)
//   video/BaseballLineup-vitrine-en-720.mp4     la video de presentation (+ -en.vtt, -en-apercu.jpg)
// Sources : rendus LANGUE=en du repo de l'app (branche traduction pour les capsules, main pour la vitrine).
// Affiche : la 1re etape de chaque capsule ; le terrain « Ready. Fair. Informed. » pour la vitrine et 00-saison.
// Usage (depuis la racine du repo) : node v2/video/anglais.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const GITHUB = path.resolve(ICI, '..', '..', '..');
const CAPSULES = path.join(GITHUB, 'baseballlineup-traduction', 'Documentation', 'demo', 'capsules');
const VITRINE = path.join(GITHUB, 'baseballlineup', 'Documentation', 'demo', 'video');
const FF = process.env.FFMPEG ?? 'C:/Users/RandD-014/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const SORTIE = path.join(ICI, 'capsules-en');
fs.mkdirSync(SORTIE, { recursive: true });

const ff = (args) => execFileSync(FF, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const video = (src, dest, taille, crf) => ff(['-i', src, '-vf', `scale=${taille}`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', dest]);
const image = (src, dest, t, taille) => ff(['-ss', t.toFixed(2), '-i', src, '-frames:v', '1', '-vf', `scale=${taille}`, '-q:v', '3', dest]);
const secondes = (h) => { const [a, b, c] = h.split(':').map(Number); return a * 3600 + b * 60 + c; };
/** Debut de la n-ieme phrase des sous-titres. */
const debut = (vtt, n) => secondes(fs.readFileSync(vtt, 'utf8').match(/(\d\d:\d\d:\d\d\.\d+) -->/g)[n].slice(0, 12));
/** Debut de la phrase qui contient ce texte. */
const quand = (vtt, texte) => { const r = new RegExp(`(\\d\\d:\\d\\d:\\d\\d\\.\\d+) -->[^\\n]*\\n${texte}`); return secondes(fs.readFileSync(vtt, 'utf8').match(r)[1]); };

const ids = fs.readdirSync(path.join(CAPSULES, 'film', 'renders-en')).filter((f) => f.endsWith('.mp4')).map((f) => f.slice(0, -4));
for (const id of ids) {
	const src = path.join(CAPSULES, 'film', 'renders-en', `${id}.mp4`), vtt = src.replace('.mp4', '.vtt');
	video(src, path.join(SORTIE, `${id}.mp4`), '540:960', 30);
	fs.copyFileSync(vtt, path.join(SORTIE, `${id}.vtt`));
	image(src, path.join(SORTIE, `${id}.jpg`), debut(vtt, 2) + 1.2, '540:960');
	console.log('  ✓', id);
}
{
	const src = path.join(CAPSULES, 'global', 'renders-en', '00-saison.mp4'), vtt = src.replace('.mp4', '.vtt');
	video(src, path.join(SORTIE, '00-saison.mp4'), '1280:720', 30);
	fs.copyFileSync(vtt, path.join(SORTIE, '00-saison.vtt'));
	image(src, path.join(SORTIE, '00-saison.jpg'), quand(vtt, 'To be ready') + 2.6, '640:360');
	console.log('  ✓ 00-saison');
}
{
	const src = path.join(VITRINE, 'BaseballLineup-vitrine-en.mp4');
	video(src, path.join(ICI, 'BaseballLineup-vitrine-en-720.mp4'), '1280:720', 28);
	fs.copyFileSync(path.join(VITRINE, 'BaseballLineup-vitrine-en.vtt'), path.join(ICI, 'BaseballLineup-vitrine-en.vtt'));
	image(src, path.join(ICI, 'BaseballLineup-vitrine-en-apercu.jpg'), 45.6, '1280:720');
	console.log('  ✓ vitrine');
}
