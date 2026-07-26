<script setup>
/**
 * ThemeToggle - 主题切换按钮
 * 使用 useTheme() 组合式函数，根据当前主题显示对应图标
 * 暗色模式显示太阳图标（点击切到亮色），亮色模式显示月亮图标（点击切到暗色）
 */
import { useTheme } from '@/composables/useTheme';

const { theme, toggle } = useTheme();
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'"
    :title="theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'"
    @click="toggle"
  >
    <!-- 切换图标，带旋转 + 淡入淡出过渡 -->
    <Transition name="icon-rotate" mode="out-in">
      <svg
        v-if="theme === 'dark'"
        key="sun"
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        v-else
        key="moon"
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </Transition>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
}

.icon {
  width: 20px;
  height: 20px;
}

/* 图标旋转 180deg + 淡入淡出过渡 */
.icon-rotate-enter-active,
.icon-rotate-leave-active {
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

.icon-rotate-enter-from {
  opacity: 0;
  transform: rotate(-180deg);
}

.icon-rotate-leave-to {
  opacity: 0;
  transform: rotate(180deg);
}
</style>
