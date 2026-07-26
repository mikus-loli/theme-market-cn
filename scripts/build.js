#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 开始构建项目...');

const distDir = path.join(__dirname, '..', 'dist');
const dataDir = path.join(__dirname, '..', 'data');  // 使用 data 目录

// 清理构建目录
if (fs.existsSync(distDir)) {
  console.log('清理构建目录...');
  fs.rmSync(distDir, { recursive: true });
}

// 创建构建目录
fs.mkdirSync(distDir, { recursive: true });

// 复制主题目录文件到构建目录
if (fs.existsSync(dataDir)) {
  console.log('复制主题目录文件...');
  fs.cpSync(dataDir, distDir, { recursive: true });
} else {
  console.log('⚠️  data 目录不存在，创建空目录');
  fs.mkdirSync(distDir, { recursive: true });
}

// 读取主题目录
let v1Data = null;
const v1JsonPath = path.join(dataDir, 'v1.json');
if (fs.existsSync(v1JsonPath)) {
  v1Data = JSON.parse(fs.readFileSync(v1JsonPath, 'utf8'));
  console.log(`📊 加载 ${v1Data.themes.length} 个主题`);
}

// 创建索引页面
const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Theme Market CN - 主题市场</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .info h2 {
            color: #495057;
            margin-bottom: 10px;
        }
        .info p {
            color: #6c757d;
            line-height: 1.6;
        }
        .themes {
            margin-top: 20px;
        }
        .themes h2 {
            color: #333;
            margin-bottom: 15px;
        }
        .theme-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
        }
        .theme-item {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            transition: all 0.3s;
        }
        .theme-item:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
        }
        .theme-name {
            font-weight: 600;
            color: #333;
            font-size: 1.1em;
        }
        .theme-description {
            color: #6c757d;
            margin-top: 8px;
            line-height: 1.5;
            font-size: 0.9em;
        }
        .theme-meta {
            margin-top: 8px;
            font-size: 0.85em;
            color: #868e96;
        }
        .theme-meta span {
            margin-right: 15px;
        }
        .theme-link {
            display: inline-block;
            margin-top: 12px;
            color: #667eea;
            text-decoration: none;
            font-size: 0.9em;
        }
        .theme-link:hover {
            text-decoration: underline;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Theme Market CN</h1>
        <p class="subtitle">自动同步上游主题仓库，国内加速访问</p>

        <div class="info">
            <h2>📍 项目说明</h2>
            <p>本项目自动同步上游主题仓库 <a href="https://github.com/komari-monitor/theme-market" target="_blank">komari-monitor/theme-market</a>，通过 EdgeOne Pages 托管，为国内用户提供快速访问。</p>
            <p style="margin-top: 10px;">同步时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
        </div>

        <div class="themes">
            <h2>📦 主题列表</h2>
            <div class="theme-list">
                ${v1Data ? v1Data.themes.map(theme => `
                <div class="theme-item">
                    <div class="theme-name">${theme.name['zh-CN'] || theme.name}</div>
                    <div class="theme-description">${theme.description['zh-CN'] || theme.description || '暂无描述'}</div>
                    <div class="theme-meta">
                        <span>v${theme.version}</span>
                        <span>by ${theme.author['zh-CN'] || theme.author}</span>
                    </div>
                    <a href="${theme.url}" target="_blank" class="theme-link">查看详情 →</a>
                </div>
                `).join('') : '<p>暂无主题</p>'}
            </div>
        </div>

        <div class="footer">
            <p>Powered by <a href="https://cloud.tencent.com/product/eo" target="_blank">EdgeOne Pages</a> | 自动同步上游仓库</p>
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

console.log('✅ 构建完成！');
console.log(`📁 输出目录: ${distDir}`);
if (v1Data) {
  console.log(`📊 包含 ${v1Data.themes.length} 个主题`);
}