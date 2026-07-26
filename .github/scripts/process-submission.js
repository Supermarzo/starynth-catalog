/**
 * process-submission.js
 * Traite automatiquement une "Issue" de proposition de mod (formulaire
 * .github/ISSUE_TEMPLATE/submit-mod.yml) :
 *  - parse les champs du formulaire
 *  - télécharge le .rsm (renommé en .zip par l'utilisateur) et l'icône
 *  - ajoute/actualise l'entrée dans catalog.json
 *  - commit + push directement sur main (pas de validation manuelle)
 *  - commente et ferme l'issue (ou commente une erreur claire sans la fermer)
 *
 * Lancé par .github/workflows/process-submission.yml sur chaque nouvelle
 * issue labellisée "mod-submission".
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ISSUE_BODY = process.env.ISSUE_BODY || '';
const ISSUE_NUMBER = process.env.ISSUE_NUMBER;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO; // ex: "Supermarzo/starynth-catalog"

const API_BASE = `https://api.github.com/repos/${REPO}`;

function apiHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };
}

async function commentOnIssue(body) {
  await fetch(`${API_BASE}/issues/${ISSUE_NUMBER}/comments`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({ body })
  });
}

async function closeIssue() {
  await fetch(`${API_BASE}/issues/${ISSUE_NUMBER}`, {
    method: 'PATCH',
    headers: apiHeaders(),
    body: JSON.stringify({ state: 'closed', labels: ['mod-submission', 'accepted'] })
  });
}

async function markNeedsFix() {
  await fetch(`${API_BASE}/issues/${ISSUE_NUMBER}`, {
    method: 'PATCH',
    headers: apiHeaders(),
    body: JSON.stringify({ labels: ['mod-submission', 'needs-fix'] })
  });
}

/** Parse le corps d'une issue générée par un formulaire GitHub (### Label\nValeur). */
function parseIssueForm(body) {
  const sections = {};
  const re = /### (.+?)\n([\s\S]*?)(?=\n### |$)/g;
  let m;
  while ((m = re.exec(body))) {
    const value = m[2].trim();
    sections[m[1].trim()] = value === '_No response_' ? '' : value;
  }
  return sections;
}

function extractAttachmentUrl(fieldText, extensions) {
  if (!fieldText) return null;
  const re = new RegExp(`https:\\/\\/\\S+\\.(${extensions.join('|')})`, 'i');
  const match = fieldText.match(re);
  return match ? match[0] : null;
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `mod-${Date.now()}`;
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement échoué (HTTP ${res.status}) pour ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buffer);
}

async function main() {
  const fields = parseIssueForm(ISSUE_BODY);

  const name = fields['Nom du mod'];
  const author = fields['Auteur (ton pseudo)'];
  const version = fields['Version du mod'];
  const gameVersion = fields['Version de SMATRS ciblée'];
  const description = fields['Description'];
  const tags = (fields['Tags (séparés par des virgules, optionnel)'] || '')
    .split(',').map(t => t.trim()).filter(Boolean);
  const dependencies = (fields["Dépendances (identifiants d'autres mods du catalogue, séparés par des virgules, optionnel)"] || '')
    .split(',').map(t => t.trim()).filter(Boolean);
  const rsmField = fields['Fichier du mod'];
  const iconField = fields['Icône (PNG, optionnel)'];

  const missing = [];
  if (!name) missing.push('Nom du mod');
  if (!author) missing.push('Auteur');
  if (!version) missing.push('Version du mod');
  if (!gameVersion) missing.push('Version de SMATRS ciblée');
  if (!description) missing.push('Description');

  const rsmUrl = extractAttachmentUrl(rsmField, ['zip']);
  if (!rsmUrl) missing.push('Fichier du mod (doit être un .zip attaché — pas un lien externe)');

  if (missing.length > 0) {
    await commentOnIssue(
      `❌ Impossible de traiter cette proposition automatiquement, il manque : \n\n` +
      missing.map(m => `- ${m}`).join('\n') +
      `\n\nModifie le premier message de cette issue (bouton crayon en haut) puis rouvre-la (ou recrée le formulaire) pour relancer le traitement.`
    );
    await markNeedsFix();
    return;
  }

  const id = slugify(name);
  const rsmPath = `mods/${id}.rsm`;
  const iconUrl = extractAttachmentUrl(iconField, ['png', 'jpg', 'jpeg']);
  const iconPath = iconUrl ? `icons/${id}${path.extname(new URL(iconUrl).pathname)}` : null;

  try {
    await downloadFile(rsmUrl, rsmPath);
    if (iconPath) await downloadFile(iconUrl, iconPath);
  } catch (err) {
    await commentOnIssue(`❌ Erreur lors du téléchargement du fichier : ${err.message}\n\nVérifie que le fichier est bien joint en pièce jointe (glissé-déposé), pas juste collé en lien.`);
    await markNeedsFix();
    return;
  }

  const catalogPath = 'catalog.json';
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  const entry = {
    id,
    name,
    author,
    version,
    gameVersion,
    description,
    tags,
    dependencies,
    iconUrl: iconPath ? `https://raw.githubusercontent.com/${REPO}/main/${iconPath}` : '',
    downloadUrl: `https://raw.githubusercontent.com/${REPO}/main/${rsmPath}`,
    updatedAt: new Date().toISOString().slice(0, 10)
  };

  const existingIndex = catalog.findIndex(m => m.id === id);
  if (existingIndex >= 0) catalog[existingIndex] = entry;
  else catalog.push(entry);

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');

  // On n'ajoute à git QUE les chemins qui existent réellement (ex: pas de
  // dossier icons/ si aucune icône n'a été jointe), sinon `git add` échoue
  // entièrement dès qu'un seul chemin est introuvable.
  const pathsToAdd = [rsmPath, iconPath, catalogPath].filter(p => p && fs.existsSync(p));

  execSync('git config user.name "starynth-bot"');
  execSync('git config user.email "actions@github.com"');
  execSync(`git add ${pathsToAdd.map(p => `"${p}"`).join(' ')}`);
  execSync(`git commit -m "Ajout du mod: ${name} (via issue #${ISSUE_NUMBER})"`);
  execSync('git push');

  await commentOnIssue(
    `✅ "${name}" a été ajouté au catalogue ! Il apparaîtra dans Starynth (onglet Découvrir) et sur le site dans quelques instants.\n\n` +
    `Pour publier une mise à jour de ce mod, ouvre une nouvelle proposition avec le même nom.`
  );
  await closeIssue();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await commentOnIssue(`❌ Une erreur inattendue est survenue pendant le traitement : \`${err.message}\`. @Supermarzo peut regarder les logs de l'Action pour plus de détails.`);
    await markNeedsFix();
  } catch (_) { /* ignore */ }
  process.exitCode = 1;
});
