<script setup>
/**
 * CopyButton - 复制按钮
 * 点击将 text 写入剪贴板，成功后调用 toast 提示并临时显示"已复制"状态 2 秒
 */
import { ref, onUnmounted } from 'vue';
import { useToast } from '@/composables/useToast';

const props = defineProps({
  text: { type: String, default: '' },
  label: { type: String, default: '复制' },
});

const { success, error } = useToast();

// 是否已复制（临时状态，2 秒后恢复）
const copied = ref(false);
let timer = null;

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.text);
    success('已复制到剪贴板');
    copied.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      copied.value = false;
      timer = null;
    }, 2000);
  } catch (_) {
    error('复制失败');
  }
}

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <button class="copy-btn" type="button" @click="handleCopy">
    <!-- 左侧图标：默认复制图标，复制成功后切换为勾选图标 -->
    <svg
      v-if="!copied"
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
    <svg
      v-else
      class="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
    <span>{{ copied ? '已复制' : label }}</span>
  </button>
</template>

<style scoped>
.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.copy-btn:hover {
  background: var(--color-primary-hover);
}

.icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
