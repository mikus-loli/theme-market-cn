#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

console.log('🔨 开始构建项目...');

const distDir = path.join(__dirname, '..', 'dist');
const dataDir = path.join(__dirname, '..', 'data');

// 清理构建目录
if (fs.existsSync(distDir)) {
  console.log('清理构建目录...');
  fs.rmSync(distDir, { recursive: true });
}

// 创建构建目录
fs.mkdirSync(distDir, { recursive: true });

// 下载文件的辅助函数
async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    protocol.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// 下载主题资源
async function downloadThemeResources(v1Data, distDir) {
  const resourcesDir = path.join(distDir, 'resources');
  fs.mkdirSync(resourcesDir, { recursive: true });
  
  console.log('📥 开始下载主题资源...');
  
  const downloadPromises = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const theme of v1Data.themes) {
    const themeName = theme.short || theme.name;
    
    // 下载预览图
    if (theme.preview) {
      const previewExt = path.extname(theme.preview.split('?')[0]) || '.png';
      const previewFilename = `${themeName}-preview${previewExt}`;
      const previewPath = path.join(resourcesDir, previewFilename);
      
      downloadPromises.push(
        downloadFile(theme.preview, previewPath)
          .then(() => {
            // 直接替换原始字段为完整 URL
            const baseUrl = process.env.BASE_URL || 'https://theme-market-cn.edgeonepages.com';
            theme.preview = `${baseUrl}/resources/${previewFilename}`;
            successCount++;
            console.log(`  ✓ 预览图：${themeName}`);
          })
          .catch(err => {
            console.error(`  ✗ 预览图失败：${themeName} - ${err.message}`);
            failCount++;
          })
      );
    }
    
    // 下载主题包
    if (theme.download) {
      const downloadExt = path.extname(theme.download.split('?')[0]) || '.zip';
      const downloadFilename = `${themeName}-${theme.version}${downloadExt}`;
      const downloadPath = path.join(resourcesDir, downloadFilename);

      downloadPromises.push(
        downloadFile(theme.download, downloadPath)
          .then(() => {
            // 直接替换原始字段为完整 URL
            const baseUrl = process.env.BASE_URL || 'https://theme-market-cn.edgeonepages.com';
            theme.download = `${baseUrl}/resources/${downloadFilename}`;
            successCount++;
            console.log(`  ✓ 主题包：${themeName} v${theme.version}`);
          })
          .catch(err => {
            console.error(`  ✗ 主题包失败：${themeName} - ${err.message}`);
            failCount++;
          })
      );
    }
  }
  
  await Promise.allSettled(downloadPromises);
  console.log(`✅ 下载完成：成功 ${successCount}，失败 ${failCount}`);
}

// 构建 HTML 页面
function buildIndexHtml(v1Data) {
  console.log('构建主题市场页面...');
  
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
            <div id="theme-list" class="theme-list">
                <p>加载中...</p>
            </div>
        </div>

        <div class="footer">
            <p>Powered by <a href="https://cloud.tencent.com/product/eo" target="_blank">EdgeOne Pages</a> | 自动同步上游仓库 | 资源已缓存到国内 CDN</p>
        </div>
    </div>

    <script>
        async function loadThemes() {
            try {
                const response = await fetch('./v1.json');
                const data = await response.json();
                
                const themeList = document.getElementById('theme-list');
                themeList.innerHTML = '';
                
                data.themes.forEach(theme => {
                    const name = theme.name['zh-CN'] || theme.name;
                    const description = theme.description['zh-CN'] || theme.description || '暂无描述';
                    const author = theme.author['zh-CN'] || theme.author;
                    const previewUrl = theme.preview;  // 已替换为完整 CDN URL
                    const downloadUrl = theme.download; // 已替换为完整 CDN URL
                    
                    const themeCard = document.createElement('div');
                    themeCard.className = 'theme-item';
                    themeCard.innerHTML = \`
                        <div class="theme-name">\${name}</div>
                        <div class="theme-description">\${description}</div>
                        <div class="theme-meta">
                            <span>v\${theme.version}</span>
                            <span>by \${author}</span>
                        </div>
                        <a href="\${theme.url}" target="_blank" class="theme-link">查看详情 →</a>
                    \`;
                    
                    themeList.appendChild(themeCard);
                });
                
                console.log(\`✅ 加载了 \${data.themes.length} 个主题\`);
            } catch (error) {
                console.error('加载主题失败:', error);
                document.getElementById('theme-list').innerHTML = '<p>加载失败，请刷新页面重试</p>';
            }
        }

        window.addEventListener('DOMContentLoaded', loadThemes);
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
  console.log('✅ 生成主题市场页面');
}

// 主构建流程
async function build() {
  try {
    // 复制主题目录文件到构建目录
    if (!fs.existsSync(dataDir)) {
      console.log('⚠️  data 目录不存在，创建空目录');
      fs.mkdirSync(distDir, { recursive: true });
      return;
    }
    
    console.log('复制主题目录文件...');
    fs.cpSync(dataDir, distDir, { recursive: true });
    
    // 读取主题目录
    const v1JsonPath = path.join(dataDir, 'v1.json');
    if (!fs.existsSync(v1JsonPath)) {
      console.log('⚠️  v1.json 不存在');
      return;
    }

    const v1Data = JSON.parse(fs.readFileSync(v1JsonPath, 'utf8'));
    console.log(`📊 加载 ${v1Data.themes.length} 个主题`);

    // 显示 BASE_URL 配置
    const baseUrl = process.env.BASE_URL || 'https://theme-market-cn.edgeonepages.com';
    console.log(`🌐 基础 URL: ${baseUrl}`);
    
    // 下载资源
    await downloadThemeResources(v1Data, distDir);
    
    // 更新 v1.json（所有链接已替换为 CDN URL）
    const updatedV1Path = path.join(distDir, 'v1.json');
    fs.writeFileSync(updatedV1Path, JSON.stringify(v1Data, null, 2), 'utf8');
    console.log('✓ 更新了 v1.json，所有资源链接已替换为 CDN URL');
    
    // 构建 HTML 页面
    buildIndexHtml(v1Data);

    console.log('✅ 构建完成！');
    console.log(`📁 输出目录: ${distDir}`);
    console.log(`📊 包含 ${v1Data.themes.length} 个主题`);

    // 清理 HTTP agents，确保进程退出
    https.globalAgent.destroy();
    http.globalAgent.destroy();

    // 显式退出进程
    process.exit(0);

  } catch (error) {
    console.error('❌ 构建失败：', error);
    process.exit(1);
  }
}

// 执行构建
build();