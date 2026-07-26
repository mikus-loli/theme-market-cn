<template>
  <div class="app-layout">
    <AppHeader />

    <main class="app-main">
      <router-view />
    </main>

    <AppFooter />

    <!-- 全局交互组件 -->
    <ToastContainer />
    <BackToTop />
  </div>
</template>

<script setup>
/**
 * 应用根组件
 */
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import ToastContainer from '@/components/interaction/ToastContainer.vue';
import BackToTop from '@/components/interaction/BackToTop.vue';
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding: var(--spacing-xl) var(--spacing-2xl);
  max-width: 100%;
}

@media (max-width: 768px) {
  .app-main {
    padding: var(--spacing-md);
  }
}
</style>
