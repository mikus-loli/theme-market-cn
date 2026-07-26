# Theme Market CN

自动同步上游仓库主题源，并通过 EdgeOne Pages 托管。**所有 GitHub 资源通过边缘函数加速，国内访问超快！**

## 功能特性

- 🔄 自动监测上游仓库更新
- 📦 自动同步主题源文件
- 🚀 通过 EdgeOne Pages 托管，国内访问速度快
- ⚡ **GitHub 资源通过边缘函数加速**（预览图、下载链接）
- 🎯 零成本方案，免费额度足够个人使用
- 🤖 GitHub Actions 自动化部署

## 加速原理

```
传统访问方式：
用户 → GitHub（国外）→ 预览图/下载文件（慢）

EdgeOne 加速方式：
用户 → EdgeOne CDN（国内）→ v1.json（快）
     → EdgeOne 边缘函数（国内）→ GitHub 资源（快）
```

### 加速范围

- ✅ v1.json 主题目录文件
- ✅ 预览图（preview）
- ✅ 主题下载链接（download）
- ✅ GitHub API 请求
- ✅ 其他 GitHub 资源

## 配置说明

### 1. 设置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- `EDGEONE_API_TOKEN`: EdgeOne API Token（获取方式见下方）
- `UPSTREAM_REPO`: 上游仓库地址（例如：`https://github.com/komari-monitor/theme-market`）

#### 获取 EdgeOne API Token

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 访问 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
3. 点击右上角头像 → API 密钥管理
4. 创建新的 API 密钥并复制

### 2. 配置 EdgeOne Pages

1. 在 EdgeOne 控制台创建 Pages 项目
2. 项目名称设置为 `theme-market-cn`（或自定义）
3. 记录项目 ID

### 3. 启用 GitHub Actions

推送到 GitHub 后，Actions 会自动运行：

- **定时同步**：每天自动检查上游更新
- **手动触发**：可在 Actions 页面手动触发同步
- **自动部署**：有更新时自动部署到 EdgeOne

## 本地开发

```bash
# 安装依赖（如果有）
npm install

# 本地测试
npm run dev

# 手动同步上游
npm run sync

# 构建项目
npm run build

# 部署到 EdgeOne
npx edgeone makers deploy ./dist -n theme-market-cn -t $EDGEONE_API_TOKEN
```

## 边缘函数 API

### GitHub 资源代理

**端点**: `/api/proxy`

**方法**: `GET`

**参数**:
- `url` (必需): 要代理的 GitHub URL

**示例**:
```javascript
// 原始链接
const originalUrl = 'https://raw.githubusercontent.com/user/repo/main/image.png';

// 通过边缘函数代理
const proxiedUrl = '/api/proxy?url=' + encodeURIComponent(originalUrl);
```

**支持的 GitHub 域名**:
- github.com
- raw.githubusercontent.com
- github.githubassets.com
- objects.githubusercontent.com
- opengraph.githubassets.com

## 项目结构

```
.
├── .github/
│   └── workflows/
│       └── sync-and-deploy.yml    # GitHub Actions 工作流
├── functions/
│   └── api/
│       └── proxy.js               # GitHub 资源代理边缘函数
├── scripts/
│   ├── sync-upstream.js           # 同步脚本
│   └── build.js                   # 构建脚本
├── data/                          # 主题源文件目录
│   └── v1.json                    # 主题目录
├── dist/                          # 构建输出
│   ├── index.html                 # 主题市场首页
│   └── v1.json                    # 主题目录
├── package.json                   # 项目配置
├── edgeone.config.json            # EdgeOne 配置
└── README.md                      # 本文件
```

## 性能优化

### 预览图加载
- 通过边缘函数从 GitHub 代理到国内
- 自动添加 CORS 头，支持跨域
- 支持流式传输，节省内存

### 主题下载
- Release 附件通过边缘函数加速
- 支持大文件流式转发
- 自动处理重定向

### 安全性
- 仅允许代理 GitHub 官方域名
- 自动删除可能冲突的安全头
- 支持跨域访问控制

## 许可证

请遵循上游仓库的许可证。