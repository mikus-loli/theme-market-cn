'use strict';

/**
 * 上游同步脚本
 * 从 GitHub 上游仓库 (mikus-loli/theme-market) 拉取最新的 v1.json 及相关数据文件，
 * 写入本地 data/ 目录，供后续构建脚本处理。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFromConfig } from './logger.js';
import { fetchJson, ensureDir } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT_DIR, 'config', 'config.json');

async function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const logger = createFromConfig(CONFIG_PATH).child('sync');
  logger.rotate();

  const upstream = config.upstream;
  const dataDir = path.join(ROOT_DIR, config.build.dataDir);
  ensureDir(dataDir);

  logger.info('开始同步上游仓库', { repo: upstream.repo, branch: upstream.branch });

  const v1Path = upstream.v1JsonPath || 'v1.json';
  const candidates = [
    `${upstream.rawBaseUrl}/${upstream.repo}/${upstream.branch}/${v1Path}`,
  ];
  if (upstream.mirrorRawUrl) {
    candidates.push(`${upstream.mirrorRawUrl}/${upstream.repo}/${upstream.branch}/${v1Path}`);
  }
  if (upstream.apiBaseUrl && process.env.GITHUB_TOKEN) {
    candidates.unshift(
      `${upstream.apiBaseUrl}/repos/${upstream.repo}/contents/${v1Path}?ref=${upstream.branch}`
    );
  }

  let v1Data = null;
  let usedUrl = null;
  let lastError = null;

  for (const url of candidates) {
    try {
      logger.debug('尝试拉取', { url });
      const result = await fetchJson(url, {
        timeoutMs: 30000,
        retries: 2,
        retryDelayMs: 2000,
        headers: process.env.GITHUB_TOKEN
          ? { Authorization: `token ${process.env.GITHUB_TOKEN}`, 'User-Agent': 'theme-market-cn-sync' }
          : { 'User-Agent': 'theme-market-cn-sync' },
      });

      if (result && result.content && result.encoding === 'base64') {
        v1Data = JSON.parse(Buffer.from(result.content, 'base64').toString('utf8'));
      } else {
        v1Data = result;
      }
      usedUrl = url;
      logger.info('拉取成功', { url });
      break;
    } catch (e) {
      lastError = e;
      logger.warn('拉取失败，尝试下一个候选', { url, error: e.message });
    }
  }

  if (!v1Data) {
    logger.error('所有候选地址均失败，同步终止', { error: lastError?.message });
    process.exit(1);
  }

  const localV1Path = path.join(dataDir, 'v1.json');
  const localContent = fs.existsSync(localV1Path)
    ? fs.readFileSync(localV1Path, 'utf8')
    : null;
  const remoteContent = JSON.stringify(v1Data, null, 2) + '\n';

  if (localContent === remoteContent) {
    logger.info('上游内容与本地一致，无需更新');
    logger.info('同步完成（无变化）');
    return;
  }

  fs.writeFileSync(localV1Path, remoteContent, 'utf8');
  logger.info('已更新 data/v1.json', {
    themes: (v1Data.themes || []).length,
    source: usedUrl,
  });

  const meta = {
    syncedAt: new Date().toISOString(),
    source: usedUrl,
    repo: upstream.repo,
    branch: upstream.branch,
    themeCount: (v1Data.themes || []).length,
  };
  fs.writeFileSync(
    path.join(dataDir, '.sync-meta.json'),
    JSON.stringify(meta, null, 2),
    'utf8'
  );
  logger.info('同步元信息已写入', meta);

  logger.info('同步完成');
}

main().catch((err) => {
  console.error('同步脚本异常:', err);
  process.exit(1);
});
