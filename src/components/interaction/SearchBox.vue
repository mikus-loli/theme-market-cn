<script setup>
/**
 * SearchBox - 搜索框
 * 带搜索图标、清除按钮与防抖（300ms）的输入框，支持 v-model
 */
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索主题...' },
});

const emit = defineEmits(['update:modelValue']);

// 内部输入值（用于即时显示，与外部 modelValue 解耦）
const innerValue = ref(props.modelValue);
const inputRef = ref(null);

let timer = null;

// 同步外部 modelValue 到内部（如父组件重置时）
watch(
  () => props.modelValue,
  (val) => {
    if (val !== innerValue.value) {
      innerValue.value = val;
    }
  }
);

// 输入事件：更新内部值并防抖 emit
function onInput(e) {
  innerValue.value = e.target.value;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    emit('update:modelValue', innerValue.value);
    timer = null;
  }, 300);
}

// 清除输入：清空内容并立即 emit，同时聚焦输入框
function clear() {
  innerValue.value = '';
  emit('update:modelValue', '');
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  inputRef.value?.focus();
}

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <div class="search-box">
    <!-- 左侧搜索图标 -->
    <svg
      class="search-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    <!-- 输入框：无边框、透明背景、flex:1 -->
    <input
      ref="inputRef"
      class="search-input"
      type="text"
      :value="innerValue"
      :placeholder="placeholder"
      @input="onInput"
    />
    <!-- 右侧清除按钮（仅有输入时显示） -->
    <button
      v-if="innerValue"
      class="clear-btn"
      type="button"
      aria-label="清除"
      @click="clear"
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
</template>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-bg-muted);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  padding: var(--spacing-sm) var(--spacing-md);
  transition:
    background var(--transition-base),
    border-color var(--transition-base);
}

/* focus 时切换背景与边框色 */
.search-box:focus-within {
  background: var(--color-bg);
  border-color: var(--color-primary-border);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-size-base);
  color: var(--color-text);
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.clear-btn {
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
  border-radius: var(--radius-full);
  flex-shrink: 0;
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.clear-btn svg {
  width: 16px;
  height: 16px;
}

.clear-btn:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-hover);
}
</style>
