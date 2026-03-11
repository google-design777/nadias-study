const $ = (sel) => document.querySelector(sel);

function fmtDate(iso){
  try{
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch { return iso; }
}

function setActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]')?.forEach(a => {
    if(a.getAttribute('href') === path) a.classList.add('active');
  });
}

function loadTheme(){
  const saved = localStorage.getItem('theme');
  if(saved) document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

function postUrl(p){
  return `post.html?id=${encodeURIComponent(p.id)}`;
}

function renderCard(p){
  const tags = (p.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const mood = p.mood ? `• ${p.mood}` : '';
  return `
    <article class="card">
      <h3><a href="${postUrl(p)}">${p.title}</a></h3>
      <div class="meta">${fmtDate(p.date)} ${mood}</div>
      <p class="small">${p.excerpt || ''}</p>
      <div class="tags">${tags}</div>
    </article>
  `;
}

function getPosts(){
  return (window.POSTS || []).slice().sort((a,b) => (a.date < b.date ? 1 : -1));
}

function uniqueTags(posts){
  const set = new Set();
  posts.forEach(p => (p.tags || []).forEach(t => set.add(t)));
  return Array.from(set).sort((a,b) => a.localeCompare(b));
}

function mountHome(){
  const posts = getPosts();
  const pinned = posts.filter(p => p.pinned);
  const latest = posts.filter(p => !p.pinned).slice(0,6);

  const pinnedEl = $('#pinned');
  const latestEl = $('#latest');
  if(pinnedEl) pinnedEl.innerHTML = pinned.map(renderCard).join('') || '<p class="small">No pinned posts yet.</p>';
  if(latestEl) latestEl.innerHTML = latest.map(renderCard).join('') || '<p class="small">No posts yet.</p>';

  const randomBtn = $('#randomBtn');
  if(randomBtn){
    randomBtn.addEventListener('click', () => {
      const all = getPosts();
      const pick = all[Math.floor(Math.random() * all.length)];
      if(pick) location.href = postUrl(pick);
    });
  }
}

function mountWriting(pageTag){
  const posts = getPosts().filter(p => !pageTag || (p.tags || []).includes(pageTag));
  const list = $('#list');
  const q = $('#q');
  const tagsEl = $('#tagFilters');

  const tags = uniqueTags(getPosts()).filter(t => t !== 'Fragments');
  if(tagsEl){
    tagsEl.innerHTML = ['All', ...tags].map(t => {
      const active = (t === 'All' && !pageTag) || (t === pageTag);
      const href = t === 'All' ? 'writing.html' : `writing.html?tag=${encodeURIComponent(t)}`;
      return `<a class="tag" href="${href}" style="${active ? 'border-color: var(--accent); color: var(--text);' : ''}">${t}</a>`;
    }).join('');
  }

  function apply(){
    const term = (q?.value || '').trim().toLowerCase();
    const filtered = posts.filter(p => {
      if(!term) return true;
      const hay = [p.title, p.excerpt, ...(p.content||[])].join(' ').toLowerCase();
      return hay.includes(term);
    });
    list.innerHTML = filtered.map(renderCard).join('') || '<p class="small">No matches.</p>';
  }

  if(q){
    q.addEventListener('input', apply);
    q.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){ q.value=''; apply(); }
    });
  }
  apply();
}

function mountFragments(){
  const posts = getPosts().filter(p => (p.tags || []).includes('Fragments'));
  const list = $('#list');
  list.innerHTML = posts.map(renderCard).join('') || '<p class="small">No fragments yet.</p>';

  const randomBtn = $('#randomBtn');
  if(randomBtn){
    randomBtn.addEventListener('click', () => {
      const pick = posts[Math.floor(Math.random() * posts.length)];
      if(pick) location.href = postUrl(pick);
    });
  }
}

function mountPost(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const post = getPosts().find(p => p.id === id);
  const root = $('#post');

  if(!post){
    root.innerHTML = `<div class="card"><h3>Not found</h3><p class="small">That post doesn’t exist.</p><p><a href="writing.html">Back to Writing</a></p></div>`;
    return;
  }

  const tags = (post.tags||[]).map(t => `<span class="tag">${t}</span>`).join('');
  const mood = post.mood ? ` • ${post.mood}` : '';
  const paras = (post.content || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');

  root.innerHTML = `
    <article class="reader">
      <h1>${escapeHtml(post.title)}</h1>
      <div class="meta">${fmtDate(post.date)}${mood}</div>
      <div class="tags" style="margin-bottom:16px">${tags}</div>
      ${paras}
      <div style="margin-top:22px" class="small">
        <a href="writing.html">← Back to Writing</a>
      </div>
    </article>
  `;
}

function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

// boot
loadTheme();
setActiveNav();

window.addEventListener('DOMContentLoaded', () => {
  const themeBtn = $('#themeBtn');
  if(themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const page = document.body.getAttribute('data-page');
  if(page === 'home') mountHome();
  if(page === 'writing'){
    const params = new URLSearchParams(location.search);
    const tag = params.get('tag');
    mountWriting(tag);
  }
  if(page === 'fragments') mountFragments();
  if(page === 'post') mountPost();
});
