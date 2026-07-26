<script setup>
/**
 * ToastContainer - Toast 通知容器
 * 固定在右上角，垂直堆叠展示来自 useToast() 的通知
 * 每项左侧带类型图标、消息文字、右侧关闭按钮
 */
import { useToast } from '@/composables/useToast';

const { toasts, remove } = useToast();

// 各类型对应的图标路径（Lucide 风格）
const ICON_PATHS = {
  success: 'M20 6 9 17l-5-5',
  error: 'M18 6 6 18M6 6l12 12',
  warning:
    'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  info: 'M12 16v-4M12 8h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z',
};

// 各类型对应的颜色变量
const COLOR_VARS = {
  success: 'var(--color-success)',
  error: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
};

function iconPath(type) {
  return ICON_PATHS[type] || ICON_PATHS.info;
}

function colorVar(type) {
  return COLOR_VARS[type] || COLOR_VARS.info;
}
</script>

<template>
  <div class="toast-container" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :style="{ '--toast-color': colorVar(t.type) }"
        role="alert"
      >
        <!-- 左侧类型图标 -->
        <svg
          class="toast-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="iconPath(t.type)" />
        </svg>
        <!-- 消息文字 -->
        <span class="toast-message">{{ t.message }}</span>
        <!-- 右侧关闭按钮 -->
        <button
          class="toast-close"
          type="button"
          aria-label="关闭"
          @click="remove(t.id)"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  /* 容器本身不拦截点击，由单个 toast 接管 */
  pointer-events: none;
  max-width: 360px;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  /* 左侧 3px 类型色边框 */
  border-left: 3px solid var(--toast-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

.toast-icon {
  width: 20px;
  height: 20px;
  color: var(--toast-color);
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  line-height: var(--line-height-base);
  word-break: break-word;
}

.toast-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.toast-close svg {
  width: 14px;
  height: 14px;
}

.toast-close:hover {
  color: var(--color-text);
  background: var(--color-bg-hover);
}

/* 进入动画：fadeInUp，退出动画：淡出向右滑出 */
.toast-enter-active {
  transition: all var(--transition-base);
}

.toast-leave-active {
  transition: all var(--transition-base);
  /* 退出时脱离布局，避免影响其他项的位置过渡 */
  position: absolute;
  width: 100%;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 移动端：宽度自适应并居中 */
@media (max-width: 640px) {
  .toast-container {
    top: var(--spacing-md);
    right: 50%;
    transform: translateX(50%);
    width: calc(100vw - 32px);
    max-width: none;
  }
}
</style>
