/**
 * 主题数据组合式函数
 * 从 v1.json 加载主题列表，提供搜索、筛选、统计能力
 * 使用相对路径 ./v1.json 以避免 CORS 并支持多域名部署
 */
import { ref, computed } from 'vue';

const SOURCE_URL = 'https://komari-market.mikus.ink/v1.json';

const themes = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const loaded = ref(false);

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeTheme(theme) {
  const name = theme.name?.['zh-CN'] || theme.name?.en || theme.short || '未命名主题';
  return {
    ...theme,
    _displayName: escapeHtml(name),
    _displayAuthor: escapeHtml(theme.author || '未知'),
    _displayDescription: escapeHtml(theme.description || ''),
    _displayVersion: escapeHtml(theme.version || ''),
  };
}

async function fetchThemes() {
  if (loading.value) return;
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('./v1.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    themes.value = (data.themes || []).map(normalizeTheme);
    loaded.value = true;
  } catch (e) {
    error.value = e.message;
    // 回退到绝对 URL
    try {
      const response = await fetch(SOURCE_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      themes.value = (data.themes || []).map(normalizeTheme);
      loaded.value = true;
      error.value = null;
    } catch (e2) {
      error.value = e2.message;
    }
  } finally {
    loading.value = false;
  }
}

export function useThemes() {
  const filteredThemes = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return themes.value;
    return themes.value.filter((t) => {
      const name = (t.name?.['zh-CN'] || t.name?.en || t.short || '').toLowerCase();
      const author = (t.author || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      return name.includes(q) || author.includes(q) || desc.includes(q);
    });
  });

  const stats = computed(() => ({
    total: themes.value.length,
    authors: new Set(themes.value.map((t) => t.author).filter(Boolean)).size,
    withPreview: themes.value.filter((t) => t.preview).length,
    withDownload: themes.value.filter((t) => t.download).length,
  }));

  return {
    themes,
    filteredThemes,
    stats,
    loading,
    error,
    loaded,
    searchQuery,
    fetchThemes,
    SOURCE_URL,
  };
}
