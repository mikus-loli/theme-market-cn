<template>
  <div class="market-view">
    <!-- 主题源 Hero -->
    <ThemeSourceHero class="section-hero" />

    <!-- 统计卡片 -->
    <section class="section-stats">
      <div class="stats-grid">
        <StatCard
          icon="M3 7h18M3 12h18M3 17h18"
          label="主题总数"
          :value="stats.total"
        />
        <StatCard
          icon="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 .01M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          label="主题作者"
          :value="stats.authors"
        />
        <StatCard
          icon="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
          label="预览图"
          :value="stats.withPreview"
        />
        <StatCard
          icon="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
          label="可下载"
          :value="stats.withDownload"
        />
      </div>
    </section>

    <!-- 搜索栏 -->
    <section class="section-search">
      <SearchBox v-model="searchQuery" placeholder="搜索主题名称、作者或描述..." />
    </section>

    <!-- 主题列表 -->
    <section class="section-themes">
      <!-- 加载中：骨架屏 -->
      <div v-if="loading" class="themes-grid">
        <SkeletonCard v-for="n in 8" :key="n" />
      </div>

      <!-- 加载失败：错误状态 -->
      <EmptyState
        v-else-if="error"
        title="加载失败"
        :description="error"
        icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      >
        <button class="btn-retry" @click="fetchThemes">重试</button>
      </EmptyState>

      <!-- 无搜索结果：空状态 -->
      <EmptyState
        v-else-if="filteredThemes.length === 0"
        title="未找到匹配的主题"
        description="尝试更换关键词或清空搜索"
        icon="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
      />

      <!-- 主题网格 -->
      <div v-else class="themes-grid">
        <ThemeCard
          v-for="theme in filteredThemes"
          :key="theme.short || theme.name?.en"
          :theme="theme"
          @detail="handleDetail"
          @download="handleDownload"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
/**
 * 主题市场页
 * 展示主题源信息、统计数据、搜索和主题列表
 */
import ThemeSourceHero from '@/components/layout/ThemeSourceHero.vue';
import StatCard from '@/components/display/StatCard.vue';
import SearchBox from '@/components/interaction/SearchBox.vue';
import ThemeCard from '@/components/display/ThemeCard.vue';
import SkeletonCard from '@/components/display/SkeletonCard.vue';
import EmptyState from '@/components/display/EmptyState.vue';
import { useThemes } from '@/composables/useThemes';
import { useToast } from '@/composables/useToast';

const { themes, filteredThemes, stats, loading, error, searchQuery, fetchThemes } = useThemes();
const toast = useToast();

// 首次进入自动加载
fetchThemes();

function handleDetail(theme) {
  toast.info(`查看主题详情：${theme.name?.['zh-CN'] || theme.name?.en || theme.short}`);
}

function handleDownload(theme) {
  if (!theme.download) {
    toast.warning('该主题暂无下载链接');
    return;
  }
  toast.success(`开始下载：${theme.name?.['zh-CN'] || theme.name?.en || theme.short}`);
  window.open(theme.download, '_blank', 'noopener,noreferrer');
}
</script>

<style scoped>
.market-view {
  max-width: var(--layout-content-max);
  margin: 0 auto;
}

.section-hero {
  margin-bottom: var(--spacing-2xl);
}

.section-stats {
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.section-search {
  margin-bottom: var(--spacing-xl);
  max-width: 480px;
}

.section-themes {
  min-height: 400px;
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.btn-retry {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: background var(--transition-fast);
}
.btn-retry:hover {
  background: var(--color-primary-hover);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .themes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
