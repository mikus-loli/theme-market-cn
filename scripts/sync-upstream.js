#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const UPSTREAM_REPO = process.env.UPSTREAM_REPO || 'https://github.com/komari-monitor/theme-market';
const SYNC_DIR = path.join(__dirname, '..', 'data');  // 改为 data 目录
const TEMP_DIR = path.join(__dirname, '..', '.temp-sync');

console.log('🚀 开始同步上游仓库...');
console.log(`上游地址：${UPSTREAM_REPO}`);

try {
  // 清理临时目录
  if (fs.existsSync(TEMP_DIR)) {
    console.log('清理临时目录...');
    fs.rmSync(TEMP_DIR, { recursive: true });
  }

  // 克隆上游仓库到临时目录
  console.log('克隆上游仓库...');
  execSync(`git clone --depth=1 "${UPSTREAM_REPO}" "${TEMP_DIR}"`, {
    stdio: 'inherit'
  });

  // 确保目标目录存在
  if (!fs.existsSync(SYNC_DIR)) {
    fs.mkdirSync(SYNC_DIR, { recursive: true });
  }

  // 同步主题目录文件
  console.log('同步主题目录文件...');

  // 同步 v1.json（主要目录文件）
  const v1JsonSrc = path.join(TEMP_DIR, 'v1.json');
  const v1JsonDest = path.join(SYNC_DIR, 'v1.json');
  if (fs.existsSync(v1JsonSrc)) {
    fs.copyFileSync(v1JsonSrc, v1JsonDest);
    console.log('  ✓ v1.json');

    // 读取并显示主题数量
    const v1Data = JSON.parse(fs.readFileSync(v1JsonSrc, 'utf8'));
    console.log(`    包含 ${v1Data.themes.length} 个主题`);
  }

  // 同步其他重要文件
  const filesToSync = [
    { src: 'README.md', dest: 'upstream-README.md' },
    { src: 'scripts', dest: 'scripts', isDir: true }
  ];

  // 同步 scripts 目录前，备份本地特有脚本（上游没有的）
  const LOCAL_ONLY_SCRIPTS = ['build.js', 'sync-upstream.js'];
  const scriptsDir = path.join(__dirname, '..', 'scripts');
  const scriptBackups = {};
  for (const name of LOCAL_ONLY_SCRIPTS) {
    const filePath = path.join(scriptsDir, name);
    if (fs.existsSync(filePath)) {
      scriptBackups[name] = fs.readFileSync(filePath);
      console.log(`  备份本地脚本：${name}`);
    }
  }

  filesToSync.forEach(({ src, dest, isDir }) => {
    const srcPath = path.join(TEMP_DIR, src);
    const destPath = path.join(__dirname, '..', dest);
    if (fs.existsSync(srcPath)) {
      if (isDir) {
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { recursive: true });
        }
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`  ✓ ${src}`);
    }
  });

  // 恢复本地特有脚本
  for (const [name, content] of Object.entries(scriptBackups)) {
    const filePath = path.join(scriptsDir, name);
    fs.writeFileSync(filePath, content);
    console.log(`  恢复本地脚本：${name}`);
  }

  console.log('✅ 同步完成！');

  // 清理临时目录
  fs.rmSync(TEMP_DIR, { recursive: true });
  console.log('✨ 所有文件同步完成！');

} catch (error) {
  console.error('❌ 同步失败：', error.message);
  process.exit(1);
}