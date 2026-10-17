// Assemble v2/index.html : le gabarit + les 8 ecrans de l'app recrees par Claude Design (ecrans/).
// Usage : node v2/construire.mjs   (APP = adresse de l'app, par defaut la v2 en ligne)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const APP = process.env.APP ?? 'https://baseballlineup-v2.vercel.app';
let page = fs.readFileSync(path.join(ICI, '_gabarit.html'), 'utf8').split('{{APP}}').join(APP);
for (let i = 0; i < 8; i++) {
	let ecran = fs.readFileSync(path.join(ICI, 'ecrans', `ecran-${i}.html`), 'utf8');
	// Coherence avec le lineup affiche : Leo B. frappe 8e, CF puis 2B (revue du 17 oct. 2026).
	ecran = ecran.split('Léo frappe 6e · SS et RF').join('Léo frappe 8e · CF et 2B');
	page = page.split(`{{ECRAN_${i}}}`).join(`<div aria-hidden="true">${ecran}</div>`);
}
if (/\{\{[A-Z_0-9]+\}\}/.test(page)) throw new Error('marqueur non remplace : ' + page.match(/\{\{[A-Z_0-9]+\}\}/)[0]);
fs.writeFileSync(path.join(ICI, 'index.html'), page);
console.log(`v2/index.html : ${Math.round(page.length / 1024)} Ko (app : ${APP})`);
