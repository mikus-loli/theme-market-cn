<script setup>
/**
 * ThemeSourceHero - 主题源 Hero 展示卡片
 * 页面顶部的醒目区域，使用渐变背景展示主题源地址与在线状态
 * 左侧为标题与说明，右侧为只读 URL 输入框与复制按钮
 */
import { useThemes } from '@/composables/useThemes';
import CopyButton from '@/components/interaction/CopyButton.vue';

const { SOURCE_URL } = useThemes();
</script>

<template>
  <section class="theme-hero">
    <div class="hero-content">
      <!-- 左侧：标题与说明 -->
      <div class="hero-text">
        <div class="hero-title-row">
          <h2 class="hero-title">Komari 主题源</h2>
          <span class="status-badge">
            <span class="status-dot" aria-hidden="true"></span>
            <span class="status-label">在线</span>
          </span>
        </div>
        <p class="hero-desc">通过 EdgeOne 加速，国内访问更快更稳定</p>
      </div>

      <!-- 右侧：URL 输入框 + 复制按钮 -->
      <div class="hero-url">
        <input
          class="url-input"
          type="text"
          :value="SOURCE_URL"
          readonly
          aria-label="主题源地址"
        />
        <CopyButton :text="SOURCE_URL" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.theme-hero {
  background: var(--gradient-hero);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2xl);
  color: #ffffff;
  overflow: hidden;
  position: relative;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  align-items: center;
}

/* 左侧文字 */
.hero-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.hero-title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.hero-title {
  font-size: var(--font-size-3xl);
  color: #ffffff;
  letter-spacing: -0.02em;
}

/* 在线状态徽标 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px var(--spacing-sm);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* 绿色脉动圆点，表示在线 */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.hero-desc {
  font-size: var(--font-size-md);
  color: rgba(255, 255, 255, 0.9);
  line-height: var(--line-height-base);
}

/* 右侧 URL 区域 */
.hero-url {
  display: flex;
  align-items: stretch;
  gap: var(--spacing-sm);
}

.url-input {
  flex: 1;
  min-width: 0;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-md);
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.url-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.2);
}

/* 响应式：移动端改为上下布局 */
@media (max-width: 768px) {
  .theme-hero {
    padding: var(--spacing-xl);
  }
  .hero-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  .hero-title {
    font-size: var(--font-size-2xl);
  }
  .hero-url {
    width: 100%;
  }
}
</style>
