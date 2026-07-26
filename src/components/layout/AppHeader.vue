<script setup>
/**
 * AppHeader - 顶部导航栏
 * 固定在页面顶部，包含 Logo 与主题切换按钮
 * 使用 sticky 定位 + 背景模糊，保持内容可见的同时不遮挡视线
 */
import ThemeToggle from '@/components/interaction/ThemeToggle.vue';
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- 左侧：favicon + 标题 -->
      <a class="brand" href="/" aria-label="Komari Theme Market CN 首页">
        <img
          class="brand-icon"
          src="https://www.komari.wiki/assets/favicon.png"
          alt=""
          width="24"
          height="24"
        />
        <span class="brand-title">Komari Theme Market CN</span>
      </a>

      <!-- 右侧：主题切换 -->
      <div class="header-actions">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: var(--layout-header-height);
  background: color-mix(in srgb, var(--color-bg) 85%, transparent);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid var(--color-border);
}

.header-inner {
  max-width: var(--layout-content-max);
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

/* 左侧品牌区 */
.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text);
}
.brand:hover {
  color: var(--color-text);
}
.brand-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.brand-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧操作区 */
.header-actions {
  display: flex;
  align-items: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-inner {
    padding: 0 var(--spacing-md);
  }
  .brand-title {
    font-size: var(--font-size-base);
  }
}
</style>
