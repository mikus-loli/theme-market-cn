<script setup>
/**
 * StatCard - 统计卡片
 * 用于展示带图标的数字指标，左侧图标，右侧数值与标签
 * icon 为 SVG path 的 d 属性值，组件内通过 <path :d="icon" /> 渲染
 */
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
});
</script>

<template>
  <div class="stat-card">
    <!-- 左侧图标 -->
    <div class="icon-wrap">
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path :d="icon" />
      </svg>
    </div>
    <!-- 右侧数值与标签 -->
    <div class="info">
      <div class="value">{{ value }}</div>
      <div class="label">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: border-color var(--transition-base);
}

/* hover 时边框变为主题色 */
.stat-card:hover {
  border-color: var(--color-primary-border);
}

/* 图标容器：40x40 圆形 + 主题色背景 */
.icon-wrap {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-full);
}

.icon {
  width: 20px;
  height: 20px;
}

/* 信息区 */
.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.value {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text);
  line-height: var(--line-height-tight);
}

.label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
