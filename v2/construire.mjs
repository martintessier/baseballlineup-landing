// Assemble v2/index.html : le gabarit + les 8 ecrans de l'app recrees par Claude Design (ecrans/).
// Usage : node v2/construire.mjs   (APP = adresse de l'app, par defaut la v2 en ligne)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const APP = process.env.APP ?? 'https://baseballlineup-v2.vercel.app';
// Memes traces que ONGLETS dans v2/src/routes/presences/[jeton]/+page.svelte (app).
const ONGLETS = [
	['Accueil', 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z'],
	['Horaire', 'M4 6h16M4 6v14h16V6M8 3v6M16 3v6M8 13h3'],
	['Lineup', 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01'],
	['Chat', 'M4 5h16v11H9l-5 4z'],
	['Plus', 'M5 12h.01M12 12h.01M19 12h.01']
];
const BARRE_PARENTS =
	'<div style="margin-top: auto; display: flex; justify-content: space-around; padding-top: 6px; border-top: 1px solid rgba(20, 23, 26, 0.08);">' +
	ONGLETS.map(([nom, d], i) => {
		const actif = i === 0;
		const couleur = actif ? 'rgb(20, 23, 26)' : 'rgb(106, 114, 108)';
		return `<span style="display: flex; flex-direction: column; align-items: center; gap: 2px; font: ${actif ? 700 : 500} 8.5px 'Space Grotesk'; color: ${couleur};">` +
			`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="${nom === 'Plus' ? 3 : 1.8}" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>${nom}</span>`;
	}).join('') +
	'</div>';
let page = fs.readFileSync(path.join(ICI, '_gabarit.html'), 'utf8').split('{{APP}}').join(APP);
for (let i = 0; i < 8; i++) {
	if (!page.includes(`{{ECRAN_${i}}}`)) continue; // ecran retire de la page (ex. 2 = selection des pages PDF)
	let ecran = fs.readFileSync(path.join(ICI, 'ecrans', `ecran-${i}.html`), 'utf8');
	// Coherence avec le lineup affiche : Leo B. frappe 8e, CF puis 2B (revue du 17 oct. 2026).
	ecran = ecran.split('Léo frappe 6e · SS et RF').join('Léo frappe 8e · 4 positions');
	// Barre du bas de la Page Info Parents : les 5 icones de la vraie app (presences/[jeton]), pas seulement des mots.
	ecran = ecran.replace(/<div style="margin-top: auto; display: flex; justify-content: space-around;[^"]*">(?:<span[^>]*>(?:Accueil|Horaire|Chat|Plus)<\/span>)+<\/div>/, BARRE_PARENTS);
	page = page.split(`{{ECRAN_${i}}}`).join(`<div aria-hidden="true">${ecran}</div>`);
}
if (/\{\{[A-Z_0-9]+\}\}/.test(page)) throw new Error('marqueur non remplace : ' + page.match(/\{\{[A-Z_0-9]+\}\}/)[0]);
fs.writeFileSync(path.join(ICI, 'index.html'), page);
console.log(`v2/index.html : ${Math.round(page.length / 1024)} Ko (app : ${APP})`);
