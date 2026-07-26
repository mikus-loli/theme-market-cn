#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const BASE_URL = process.env.BASE_URL || 'https://komari-market.mikus.ink';

console.log('🔨 开始构建项目...');

function resetDist() {
  if (fs.existsSync(DIST_DIR)) {
    console.log('清理构建目录...');
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    const request = protocol.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        file.close(() => fs.unlink(destPath, () => {}));
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close(() => fs.unlink(destPath, () => {}));
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    });

    request.on('error', (error) => {
      file.close(() => fs.unlink(destPath, () => {}));
      reject(error);
    });
  });
}

function safeResourceName(theme, suffix, ext) {
  const rawName = theme.short || theme.name?.en || theme.name?.['zh-CN'] || 'theme';
  const name = String(rawName).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'theme';
  return `${name}${suffix}${ext}`;
}

async function downloadThemeResources(v1Data) {
  const resourcesDir = path.join(DIST_DIR, 'resources');
  fs.mkdirSync(resourcesDir, { recursive: true });

  console.log('📥 开始下载主题资源...');

  let successCount = 0;
  let failCount = 0;
  const tasks = [];

  for (const theme of v1Data.themes || []) {
    const themeName = theme.short || theme.name?.en || theme.name?.['zh-CN'] || 'theme';

    if (theme.preview) {
      const ext = path.extname(theme.preview.split('?')[0]) || '.png';
      const filename = safeResourceName(theme, '-preview', ext);
      const destination = path.join(resourcesDir, filename);
      const cdnUrl = `${BASE_URL}/resources/${filename}`;
      tasks.push(
        downloadFile(theme.preview, destination)
          .then(() => {
            successCount += 1;
            theme.preview = cdnUrl;
            console.log(`  ✓ 预览图：${themeName}`);
          })
          .catch((error) => {
            failCount += 1;
            console.error(`  ✗ 预览图失败：${themeName} - ${error.message}，保留原始 URL`);
          })
      );
    }

    if (theme.download) {
      const ext = path.extname(theme.download.split('?')[0]) || '.zip';
      const version = theme.version ? `-${theme.version}` : '';
      const filename = safeResourceName(theme, version, ext);
      const destination = path.join(resourcesDir, filename);
      const cdnUrl = `${BASE_URL}/resources/${filename}`;
      tasks.push(
        downloadFile(theme.download, destination)
          .then(() => {
            successCount += 1;
            theme.download = cdnUrl;
            console.log(`  ✓ 主题包：${themeName} ${theme.version || ''}`.trim());
          })
          .catch((error) => {
            failCount += 1;
            console.error(`  ✗ 主题包失败：${themeName} - ${error.message}，保留原始 URL`);
          })
      );
    }
  }

  await Promise.allSettled(tasks);
  console.log(`✅ 下载完成：成功 ${successCount}，失败 ${failCount}`);
}

function copyFrontendAssets() {
  console.log('构建主题市场页面...');
  fs.copyFileSync(path.join(SRC_DIR, 'index.html.template'), path.join(DIST_DIR, 'index.html'));
  fs.copyFileSync(path.join(SRC_DIR, 'styles.css'), path.join(DIST_DIR, 'styles.css'));
  fs.copyFileSync(path.join(SRC_DIR, 'app.js'), path.join(DIST_DIR, 'app.js'));
  console.log('✅ 生成前端静态资源');
}

async function build() {
  try {
    resetDist();

    if (!fs.existsSync(DATA_DIR)) {
      console.log('⚠️ data 目录不存在，跳过数据复制');
      copyFrontendAssets();
      return;
    }

    console.log('复制主题目录文件...');
    fs.cpSync(DATA_DIR, DIST_DIR, { recursive: true });

    const v1JsonPath = path.join(DATA_DIR, 'v1.json');
    if (!fs.existsSync(v1JsonPath)) {
      console.log('⚠️ v1.json 不存在');
      copyFrontendAssets();
      return;
    }

    const v1Data = JSON.parse(fs.readFileSync(v1JsonPath, 'utf8'));
    console.log(`📊 加载 ${v1Data.themes?.length || 0} 个主题`);
    console.log(`🌐 基础 URL: ${BASE_URL}`);

    await downloadThemeResources(v1Data);

    fs.writeFileSync(path.join(DIST_DIR, 'v1.json'), JSON.stringify(v1Data, null, 2), 'utf8');
    console.log('✓ 更新了 v1.json，所有资源链接已替换为 CDN URL');

    copyFrontendAssets();

    console.log('✅ 构建完成！');
    console.log(`📁 输出目录: ${DIST_DIR}`);
    console.log(`📊 包含 ${v1Data.themes?.length || 0} 个主题`);

    https.globalAgent.destroy();
    http.globalAgent.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ 构建失败：', error);
    process.exit(1);
  }
}

build();
