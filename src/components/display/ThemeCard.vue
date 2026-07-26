<script setup>
/**
 * ThemeCard - 主题卡片
 * 展示单个主题的预览图、名称、作者、描述及操作按钮
 * 通过 emit 与父组件通信，触发详情查看与下载动作
 */
import { ref, computed } from 'vue';

const props = defineProps({
  theme: { type: Object, required: true },
});

const emit = defineEmits(['detail', 'download']);

// 预览图加载失败标志
const previewError = ref(false);

// 主题显示名：优先取中文名，其次英文名，最后 short 字段
const displayName = computed(() => {
  const name = props.theme?.name;
  return name?.['zh-CN'] || name?.en || props.theme?.short || '未命名主题';
});

// 预览图加载失败时切换到占位符
function handleImageError() {
  previewError.value = true;
}

function handleDetail() {
  emit('detail', props.theme);
}

function handleDownload() {
  emit('download', props.theme);
}
</script>

<template>
  <article class="theme-card">
    <!-- 预览图区域 -->
    <div class="preview">
      <img
        v-if="theme.preview && !previewError"
        class="preview-img"
        :src="theme.preview"
        :alt="displayName"
        loading="lazy"
        @error="handleImageError"
      />
      <!-- 加载失败或无预览图时的占位符 -->
      <div v-else class="preview-placeholder">
        <svg
          class="placeholder-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
        </svg>
        <span class="placeholder-text">{{ displayName }}</span>
      </div>

      <!-- 右上角版本标签 -->
      <span v-if="theme.version" class="version-badge">v{{ theme.version }}</span>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <h3 class="name" :title="displayName">{{ displayName }}</h3>
      <p class="author">@{{ theme.author || '未知' }}</p>
      <p class="description">{{ theme.description || '暂无描述' }}</p>

      <!-- 底部操作按钮 -->
      <div class="actions">
        <button class="btn btn-secondary" type="button" @click="handleDetail">
          详情
        </button>
        <button class="btn btn-primary" type="button" @click="handleDownload">
          <svg
            class="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          下载
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.theme-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    border-color var(--transition-base);
}

/* 卡片 hover：上浮 + 阴影增强 */
.theme-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-surface-border-hover);
}

/* 预览图区域，固定 16:10 比例 */
.preview {
  position: relative;
  aspect-ratio: 16 / 10;
  background: var(--color-bg-muted);
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

/* 图片 hover 时轻微放大 */
.theme-card:hover .preview-img {
  transform: scale(1.03);
}

/* 占位符 */
.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  color: var(--color-text-tertiary);
}

.placeholder-icon {
  width: 48px;
  height: 48px;
}

.placeholder-text {
  font-size: var(--font-size-sm);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右上角版本标签 */
.version-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: 2px var(--spacing-sm);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border-radius: var(--radius-full);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* 内容区域 */
.content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
}

.name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.author {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

/* 描述最多 2 行，超出省略号 */
.description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-base);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* 保证卡片高度一致 */
  min-height: calc(var(--font-size-sm) * var(--line-height-base) * 2);
}

/* 底部按钮区 */
.actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* 次要按钮 */
.btn-secondary {
  background: var(--color-bg-muted);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
  border-color: var(--color-surface-border-hover);
}

/* 主要按钮 */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

/* 响应式：小屏下保持紧凑 */
@media (max-width: 640px) {
  .content {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>
