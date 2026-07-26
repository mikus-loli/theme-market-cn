# Theme Market CN

自动同步上游仓库主题源，并通过 EdgeOne Pages 托管。**构建时自动下载所有主题资源到本地，实现全链路国内加速！**

## 功能特性

- 🔄 自动监测上游仓库更新
- 📦 自动同步主题源文件
- 🚀 通过 EdgeOne Pages 托管，国内访问速度快
- ⚡ **构建时下载所有资源到本地**（预览图、主题包）
- 🎯 零成本方案，免费额度足够个人使用
- 🤖 GitHub Actions 自动化部署

## 加速原理

```
传统访问方式：
用户 → GitHub（国外）→ 预览图/下载文件（慢）

EdgeOne 加速方式：
构建时：下载所有资源 → 上传到 EdgeOne CDN
用户访问时：直接从 EdgeOne CDN 获取（快）
```

### 加速范围

- ✅ v1.json 主题目录文件
- ✅ 所有预览图（preview）已缓存到本地
- ✅ 所有主题包（download）已缓存到本地
- ✅ 完全不依赖 GitHub 实时可用性

## 构建流程

```
1. 同步上游 v1.json → data/v1.json
2. 下载所有预览图 → dist/resources/*.png（约 5-10 MB）
3. 下载所有主题包 → dist/resources/*.zip（约 50-100 MB）
4. 替换 v1.json 中的所有链接为 CDN URL
5. 生成主题市场页面 → dist/index.html
6. 部署到 EdgeOne Pages（约 1-2 分钟）
```

### 资源链接替换

构建时会将所有 GitHub 链接替换为 EdgeOne CDN URL：

**替换前**：
```json
{
  "preview": "https://raw.githubusercontent.com/user/repo/main/preview.png",
  "download": "https://github.com/user/repo/releases/download/v1.0/theme.zip"
}
```

**替换后**：
```json
{
  "preview": "https://theme-market-cn.edgeonepages.com/resources/ThemeName-preview.png",
  "download": "https://theme-market-cn.edgeonepages.com/resources/ThemeName-1.0.zip"
}
```

## 配置说明

### 1. 设置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- `EDGEONE_API_TOKEN`: EdgeOne API Token（获取方式见下方）
- `UPSTREAM_REPO`: 上游仓库地址（例如：`https://github.com/komari-monitor/theme-market`）
- `BASE_URL`: EdgeOne Pages 部署域名（可选，默认：`https://theme-market-cn.edgeonepages.com`）

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
- **自动构建**：有更新时自动下载资源并部署到 EdgeOne

## 本地开发

```bash
# 安装依赖（如果有）
npm install

# 本地测试（注意：构建会下载所有资源，可能需要较长时间）
npm run build

# 手动同步上游
npm run sync

# 部署到 EdgeOne
npx edgeone makers deploy ./dist -n theme-market-cn -t $EDGEONE_API_TOKEN
```

## 项目结构

```
.
├── .github/
│   └── workflows/
│       └── sync-and-deploy.yml    # GitHub Actions 工作流
├── scripts/
│   ├── sync-upstream.js           # 同步脚本
│   └── build.js                   # 构建脚本（下载资源）
├── data/                          # 主题源文件目录
│   └── v1.json                    # 主题目录（原始）
├── dist/                          # 构建输出
│   ├── index.html                 # 主题市场首页
│   ├── v1.json                    # 主题目录（本地链接）
│   └── resources/                 # 本地缓存的资源
│       ├── *-preview.png         # 预览图
│       └── *-*.zip               # 主题包
├── package.json                   # 项目配置
├── edgeone.config.json            # EdgeOne 配置
└── README.md                      # 本文件
```

## 性能优势

| 资源类型 | 传统方式 | EdgeOne 加速 |
|---------|---------|-------------|
| v1.json | GitHub 直连（慢） | EdgeOne CDN（快）|
| 预览图 | GitHub 直连（慢） | 本地缓存（快）|
| 主题下载 | GitHub 直连（慢） | 本地缓存（快）|

### 构建时间估算

- 23 个主题
- 预览图：约 23 张图片，总大小约 5-10 MB
- 主题包：约 23 个 ZIP 文件，总大小约 50-100 MB
- 预计构建时间：1-2 分钟
- 预计部署时间：1-2 分钟（上传约 20MB）

## 优势对比

### 边缘函数代理方案（之前）
- ✅ 实时代理，无需下载
- ❌ 依赖 GitHub 实时可用性
- ❌ 仍然需要跨域请求

### 本地缓存方案（当前）
- ✅ 不依赖 GitHub 实时可用性
- ✅ 所有资源从 CDN 获取，速度极快
- ✅ 构建时间约 1-2 分钟
- ✅ 部署时间约 1-2 分钟
- ✅ 支持离线访问

## 许可证

请遵循上游仓库的许可证。