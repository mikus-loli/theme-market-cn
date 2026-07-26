<script setup>
/**
 * BackToTop - 回到顶部按钮
 * 滚动超过 300px 时显示，点击平滑滚动到顶部
 */
import { ref, onMounted, onUnmounted } from 'vue';

// 是否显示按钮
const visible = ref(false);

function handleScroll() {
  visible.value = window.scrollY > 300;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  // 初始化时检查一次当前滚动位置
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <Transition name="fade">
    <button
      v-show="visible"
      class="back-to-top"
      type="button"
      aria-label="回到顶部"
      title="回到顶部"
      @click="scrollToTop"
    >
      <!-- 上箭头图标 -->
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
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-overlay);
  transition:
    background var(--transition-fast),
    transform var(--transition-base);
}

.back-to-top:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.icon {
  width: 20px;
  height: 20px;
}

/* 显示/隐藏过渡：opacity + transform */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
