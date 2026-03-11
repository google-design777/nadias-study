// Nadia's Study — small client-side helpers

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

loadTheme();

window.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeBtn');
  if(themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Random post (home)
  const randomBtn = document.getElementById('randomBtn');
  if(randomBtn && Array.isArray(window.__POST_URLS__) && window.__POST_URLS__.length){
    randomBtn.addEventListener('click', () => {
      const urls = window.__POST_URLS__;
      const pick = urls[Math.floor(Math.random() * urls.length)];
      if(pick) location.href = pick;
    });
  }

  // Random fragment
  const randomFragBtn = document.getElementById('randomFragmentBtn');
  if(randomFragBtn && Array.isArray(window.__FRAGMENT_URLS__) && window.__FRAGMENT_URLS__.length){
    randomFragBtn.addEventListener('click', () => {
      const urls = window.__FRAGMENT_URLS__;
      const pick = urls[Math.floor(Math.random() * urls.length)];
      if(pick) location.href = pick;
    });
  }
});
