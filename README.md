# Komari Theme Market CN

利用 EdgeOne 加速托管在 GitHub 上的 Komari 主题源（上游仓库 [`mikus-loli/theme-market`](https://github.com/mikus-loli/theme-market)），让国内用户能够稳定、快速地访问与下载主题资源。

## 工作原理

```
GitHub 上游仓库
     │  (定时同步)
     ▼
data/v1.json  ──►  构建脚本下载 preview / download 资源
     │                    │
     │                    ▼
     │             dist/resources/  (本地资源副本)
     │                    │
     ▼                    ▼
仅替换 v1.json 中的资源链接为 EdgeOne 加速链接
     │
     ▼
部署到 EdgeOne Pages → 用户通过 https://komari-market.mikus.ink 访问
```

**核心约束**：所有 URL 替换操作**仅针对 `v1.json` 文件**，其他文件结构与功能保持不变。

## 目录结构

```
theme-market-cn/
├── config/
│   └── config.json              # 全局配置（上游仓库、EdgeOne 域名、构建参数）
├── scripts/
│   ├── logger.js                # 日志系统（控制台 + 文件滚动）
│   ├── utils.js                 # 工具函数（下载、并发、文件操作）
│   ├── sync-upstream.js         # 上游同步脚本
│   └── build.js                 # 构建脚本（下载资源 + 替换 v1.json 链接）
├── data/                        # 同步下来的数据（v1.json 等）
│   ├── v1.json
│   └── .sync-meta.json
├── src/                         # 前端静态资源（可选）
├── dist/                        # 构建产物（部署到 EdgeOne）
│   ├── v1.json                  # 已替换为加速链接
│   ├── resources/               # 下载的资源副本
│   └── .build-meta.json
├── logs/                        # 日志文件（按天滚动）
├── .github/workflows/
│   └── sync-and-deploy.yml      # 定时同步 + 构建 + 部署工作流
└── package.json
```

## 快速开始

### 本地运行

```bash
# 1. 安装依赖（本项目的脚本仅使用 Node.js 内置模块，无需额外安装）
npm install   # 可选

# 2. 同步上游 v1.json
npm run sync

# 3. 构建并下载资源
npm run build

# 4. 一键同步 + 构建
npm run sync:build
```

构建完成后，`dist/` 目录可直接通过静态服务器或 EdgeOne Pages 部署。

### 配置说明

编辑 [config/config.json](config/config.json)：

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `upstream.repo` | 上游 GitHub 仓库 | `mikus-loli/theme-market` |
| `upstream.branch` | 上游分支 | `main` |
| `upstream.mirrorRawUrl` | GitHub raw 镜像地址（兜底） | `https://mirror.mikus.ink/...` |
| `edgeone.domain` | EdgeOne 加速域名 | `https://komari-market.mikus.ink` |
| `edgeone.resourcePath` | 资源 URL 路径 | `/resources/` |
| `build.concurrency` | 资源下载并发数 | `8` |
| `build.timeoutMs` | 单个资源下载超时 | `60000` |
| `build.maxRetries` | 下载失败重试次数 | `3` |
| `sync.schedule` | GitHub Actions cron 表达式 | `0 0 * * *`（每天一次） |
| `logging.dir` | 日志目录 | `logs` |
| `logging.maxFiles` | 日志保留天数 | `14` |

### 环境变量

| 变量 | 说明 |
|------|------|
| `BASE_URL` | 覆盖 `edgeone.domain`，用于自定义部署域名 |
| `GITHUB_TOKEN` | GitHub Token，提高 API 限流上限（CI 中自动注入） |
| `EDGEOONE_API_TOKEN` | EdgeOne API Token，用于命令行部署（可选） |

## 部署到 EdgeOne Pages

### 方式一：Git 集成自动部署（推荐）

1. 在 EdgeOne 控制台创建 Pages 项目，命名为 `theme-market-cn`
2. 关联本仓库，配置如下：
   - 构建命令：`npm run sync:build`
   - 输出目录：`dist`
   - 环境变量：`BASE_URL=https://komari-market.mikus.ink`
3. 绑定自定义域名 `komari-market.mikus.ink`
4. 每次 push 或定时任务触发后会自动部署

### 方式二：GitHub Actions 定时同步

仓库已配置 [.github/workflows/sync-and-deploy.yml](.github/workflows/sync-and-deploy.yml)：

- **触发时机**：每天 UTC 00:00（北京时间 08:00）、手动触发、push 到 main/master
- **执行流程**：
  1. `sync-upstream.js` 拉取上游 `v1.json`，对比本地无变化则跳过
  2. 检测到变化时提交到仓库
  3. `build.js` 下载所有 preview / download 资源，替换 `v1.json` 中的链接
  4. 提交 `dist/` 构建产物
  5. 若配置了 `EDGEOONE_API_TOKEN` 则调用 `edgeone makers deploy` 部署；否则由 EdgeOne Git 集成自动部署

#### 可选 Secrets

在仓库 Settings → Secrets and variables → Actions 中配置：

| Secret | 用途 |
|--------|------|
| `UPSTREAM_GITHUB_TOKEN` | 用于拉取上游私有仓库或提高限流（可选） |
| `EDGEOONE_API_TOKEN` | 用于命令行部署到 EdgeOne（可选） |

## 资源替换规则

构建脚本对 `v1.json` 中每个主题的以下字段进行替换：

| 字段 | 原始值 | 替换后 |
|------|--------|--------|
| `themes[].preview` | GitHub 上的图片 URL | `https://komari-market.mikus.ink/resources/{short}-preview.{ext}` |
| `themes[].download` | GitHub Release 主题包 URL | `https://komari-market.mikus.ink/resources/{short}-{version}.{ext}` |

**重要**：
- 下载失败的资源**保留原始 URL**，不影响其他资源替换
- 替换操作**仅修改 `dist/v1.json`**，原始 `data/v1.json` 保持不变
- 其他数据文件结构、前端静态资源均保持原样

## 日志系统

日志同时输出到控制台和 `logs/{YYYY-MM-DD}.log`，按天滚动，默认保留 14 天。

日志格式：
```
[2026-07-26T00:00:00.000Z] [INFO] [build] 下载成功 {"type":"preview","theme":"Mikus","size":49956,"url":"...","cdn":"..."}
```

日志分类：
- `[main]` 主流程
- `[main:sync]` 上游同步
- `[main:build]` 构建与资源替换

## 常用命令

```bash
# 同步上游
npm run sync

# 构建并替换资源链接
npm run build

# 同步 + 构建一条命令
npm run sync:build

# 本地预览（需安装 edgeone CLI）
npm run dev

# 命令行部署到 EdgeOne（需配置 EDGEOONE_API_TOKEN）
npm run deploy
```

## 许可证

MIT
