import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

// Vite 配置
// 注意：构建产物输出到 dist/，但不清空 dist/（build.js 会先处理 v1.json 和资源下载）
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    // 不让 Vite 清空 dist，因为 build.js 已经下载了资源到 dist/resources
    emptyOutDir: false,
    rollupOptions: {
      output: {
        // 静态资源分目录输出
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          if (assetInfo.name && /\.(woff2?|ttf|eot)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    // 开发时代理 v1.json 请求到 dist 目录，便于本地调试
    proxy: {
      '/v1.json': {
        target: 'http://localhost:5173',
        rewrite: () => '/data/v1.json',
      },
    },
  },
});
