# Theme Market CN

自动同步上游仓库主题源，并通过 EdgeOne Pages 托管。

## 功能特性

- 🔄 自动监测上游仓库更新
- 📦 自动同步主题源文件
- 🚀 通过 EdgeOne Pages 托管，国内访问速度快
- ⚡ GitHub Actions 自动化部署

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
node scripts/sync-upstream.js

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
│   └── sync-upstream.js           # 同步脚本
├── themes/                        # 主题源文件目录
├── package.json                   # 项目配置
├── edgeone.config.json            # EdgeOne 配置
└── README.md                      # 本文件
```

## 许可证

请遵循上游仓库的许可证。