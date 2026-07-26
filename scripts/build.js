'use strict';

/**
 * 构建脚本
 *
 * 职责：
 *  1. 读取 data/v1.json，识别每个主题的 preview / download 资源链接
 *  2. 下载这些资源到 dist/resources/ 目录（即 EdgeOne Pages 部署目录）
 *  3. 仅在 v1.json 中将原始 GitHub 链接替换为 EdgeOne 加速链接
 *     （其他文件结构保持不变）
 *  4. 复制前端静态资源到 dist/
 *  5. 全程通过 logger 记录，构建结束后显式销毁 HTTP agent 并退出进程
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const { Logger, createFromConfig } = require('./logger');
const {
  downloadFile,
  mapLimit,
  ensureDir,
  cleanDir,
  safeResourceName,
  extFromUrl,
} = require('./utils');

const ROOT_DIR = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT_DIR, 'config', 'config.json');

async function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const logger = createFromConfig(CONFIG_PATH).child('build');
  logger.rotate();

  const buildCfg = config.build;
  const edgeoneCfg = config.edgeone;

  const DIST_DIR = path.join(ROOT_DIR, buildCfg.outputDir);
  const DATA_DIR = path.join(ROOT_DIR, buildCfg.dataDir);
  const SRC_DIR = path.join(ROOT_DIR, buildCfg.srcDir);
  const RESOURCES_DIR = path.join(DIST_DIR, buildCfg.resourcesDir);
  const BASE_URL = process.env.BASE_URL || edgeoneCfg.domain;
  const RESOURCE_BASE = `${BASE_URL}${edgeoneCfg.resourcePath}`;

  logger.info('开始构建', { baseUrl: BASE_URL });

  // 1. 重置 dist 目录
  logger.debug('清理构建目录', { dir: DIST_DIR });
  cleanDir(DIST_DIR);
  ensureDir(RESOURCES_DIR);

  // 2. 校验 data 目录
  if (!fs.existsSync(DATA_DIR)) {
    logger.error('data 目录不存在，请先运行 sync 脚本', { dir: DATA_DIR });
    process.exit(1);
  }

  const v1JsonPath = path.join(DATA_DIR, 'v1.json');
  if (!fs.existsSync(v1JsonPath)) {
    logger.error('data/v1.json 不存在', { path: v1JsonPath });
    process.exit(1);
  }

  // 3. 复制 data 目录到 dist（保留其他数据文件结构）
  logger.info('复制 data 目录到 dist');
  fs.cpSync(DATA_DIR, DIST_DIR, { recursive: true });

  // 4. 加载 v1.json
  const v1Data = JSON.parse(fs.readFileSync(v1JsonPath, 'utf8'));
  const themes = v1Data.themes || [];
  logger.info('加载主题目录', { count: themes.length });

  // 5. 收集所有需要下载的资源任务
  const tasks = [];
  for (const theme of themes) {
    const themeName = theme.short || theme.name?.en || theme.name?.['zh-CN'] || 'theme';

    if (theme.preview) {
      const ext = extFromUrl(theme.preview, '.png');
      const filename = safeResourceName(theme, '-preview', ext);
      const destPath = path.join(RESOURCES_DIR, filename);
      const cdnUrl = `${RESOURCE_BASE}${filename}`;
      tasks.push({
        type: 'preview',
        theme,
        themeName,
        url: theme.preview,
        destPath,
        cdnUrl,
      });
    }

    if (theme.download) {
      const ext = extFromUrl(theme.download, '.zip');
      const version = theme.version ? `-${theme.version}` : '';
      const filename = safeResourceName(theme, version, ext);
      const destPath = path.join(RESOURCES_DIR, filename);
      const cdnUrl = `${RESOURCE_BASE}${filename}`;
      tasks.push({
        type: 'download',
        theme,
        themeName,
        url: theme.download,
        destPath,
        cdnUrl,
      });
    }
  }

  logger.info('资源任务汇总', { total: tasks.length });

  // 6. 并发下载资源
  const downloadOptions = {
    timeoutMs: buildCfg.timeoutMs,
    retries: buildCfg.maxRetries,
    retryDelayMs: buildCfg.retryDelayMs,
    logger,
  };

  const results = await mapLimit(tasks, buildCfg.concurrency, async (task) => {
    try {
      await downloadFile(task.url, task.destPath, downloadOptions);
      // 仅替换 v1.json 中对应字段（保留原始对象其他字段）
      if (task.type === 'preview') {
        task.theme.preview = task.cdnUrl;
      } else {
        task.theme.download = task.cdnUrl;
      }
      const size = fs.statSync(task.destPath).size;
      logger.info('下载成功', {
        type: task.type,
        theme: task.themeName,
        size,
        url: task.url,
        cdn: task.cdnUrl,
      });
      return { ok: true, task };
    } catch (error) {
      logger.error('下载失败，保留原始 URL', {
        type: task.type,
        theme: task.themeName,
        url: task.url,
        error: error.message,
      });
      return { ok: false, task, error };
    }
  });

  // 7. 统计结果
  const success = results.filter((r) => r.value?.ok).length;
  const failed = results.length - success;
  logger.info('资源下载完成', { success, failed, total: tasks.length });

  // 8. 写回 v1.json（仅替换资源链接，其他结构不变）
  const distV1Path = path.join(DIST_DIR, 'v1.json');
  fs.writeFileSync(distV1Path, JSON.stringify(v1Data, null, 2) + '\n', 'utf8');
  logger.info('已写回 dist/v1.json（资源链接已替换为 EdgeOne 加速链接）', {
    path: distV1Path,
    replaced: success,
  });

  // 9. 运行 Vite 构建（输出到 dist/，emptyOutDir: false 不会清除已下载的资源）
  if (fs.existsSync(SRC_DIR)) {
    logger.info('运行 Vite 构建前端应用...');
    const { execSync } = require('child_process');
    try {
      execSync('npx vite build', {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: { ...process.env, BASE_URL },
      });
      logger.info('Vite 构建完成');
    } catch (e) {
      logger.error('Vite 构建失败', { error: e.message });
      process.exit(1);
    }
  } else {
    logger.warn('src 目录不存在，跳过前端构建', { dir: SRC_DIR });
  }

  // 10. 写入构建元信息
  const buildMeta = {
    builtAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    themeCount: themes.length,
    resourceTotal: tasks.length,
    resourceSuccess: success,
    resourceFailed: failed,
  };
  fs.writeFileSync(
    path.join(DIST_DIR, '.build-meta.json'),
    JSON.stringify(buildMeta, null, 2),
    'utf8'
  );
  logger.info('构建元信息已写入', buildMeta);

  logger.info('构建完成', { distDir: DIST_DIR });

  // 11. 显式销毁 HTTP agent 并退出，避免 EdgeOne Pages 部署挂起
  https.globalAgent.destroy();
  http.globalAgent.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('构建失败:', err);
  try {
    https.globalAgent.destroy();
    http.globalAgent.destroy();
  } catch (_) {}
  process.exit(1);
});
