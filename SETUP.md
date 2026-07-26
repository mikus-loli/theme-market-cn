# 🚀 快速配置指南

## 一、准备工作

### 1. 必需条件
- ✅ GitHub 账号
- ✅ 腾讯云账号（用于 EdgeOne）
- ✅ Node.js v20.18.0 或更高版本

### 2. 获取 EdgeOne API Token

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 访问 [访问管理 - API 密钥管理](https://console.cloud.tencent.com/cam/capi)
3. 点击「新建密钥」
4. 复制生成的 **SecretId** 和 **SecretKey**
5. 将它们拼接为：`SecretId:SecretKey`（例如：`AKIDxxxx:xxxxx`）

## 二、GitHub 仓库配置

### 1. 创建 GitHub 仓库

```bash
# 初始化 Git 仓库（已完成）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始化项目"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/theme-market-cn.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 2. 配置 GitHub Secrets

进入 GitHub 仓库 → Settings → Secrets and variables → Actions，添加：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `EDGEONE_API_TOKEN` | `SecretId:SecretKey` | EdgeOne API 密钥 |
| `UPSTREAM_REPO` | `https://github.com/komari-monitor/theme-market` | 上游仓库地址 |

## 三、EdgeOne Pages 配置

### 方式一：使用 EdgeOne CLI（推荐）

```bash
# 安装 EdgeOne CLI
npm install -g edgeone

# 登录（会打开浏览器）
edgeone login

# 创建项目
edgeone makers create theme-market-cn

# 部署
npm run deploy
```

### 方式二：使用控制台

1. 访问 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)
2. 点击「新建项目」
3. 项目名称：`theme-market-cn`
4. 框架预设：其他
5. 构建命令：`npm run build`
6. 输出目录：`dist`
7. 点击「创建」

## 四、验证部署

### 1. 自动部署流程

推送到 GitHub 后，Actions 会自动运行：

```
GitHub Actions 工作流程：
┌─────────────┐
│ 1. 检查代码  │
└──────┬──────┘
       │
┌──────▼──────┐
│ 2. 同步上游 │ ← 每天 UTC 0:00 自动运行
└──────┬──────┘
       │
┌──────▼──────┐
│ 3. 构建项目 │
└──────┬──────┘
       │
┌──────▼──────┐
│ 4. 部署 EO  │
└─────────────┘
```

### 2. 手动触发部署

在 GitHub 仓库的 Actions 页面，可以手动触发工作流：
- 选择 `Sync Upstream and Deploy` 工作流
- 点击 `Run workflow`

### 3. 查看部署结果

- EdgeOne Pages 控制台：https://console.cloud.tencent.com/edgeone/pages
- 默认域名：`https://theme-market-cn.edgeonepages.com`
- 自定义域名：可在项目设置中绑定

## 五、自定义配置

### 1. 修改同步频率

编辑 `.github/workflows/sync-and-deploy.yml`：

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # 每6小时运行一次
```

### 2. 修改上游仓库地址

修改 GitHub Secret `UPSTREAM_REPO`，或编辑同步脚本：

```javascript
// scripts/sync-upstream.js
const UPSTREAM_REPO = 'https://github.com/your-username/your-repo';
```

### 3. 自定义构建输出

修改 `scripts/build.js` 来自定义生成的静态文件。

## 六、故障排查

### 问题1：GitHub Actions 失败

**检查清单：**
- ✅ GitHub Secrets 是否正确配置
- ✅ EdgeOne API Token 是否有效
- ✅ Node.js 版本是否为 20.18.0+

### 问题2：同步失败

**可能原因：**
- 上游仓库地址错误
- 网络问题导致克隆失败
- themes 目录不存在

**解决方法：**
```bash
# 手动测试同步
npm run sync
```

### 问题3：部署失败

**检查清单：**
- ✅ EdgeOne 项目是否创建
- ✅ API Token 权限是否足够
- ✅ 构建命令是否正确

**查看日志：**
```bash
# 本地测试构建
npm run build

# 查看输出
ls -la dist/
```

## 七、进阶功能

### 1. 绑定自定义域名

1. 在 EdgeOne Pages 项目设置中添加域名
2. 在 DNS 服务商添加 CNAME 记录指向 EdgeOne 提供的地址
3. 等待 SSL 证书自动签发

### 2. 添加通知功能

在 GitHub Actions 中添加通知步骤：

```yaml
- name: Send notification
  if: steps.check_changes.outputs.has_changes == 'true'
  run: |
    curl -X POST "YOUR_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"message\": \"主题市场已更新并部署成功！\"}"
```

### 3. 多环境部署

创建多个工作流分别部署到不同环境：

- `deploy-production.yml` → 生产环境
- `deploy-preview.yml` → 预览环境

## 八、常用命令

```bash
# 本地开发
npm run dev

# 手动同步
npm run sync

# 本地构建
npm run build

# 手动部署
npm run deploy

# 查看部署日志
edgeone makers logs theme-market-cn
```

## 九、相关链接

- [EdgeOne 官方文档](https://cloud.tencent.com/document/product/1552)
- [EdgeOne Pages 文档](https://cloud.tencent.com/document/product/1552/127365)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)

---

**🎉 配置完成后，您的主题市场将自动同步并部署到 EdgeOne Pages！**