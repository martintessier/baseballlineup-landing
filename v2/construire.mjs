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
// Le lineup du match de la vitrine (aussi dans la feuille du marqueur et l'ecran Preparer) :
// joueur -> positions M1..M6. 9 positions + 1 banc par manche (verifie ci-dessous).
// Sortie du VRAI moteur de l'app (genererAlignement, 11UB, saison, lanceurs 2-2-2 Mathis/Arnaud/Jacob, Thomas reserviste),
// regeneree le 17 oct. 2026 (Martin : la grille faite a la main n'etait pas equitable). Ne pas retoucher a la main.
const JOUEURS = [
	['Jacob', 8, ['1B', '2B', 'CF', 'banc', 'P', 'P']],
	['Samuel', 5, ['banc', 'RF', 'SS', '2B', 'SS', 'CF']],
	['Émile', 21, ['3B', 'CF', 'banc', '1B', 'C', 'LF']],
	['Arnaud', 34, ['CF', 'banc', 'P', 'P', 'RF', 'C']],
	['Nathan', 16, ['LF', 'SS', 'RF', 'C', '1B', '3B']],
	['Édouard', 7, ['2B', 'LF', '1B', '3B', 'LF', 'banc']],
	['Léo', 11, ['SS', 'C', '3B', 'RF', 'CF', 'SS']],
	['Noah', 29, ['RF', '1B', '2B', 'LF', 'banc', '2B']],
	['Mathis', 1, ['P', 'P', 'C', 'SS', '3B', 'RF']],
	['Thomas', 35, ['C', '3B', 'LF', 'CF', '2B', '1B']]
];
// Positions en developpement (surlignees comme dans l'app) : Edouard vise 2B, Thomas vise C.
const DEV = [['Édouard', 0], ['Thomas', 0]];
const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
for (let m = 0; m < 6; m++) {
	const v = JOUEURS.map((j) => j[2][m]).sort().join();
	if (v !== [...POSITIONS, 'banc'].sort().join()) throw new Error('manche ' + (m + 1) + ' invalide : ' + v);
}
const tableau = (classe) => {
	const M = [0, 1, 2, 3, 4, 5];
	const cellule = ([prenom, num], m) => {
		const dev = DEV.some(([p, mm]) => p === prenom && mm === m);
		return '<td' + (dev ? ' class="dev"' : '') + '><b>#' + num + '</b> <span>' + prenom + '</span></td>';
	};
	return '<table class="pxm ' + classe + '"><thead><tr><th>Pos</th>' + M.map((m) => '<th>M' + (m + 1) + '</th>').join('') + '</tr></thead><tbody>' +
		POSITIONS.map((pos) => '<tr><th>' + pos + '</th>' + M.map((m) => cellule(JOUEURS.find((j) => j[2][m] === pos), m)).join('') + '</tr>').join('') +
		'<tr class="banc"><th>Banc</th>' + M.map((m) => '<td>' + JOUEURS.filter((j) => j[2][m] === 'banc').map((j) => '<span>' + j[0] + '</span>').join(' ') + '</td>').join('') + '</tr>' +
		'</tbody></table>';
};
let page = fs.readFileSync(path.join(ICI, '_gabarit.html'), 'utf8').split('{{APP}}').join(APP);
for (let i = 0; i < 9; i++) {
	if (!page.includes(`{{ECRAN_${i}}}`)) continue; // ecran retire de la page (ex. 2 = selection des pages PDF)
	let ecran = fs.readFileSync(path.join(ICI, 'ecrans', `ecran-${i}.html`), 'utf8');
	// Barre du bas de la Page Info Parents : les 5 icones de la vraie app (presences/[jeton]), pas seulement des mots.
	ecran = ecran.replace(/<div style="margin-top: auto; display: flex; justify-content: space-around;[^"]*">(?:<span[^>]*>(?:Accueil|Horaire|Chat|Plus)<\/span>)+<\/div>/, BARRE_PARENTS);
	page = page.split(`{{ECRAN_${i}}}`).join(`<div aria-hidden="true">${ecran}</div>`);
}
page = page.split('{{TABLEAU_ORDI}}').join(tableau('ordi')).split('{{TABLEAU_TEL}}').join(tableau('tel'));
if (/\{\{[A-Z_0-9]+\}\}/.test(page)) throw new Error('marqueur non remplace : ' + page.match(/\{\{[A-Z_0-9]+\}\}/)[0]);
fs.writeFileSync(path.join(ICI, 'index.html'), page);
// Garde-fou : les temoignages de maquette ne doivent pas partir a la bascule.
if (page.includes('TEMOIGNAGES_FICTIFS')) console.warn('⚠ Témoignages FICTIFS dans la page : à remplacer par de vrais témoignages avant la bascule.');
console.log(`v2/index.html : ${Math.round(page.length / 1024)} Ko (app : ${APP})`);

// Page des capsules video (capsules.html) : _capsules.html + la liste ci-dessous (memes titres que l'app v2,
// src/lib/decouvrir/capsules.ts). Fichiers dans video/capsules/<id>.mp4|jpg|vtt (Documentation/demo/capsules de l'app).
const CAPSULES = [
	['01-equipe', 41, 'Votre équipe en 2 minutes', 'Your team in 2 minutes', 'Le nom, la catégorie, les joueurs et leurs positions : votre équipe est prête.', 'The name, the category, the players and their positions: your team is ready.', 40],
	['02-lineup', 77, 'Le lineup équitable', 'The fair lineup', 'Les absents déjà notés, un réserviste au besoin, le temps de jeu partagé et les règles BQ vérifiées. Puis vous peaufinez, même avec un absent de dernière minute.', 'Absences already noted, an affiliated player if needed, shared playing time and Baseball Québec rules checked. Then you fine-tune, even with a last-minute absence.', 74],
	['03-ia', 34, 'Demandez-le à l’IA', 'Ask the AI', 'Écrivez ce que vous voulez comme vous le diriez. L’app règle les options et vérifie les règles.', 'Write what you want the way you’d say it. The app sets the options and checks the rules.', 33],
	['04-jour-de-match', 57, 'Le jour du match', 'Game day', 'La fiche de l’adversaire, les feuilles pour l’arbitre et les marqueurs, et L’iArbitre en cas de doute.', 'The opponent report, the sheets for the umpire and scorekeepers, and UmpBot when in doubt.', 55],
	['05-tracker', 47, 'Le tracker au bâton', 'The batting tracker', 'Notez chaque présence au bâton en deux touches à l’écran. Les stats se calculent toutes seules.', 'Record each plate appearance with two taps on the screen. The stats calculate themselves.', 44],
	['06-lanceurs', 52, 'Les lanceurs', 'Pitchers', 'Automatique selon les règles, ou votre rotation. Dès le 1er juillet, les plafonds s’ajustent.', 'Automatic according to the rules, or your own rotation. From July 1, the limits adjust.', 49],
	['07-adversaire', 34, 'La fiche adversaire', 'The opponent report', 'Son bilan, sa forme, ses lanceurs, et ce que vous avez noté contre lui.', 'Their record, their form, their pitchers, and what you noted against them.', 31],
	['08-parents', 61, 'La Page Info Parents', 'The Parent Info Page', 'Horaire, présences, lineup, stats de leur enfant et messages : tout à une seule place.', 'Schedule, attendance, lineup, their child’s stats and messages: all in one place.', 59],
	['09-pratiques', 60, 'Les pratiques', 'Practices', 'Une banque d’exercices, une pratique planifiée en une minute, et le vote des coachs par courriel.', 'A drill bank, a practice planned in a minute, and coaches voting by email.', 56],
	['10-evaluations', 49, 'Évaluations et fin de saison', 'Evaluations and end of season', 'Quelques secondes par joueur après chaque match, pour bien le placer et le faire progresser.', 'A few seconds per player, after each game, to place them well and help them improve.', 46],
	['11-series', 26, 'Prêts pour les séries', 'Ready for the playoffs', 'L’éligibilité de chaque joueur, suivie match après match.', 'Each player’s eligibility, tracked game after game.', 26]
];
const duree = (s) => (s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')}` : `${s} s`);
const blocs = CAPSULES.map(([id, s, fr, en, dfr, den, sEn], i) => {
	const suiv = CAPSULES[i + 1];
	return `		<article class="capsule" id="${id}">
` +
		`			<div class="texte"><p class="no">CAPSULE ${id.slice(0, 2)} <span data-en="${duree(sEn)}">${duree(s)}</span></p><h3 data-en="${en}">${fr}</h3><p data-en="${den}">${dfr}</p>` +
		(suiv ? `<a class="suite" href="#${suiv[0]}" data-en="Next: ${suiv[3]} ↓">Suivante : ${suiv[2]} ↓</a>` : '') + `</div>
` +
		`			<div class="tel"><video controls playsinline preload="none" poster="video/capsules/${id}.jpg" data-en-poster="video/capsules-en/${id}.jpg" aria-label="${fr}" data-en-aria-label="${en}"><source src="video/capsules/${id}.mp4" data-en-src="video/capsules-en/${id}.mp4" type="video/mp4"><track kind="subtitles" src="video/capsules/${id}.vtt" data-en-src="video/capsules-en/${id}.vtt" srclang="fr" label="Français"></video></div>
` +
		`		</article>`;
}).join('\n');
for (const [id] of [['00-saison'], ...CAPSULES]) for (const dossier of ['capsules', 'capsules-en']) for (const ext of ['mp4', 'jpg', 'vtt']) if (!fs.existsSync(path.join(ICI, 'video', dossier, `${id}.${ext}`))) throw new Error(`capsule manquante : ${dossier}/${id}.${ext}`);
const pageCapsules = fs.readFileSync(path.join(ICI, '_capsules.html'), 'utf8').split('{{APP}}').join(APP).split('{{CAPSULES}}').join(blocs);
if (/\{\{[A-Z_0-9]+\}\}/.test(pageCapsules)) throw new Error('marqueur non remplace (capsules) : ' + pageCapsules.match(/\{\{[A-Z_0-9]+\}\}/)[0]);
fs.writeFileSync(path.join(ICI, 'capsules.html'), pageCapsules);
console.log(`v2/capsules.html : ${CAPSULES.length} capsules`);
