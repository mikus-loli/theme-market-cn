const SOURCE_URL = 'https://komari-market.mikus.ink/v1.json';

const state = {
  themes: [],
  query: '',
};

const $ = (selector) => document.querySelector(selector);
const elements = {
  root: document.documentElement,
  themeList: $('#theme-list'),
  themeCount: $('#theme-count'),
  syncTime: $('#sync-time'),
  visibleCount: $('#visible-count'),
  searchInput: $('#search-input'),
  themeToggle: $('#theme-toggle'),
  copyButton: $('#copy-button'),
  copyText: $('#copy-text'),
  sourceUrl: $('#source-url'),
  backToTop: $('#back-to-top'),
  toastRegion: $('#toast-region'),
  metaThemeColor: document.querySelector('meta[name="theme-color"]'),
};

function text(value, fallback = '') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function pickLocale(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value['zh-CN'] || value.en || Object.values(value)[0] || fallback;
}

function escapeHtml(value) {
  return text(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatRelativeTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff) || diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)} 天前`;
  return date.toLocaleDateString('zh-CN');
}

function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* --- Toast Notification (macOS style) --- */
function toast(message, type = 'success') {
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.textContent = message;
  elements.toastRegion.append(node);
  setTimeout(() => {
    node.classList.add('is-leaving');
    node.addEventListener('animationend', () => node.remove(), { once: true });
  }, 2800);
}

/* --- Skeleton Loading --- */
function renderSkeleton(count = 6) {
  elements.themeList.innerHTML = Array.from({ length: count }, () => `
    <article class="skeleton-card" aria-hidden="true">
      <div class="skeleton-preview"></div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    </article>
  `).join('');
}

/* --- State Messages --- */
function renderState(message, icon = '') {
  elements.themeList.innerHTML = `
    <div class="state">
      ${icon ? `<div aria-hidden="true">${icon}</div>` : '<div class="spinner" aria-hidden="true"></div>'}
      <div>${message}</div>
    </div>
  `;
}

/* --- Theme Card Creation --- */
function createThemeCard(theme, index) {
  const name = pickLocale(theme.name, '未命名主题');
  const description = pickLocale(theme.description, '暂无描述');
  const author = pickLocale(theme.author, '匿名');
  const preview = text(theme.preview);
  const download = text(theme.download, '#');
  const repo = text(theme.url, '#');
  const version = text(theme.version);
  const short = text(theme.short);

  const card = document.createElement('article');
  card.className = 'theme-card';
  card.style.animationDelay = `${Math.min(index * 40, 400)}ms`;
  card.innerHTML = `
    <div class="preview-wrap">
      <img src="${escapeHtml(preview)}" alt="${escapeHtml(name)}" loading="lazy">
      <div class="preview-fallback">预览图加载失败</div>
      ${version ? `<span class="version-badge">v${escapeHtml(version)}</span>` : ''}
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(name)}</h3>
      <p class="card-desc">${escapeHtml(description)}</p>
      <div class="card-meta">
        <span>${escapeHtml(author)}</span>
        ${short ? `<span>${escapeHtml(short)}</span>` : '<span></span>'}
      </div>
      <div class="theme-actions">
        <a class="theme-button secondary" href="${escapeHtml(repo)}" target="_blank" rel="noopener">详情</a>
        <a class="theme-button" href="${escapeHtml(download)}" download>下载</a>
      </div>
    </div>
  `;

  const image = card.querySelector('img');
  image.addEventListener('error', () => {
    image.remove();
    card.querySelector('.preview-fallback').style.display = 'grid';
  }, { once: true });

  card.querySelector('.theme-button:not(.secondary)').addEventListener('click', () => {
    toast(`开始下载：${name}`);
  });

  return card;
}

/* --- Filter & Render --- */
function filterThemes() {
  const query = state.query.trim().toLowerCase();
  if (!query) return state.themes;
  return state.themes.filter((theme) => {
    const haystack = [
      pickLocale(theme.name),
      pickLocale(theme.description),
      pickLocale(theme.author),
      theme.short,
      theme.version,
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });
}

function renderThemes() {
  const themes = filterThemes();
  elements.visibleCount.textContent = `${themes.length} / ${state.themes.length} 个主题`;
  if (!themes.length) {
    renderState('没有找到匹配的主题', '🔍');
    return;
  }
  elements.themeList.replaceChildren(...themes.map(createThemeCard));
}

/* --- Load Themes --- */
async function loadThemes() {
  renderSkeleton();
  try {
    const response = await fetch('./v1.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.themes = Array.isArray(data.themes) ? data.themes : [];
    elements.themeCount.textContent = state.themes.length;
    elements.syncTime.textContent = formatRelativeTime(data.updated_at);
    renderThemes();
  } catch (error) {
    console.error('加载主题失败:', error);
    elements.themeCount.textContent = '-';
    elements.syncTime.textContent = '-';
    elements.visibleCount.textContent = '加载失败';
    renderState('加载主题失败，请刷新页面重试', '⚠️');
    toast('加载主题失败', 'error');
  }
}

/* --- Theme Switching (macOS light/dark) --- */
function applyTheme(theme) {
  if (theme === 'dark') {
    elements.root.setAttribute('data-theme', 'dark');
    elements.metaThemeColor.content = '#1c1c1e';
  } else {
    elements.root.removeAttribute('data-theme');
    elements.metaThemeColor.content = '#f5f5f7';
  }
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
  } else {
    localStorage.removeItem('theme');
    applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  elements.themeToggle.addEventListener('click', () => {
    const next = elements.root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
}

/* --- Copy Source URL --- */
async function copySourceUrl() {
  const value = elements.sourceUrl.textContent.trim() || SOURCE_URL;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  elements.copyButton.classList.add('is-copied');
  elements.copyText.textContent = '已复制';
  toast('主题源地址已复制');
  setTimeout(() => {
    elements.copyButton.classList.remove('is-copied');
    elements.copyText.textContent = '复制';
  }, 2000);
}

/* --- Initialize Events --- */
function initEvents() {
  elements.sourceUrl.textContent = SOURCE_URL;
  elements.copyButton.addEventListener('click', copySourceUrl);

  elements.searchInput.addEventListener('input', debounce((event) => {
    state.query = event.target.value;
    renderThemes();
  }));

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        elements.backToTop.classList.toggle('is-visible', window.scrollY > 360);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  elements.backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --- Boot --- */
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initEvents();
  loadThemes();
});
