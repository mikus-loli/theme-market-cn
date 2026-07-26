<script setup>
/**
 * AppFooter - 页脚
 * 居中展示版权信息、上游仓库链接与 EdgeOne 加速说明
 */
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <p class="copyright">© 2026 Komari Theme Market CN</p>
      <p class="footer-links">
        <a
          href="https://github.com/mikus-loli/theme-market"
          target="_blank"
          rel="noopener noreferrer"
        >
          上游仓库
        </a>
      </p>
      <p class="footer-note">由 EdgeOne 加速 · 国内访问更快更稳定</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-xl) var(--spacing-lg);
  margin-top: var(--spacing-3xl);
}

.footer-inner {
  max-width: var(--layout-content-max);
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.copyright {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.footer-links {
  font-size: var(--font-size-sm);
}

.footer-links a {
  color: var(--color-primary);
  font-weight: 500;
}
.footer-links a:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.footer-note {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .app-footer {
    padding: var(--spacing-lg) var(--spacing-md);
    margin-top: var(--spacing-2xl);
  }
}
</style>
