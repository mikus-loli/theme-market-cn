'use strict';

/**
 * 工具函数模块
 * 提供带重试的下载、并发控制、文件操作等通用能力
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';

const MAX_REDIRECTS = 5;

/**
 * 下载单个文件到指定路径（正确跟随重定向 + 整体超时保护）
 * @param {string} url 下载地址
 * @param {string} destPath 目标路径
 * @param {object} options { timeoutMs, retries, retryDelayMs, logger }
 */
export function downloadFile(url, destPath, options = {}) {
  const { timeoutMs = 60000, retries = 3, retryDelayMs = 2000, logger } = options;
  const overallDeadline = timeoutMs * (retries + 1) * (MAX_REDIRECTS + 1) + retryDelayMs * retries;

  return new Promise((resolve, reject) => {
    let overallTimer = null;
    let settled = false;

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      if (overallTimer) clearTimeout(overallTimer);
      fn(value);
    };

    overallTimer = setTimeout(() => {
      finish(reject, new Error(`整体超时(>${overallDeadline}ms): ${url}`));
    }, overallDeadline);

    const attempt = (currentUrl, left, err, redirectsLeft) => {
      if (left < 0) {
        finish(reject, err || new Error(`下载失败: ${url}`));
        return;
      }
      const protocol = currentUrl.startsWith('https') ? https : http;
      const req = protocol.get(currentUrl, { timeout: timeoutMs }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          if (redirectsLeft <= 0) {
            const e = new Error(`重定向次数超限(${MAX_REDIRECTS}): ${url}`);
            if (logger) logger.warn(`重定向超限，剩余重试 ${left}: ${url}`);
            setTimeout(() => attempt(url, left - 1, e, MAX_REDIRECTS), retryDelayMs);
            return;
          }
          const nextUrl = new URL(res.headers.location, currentUrl).toString();
          if (logger) logger.debug(`重定向 ${res.statusCode}: ${currentUrl} -> ${nextUrl}`);
          attempt(nextUrl, left, null, redirectsLeft - 1);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          const e = new Error(`HTTP ${res.statusCode}: ${currentUrl}`);
          if (logger) logger.warn(`下载失败(${res.statusCode})，剩余重试 ${left}: ${url}`);
          setTimeout(() => attempt(url, left - 1, e, MAX_REDIRECTS), retryDelayMs);
          return;
        }
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => file.close(() => finish(resolve, destPath)));
        file.on('error', (e) => {
          fs.unlink(destPath, () => {});
          if (logger) logger.warn(`写入文件失败，剩余重试 ${left}: ${url} - ${e.message}`);
          setTimeout(() => attempt(url, left - 1, e, MAX_REDIRECTS), retryDelayMs);
        });
      });
      req.on('timeout', () => {
        req.destroy();
        if (logger) logger.warn(`下载超时，剩余重试 ${left}: ${url}`);
        setTimeout(() => attempt(url, left - 1, new Error(`timeout: ${url}`), MAX_REDIRECTS), retryDelayMs);
      });
      req.on('error', (e) => {
        if (logger) logger.warn(`请求失败，剩余重试 ${left}: ${url} - ${e.message}`);
        setTimeout(() => attempt(url, left - 1, e, MAX_REDIRECTS), retryDelayMs);
      });
    };
    attempt(url, retries, null, MAX_REDIRECTS);
  });
}

/**
 * 简单的 JSON 请求（正确跟随重定向）
 */
export function fetchJson(url, options = {}) {
  const { timeoutMs = 30000, retries = 3, retryDelayMs = 2000, headers = {} } = options;
  const overallDeadline = timeoutMs * (retries + 1) * (MAX_REDIRECTS + 1) + retryDelayMs * retries;

  return new Promise((resolve, reject) => {
    let overallTimer = null;
    let settled = false;

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      if (overallTimer) clearTimeout(overallTimer);
      fn(value);
    };

    overallTimer = setTimeout(() => {
      finish(reject, new Error(`整体超时(>${overallDeadline}ms): ${url}`));
    }, overallDeadline);

    const attempt = (currentUrl, left, err, redirectsLeft) => {
      if (left < 0) {
        finish(reject, err || new Error(`请求失败: ${url}`));
        return;
      }
      const protocol = currentUrl.startsWith('https') ? https : http;
      const req = protocol.get(currentUrl, { timeout: timeoutMs, headers }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          if (redirectsLeft <= 0) {
            const e = new Error(`重定向次数超限(${MAX_REDIRECTS}): ${url}`);
            setTimeout(() => attempt(url, left - 1, e, MAX_REDIRECTS), retryDelayMs);
            return;
          }
          const nextUrl = new URL(res.headers.location, currentUrl).toString();
          attempt(nextUrl, left, null, redirectsLeft - 1);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          const e = new Error(`HTTP ${res.statusCode}: ${currentUrl}`);
          setTimeout(() => attempt(url, left - 1, e, MAX_REDIRECTS), retryDelayMs);
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            finish(resolve, JSON.parse(data));
          } catch (e) {
            attempt(url, left - 1, e, MAX_REDIRECTS);
          }
        });
      });
      req.on('timeout', () => {
        req.destroy();
        setTimeout(() => attempt(url, left - 1, new Error(`timeout: ${url}`), MAX_REDIRECTS), retryDelayMs);
      });
      req.on('error', (e) => {
        setTimeout(() => attempt(url, left - 1, e, MAX_REDIRECTS), retryDelayMs);
      });
    };
    attempt(url, retries, null, MAX_REDIRECTS);
  });
}

/**
 * 并发执行任务（限制并发数）
 */
export async function mapLimit(items, concurrency, worker) {
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
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/** 递归清空目录（保留目录本身） */
export function cleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

/** 根据 theme 信息生成安全的资源文件名 */
export function safeResourceName(theme, suffix, ext) {
  const rawName = theme.short || theme.name?.en || theme.name?.['zh-CN'] || 'theme';
  const name = String(rawName)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'theme';
  return `${name}${suffix}${ext}`;
}

/** 从 URL 中提取扩展名（带点号） */
export function extFromUrl(url, fallback = '.png') {
  try {
    const u = new URL(url);
    const ext = path.extname(u.pathname.split('?')[0]);
    return ext || fallback;
  } catch {
    return fallback;
  }
}

/** 简单延迟 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
