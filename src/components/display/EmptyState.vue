<script setup>
/**
 * EmptyState - 空状态提示
 * 在无数据或加载失败时居中展示图标、标题、描述与可选的操作按钮
 * 默认图标为一个空盒子，可通过 icon prop 自定义
 */
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: '暂无数据' },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
});

// 默认图标：空盒子（Lucide package 风格）
const DEFAULT_ICON =
  'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z';

const iconPath = computed(() => props.icon || DEFAULT_ICON);
</script>

<template>
  <div class="empty-state" role="status">
    <!-- 图标 -->
    <svg
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path :d="iconPath" />
    </svg>
    <!-- 标题 -->
    <h3 class="title">{{ title }}</h3>
    <!-- 描述（为空时不渲染） -->
    <p v-if="description" class="description">{{ description }}</p>
    <!-- 操作按钮插槽 -->
    <div v-if="$slots.default" class="actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--spacing-3xl);
  gap: var(--spacing-md);
}

/* 图标：64x64，三级文字色 */
.icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-tertiary);
}

.title {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.description {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  max-width: 400px;
  line-height: var(--line-height-base);
}

/* 操作按钮区 */
.actions {
  margin-top: var(--spacing-sm);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* 响应式：小屏减少内边距与图标尺寸 */
@media (max-width: 640px) {
  .empty-state {
    padding: var(--spacing-2xl) var(--spacing-md);
  }
  .icon {
    width: 48px;
    height: 48px;
  }
}
</style>
