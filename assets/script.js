/**
 * script.js — page GitHub Pages du catalogue Starynth.
 * Charge catalog.json et affiche les mods disponibles, avec recherche.
 */

const REPO_RAW_BASE = 'https://raw.githubusercontent.com/Supermarzo/starynth-catalog/main';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function modCardHtml(mod) {
  const tags = (mod.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
  return `
    <div class="mod-card">
      ${mod.iconUrl ? `<img class="icon" src="${mod.iconUrl}" alt="" />` : `<div class="icon"></div>`}
      <div class="body">
        <h4>${escapeHtml(mod.name)}</h4>
        <p class="meta">Par ${escapeHtml(mod.author)} · SMATRS ${escapeHtml(mod.gameVersion || '?')}</p>
        <p class="desc">${escapeHtml(mod.description || '')}</p>
        ${tags}
      </div>
    </div>
  `;
}

async function loadMods() {
  const grid = document.getElementById('mods-grid');
  const countEl = document.getElementById('mods-count');

  try {
    const res = await fetch('./catalog.json', { cache: 'no-store' });
    const mods = await res.json();

    if (!mods.length) {
      grid.innerHTML = `<div class="empty-note">Le catalogue est vide pour le moment — sois le premier à publier un mod !</div>`;
      countEl.textContent = '0 mod';
      return;
    }

    countEl.textContent = `${mods.length} mod${mods.length > 1 ? 's' : ''}`;
    render(mods);

    document.getElementById('mods-search').addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = !q ? mods : mods.filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.author || '').toLowerCase().includes(q) ||
        (m.tags || []).some(t => t.toLowerCase().includes(q))
      );
      render(filtered);
    });

    function render(list) {
      grid.innerHTML = list.length
        ? list.map(modCardHtml).join('')
        : `<div class="empty-note">Aucun mod ne correspond à ta recherche.</div>`;
    }
  } catch (err) {
    grid.innerHTML = `<div class="empty-note">Impossible de charger le catalogue pour le moment.</div>`;
  }
}

function setupCopyButton() {
  const btn = document.getElementById('copy-template-btn');
  const template = document.getElementById('json-template').textContent;
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(template).then(() => {
      const original = btn.textContent;
      btn.textContent = '✓ Copié !';
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  });
}

function setupStarfield() {
  const field = document.getElementById('starfield');
  const count = 40;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3.5}s`;
    field.appendChild(star);
  }
}

loadMods();
setupCopyButton();
setupStarfield();
