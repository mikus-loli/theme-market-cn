'use strict';

/**
 * 工具函数模块
 * 提供带重试的下载、并发控制、文件操作等通用能力
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * 下载单个文件到指定路径（支持重定向）
 * @param {string} url 下载地址
 * @param {string} destPath 目标路径
 * @param {object} options { timeoutMs, retries, retryDelayMs, logger }
 */
function downloadFile(url, destPath, options = {}) {
  const { timeoutMs = 60000, retries = 3, retryDelayMs = 2000, logger } = options;
  return new Promise((resolve, reject) => {
    const attempt = (left, err) => {
      if (left < 0) {
        reject(err || new Error(`下载失败: ${url}`));
        return;
      }
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, { timeout: timeoutMs }, (res) => {
        // 处理重定向
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          attempt(left, null, res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          const e = new Error(`HTTP ${res.statusCode}: ${url}`);
          if (logger) logger.warn(`下载失败(${res.statusCode})，剩余重试 ${left}: ${url}`);
          setTimeout(() => attempt(left - 1, e), retryDelayMs);
          return;
        }
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(destPath)));
        file.on('error', (e) => {
          fs.unlink(destPath, () => {});
          if (logger) logger.warn(`写入文件失败，剩余重试 ${left}: ${url} - ${e.message}`);
          setTimeout(() => attempt(left - 1, e), retryDelayMs);
        });
      });
      req.on('timeout', () => {
        req.destroy();
        if (logger) logger.warn(`下载超时，剩余重试 ${left}: ${url}`);
        setTimeout(() => attempt(left - 1, new Error(`timeout: ${url}`)), retryDelayMs);
      });
      req.on('error', (e) => {
        if (logger) logger.warn(`请求失败，剩余重试 ${left}: ${url} - ${e.message}`);
        setTimeout(() => attempt(left - 1, e), retryDelayMs);
      });
    };
    attempt(retries, null);
  });
}

/**
 * 简单的 JSON 请求
 */
function fetchJson(url, options = {}) {
  const { timeoutMs = 30000, retries = 3, retryDelayMs = 2000, headers = {} } = options;
  return new Promise((resolve, reject) => {
    const attempt = (left, err) => {
      if (left < 0) {
        reject(err || new Error(`请求失败: ${url}`));
        return;
      }
      const protocol = url.startsWith('https') ? https : http;
      const req = protocol.get(url, { timeout: timeoutMs, headers }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          attempt(left, null);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          const e = new Error(`HTTP ${res.statusCode}: ${url}`);
          setTimeout(() => attempt(left - 1, e), retryDelayMs);
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            attempt(left - 1, e);
          }
        });
      });
      req.on('timeout', () => {
        req.destroy();
        setTimeout(() => attempt(left - 1, new Error(`timeout: ${url}`)), retryDelayMs);
      });
      req.on('error', (e) => {
        setTimeout(() => attempt(left - 1, e), retryDelayMs);
      });
    };
    attempt(retries, null);
  });
}

/**
 * 并发执行任务（限制并发数）
 * @param {Array} items 待处理项
 * @param {number} concurrency 并发数
 * @param {Function} worker (item, index) => Promise
 */
async function mapLimit(items, concurrency, worker) {
  const results = new Array(items.length);
  let index = 0;
  const run = async () => {
    while (index < items.length) {
      const current = index++;
      try {
        results[current] = { status: 'fulfilled', value: await worker(items[current], current) };
      } catch (error) {
        results[current] = { status: 'rejected', reason: error };
      }
    }
  };
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
  await Promise.all(workers);
  return results;
}

/** 递归创建目录 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/** 递归清空目录（保留目录本身） */
function cleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * 根据 theme 信息生成安全的资源文件名
 * @param {object} theme 主题对象
 * @param {string} suffix 后缀，如 -preview
 * @param {string} ext 扩展名，如 .png
 */
function safeResourceName(theme, suffix, ext) {
  const rawName = theme.short || theme.name?.en || theme.name?.['zh-CN'] || 'theme';
  const name = String(rawName)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'theme';
  return `${name}${suffix}${ext}`;
}

/** 从 URL 中提取扩展名（带点号），默认返回 .png 或 .zip */
function extFromUrl(url, fallback = '.png') {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const ext = path.extname(pathname.split('?')[0]);
    return ext || fallback;
  } catch {
    return fallback;
  }
}

/** 简单延迟 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  downloadFile,
  fetchJson,
  mapLimit,
  ensureDir,
  cleanDir,
  safeResourceName,
  extFromUrl,
  sleep,
};
