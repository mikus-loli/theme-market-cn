/**
 * 主题切换组合式函数
 * 使用 localStorage 存储，支持 light / dark，回退到系统偏好
 */
import { ref, onMounted, onUnmounted } from 'vue';

const STORAGE_KEY = 'theme';
const themeRef = ref('light');

let initialized = false;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (_) {}
  return null;
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initTheme() {
  if (initialized) return;
  initialized = true;
  themeRef.value = getStoredTheme() || getSystemTheme();
  applyTheme(themeRef.value);

  // 监听系统主题变化（仅当用户未显式设置时跟随）
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getStoredTheme()) {
      themeRef.value = e.matches ? 'dark' : 'light';
      applyTheme(themeRef.value);
    }
  });
}

export function useTheme() {
  initTheme();

  const toggle = () => {
    themeRef.value = themeRef.value === 'dark' ? 'light' : 'dark';
    applyTheme(themeRef.value);
    try {
      localStorage.setItem(STORAGE_KEY, themeRef.value);
    } catch (_) {}
  };

  const setTheme = (value) => {
    if (value !== 'light' && value !== 'dark') return;
    themeRef.value = value;
    applyTheme(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  };

  return { theme: themeRef, toggle, setTheme };
}
