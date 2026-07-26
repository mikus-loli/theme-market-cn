<script setup>
/**
 * SkeletonCard - 骨架屏卡片
 * 主题数据加载过程中作为占位展示，结构与 ThemeCard 类似
 * 使用 base.css 中已定义的 @keyframes shimmer 动画
 */
</script>

<template>
  <div class="skeleton-card" aria-hidden="true">
    <!-- 预览图骨架 -->
    <div class="skeleton preview" />
    <!-- 内容骨架 -->
    <div class="content">
      <div class="skeleton line line-title" />
      <div class="skeleton line line-author" />
      <div class="skeleton line line-desc" />
      <div class="skeleton line line-desc" />
      <div class="actions">
        <div class="skeleton line line-btn" />
        <div class="skeleton line line-btn" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 骨架块基础样式：渐变背景 + shimmer 动画 */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-muted) 25%,
    var(--color-bg-hover) 50%,
    var(--color-bg-muted) 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite;
}

/* 预览图区域，固定 16:10 比例 */
.preview {
  aspect-ratio: 16 / 10;
  width: 100%;
}

/* 内容区域 */
.content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
}

.line {
  height: 12px;
  border-radius: var(--radius-sm);
}

.line-title {
  width: 60%;
  height: 16px;
}

.line-author {
  width: 30%;
}

.line-desc {
  width: 100%;
}

/* 底部按钮区骨架 */
.actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.line-btn {
  flex: 1;
  height: 32px;
  border-radius: var(--radius-md);
}

/* 响应式：小屏紧凑 */
@media (max-width: 640px) {
  .content {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>
