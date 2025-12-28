# Playwright 浏览器设置指南

## 📋 目录

1. [问题说明](#问题说明)
2. [解决方案对比](#解决方案对比)
3. [推荐方案：GitHub Release](#推荐方案github-release)
4. [本地操作步骤](#本地操作步骤)
5. [Claude Code 环境安装](#claude-code-环境安装)
6. [验证安装](#验证安装)

---

## 问题说明

Claude Code 环境由于网络限制，无法直接下载 Playwright 浏览器二进制文件（cdn.playwright.dev 被阻止）。

需要手动将浏览器文件上传到项目中。

---

## 解决方案对比

| 方案 | 文件大小限制 | 带宽限制 | 仓库影响 | 推荐度 |
|------|-------------|---------|---------|--------|
| **GitHub Release** | 2 GB/文件 | 无限制 | 无影响 | ⭐⭐⭐⭐⭐ |
| Git LFS | 2 GB/文件 | 1 GB/月 | 无影响 | ⭐⭐⭐ |
| 直接提交 | 100 MB/文件 | 无限制 | 变慢 | ⭐ |
| 云存储 | 无限制 | 取决于服务 | 无影响 | ⭐⭐⭐⭐ |
| Docker 镜像 | 无限制 | 无限制 | 无影响 | ⭐⭐⭐⭐⭐ |

**结论**：推荐使用 **GitHub Release** 方案。

---

## 推荐方案：GitHub Release

### 优点

- ✅ 单个文件可达 2GB（足够所有浏览器）
- ✅ 不占用 Git LFS 配额
- ✅ 不影响仓库克隆速度
- ✅ 下载速度快（GitHub CDN）
- ✅ 可以版本化管理
- ✅ 可以随时更新/删除

### 缺点

- ⚠️ 需要手动创建 Release
- ⚠️ 需要手动上传文件

---

## 本地操作步骤

### 第 1 步：查找 Playwright 浏览器位置

```bash
# Linux/Mac
echo $HOME/.cache/ms-playwright

# Windows
echo %USERPROFILE%\AppData\Local\ms-playwright
```

### 第 2 步：打包浏览器文件

**选项 A：只打包 Chromium（推荐，~80-100 MB）**

```bash
# Linux/Mac
cd ~/.cache/ms-playwright
tar -czf ~/playwright-chromium-linux-v1.40.0.tar.gz chromium-*/

# Windows PowerShell
cd $env:USERPROFILE\AppData\Local\ms-playwright
Compress-Archive -Path chromium-* -DestinationPath $env:USERPROFILE\playwright-chromium-win-v1.40.0.zip
```

**选项 B：打包所有浏览器（~250-350 MB）**

```bash
# Linux/Mac
cd ~/.cache/ms-playwright
tar -czf ~/playwright-all-browsers-linux-v1.40.0.tar.gz */

# Windows PowerShell
cd $env:USERPROFILE\AppData\Local\ms-playwright
Compress-Archive -Path * -DestinationPath $env:USERPROFILE\playwright-all-browsers-win-v1.40.0.zip
```

### 第 3 步：验证压缩包

```bash
# Linux/Mac
ls -lh ~/playwright-chromium-*.tar.gz

# Windows PowerShell
Get-Item $env:USERPROFILE\playwright-chromium-*.zip | Select-Object Name, Length
```

### 第 4 步：创建 GitHub Release

#### 方法 A：通过 GitHub Web 界面（推荐）

1. 打开仓库：https://github.com/indmoo86-ai/AijlCRM
2. 点击右侧 **Releases** → **Create a new release**
3. 填写信息：
   - **Tag version**: `playwright-browsers-v1.40.0`
   - **Release title**: `Playwright Browsers v1.40.0`
   - **Description**:
     ```
     Playwright 浏览器二进制文件

     - Chromium v1.40.0 (Linux x64)
     - 文件大小: ~80-100 MB
     - 适用于 Claude Code 环境测试
     ```
4. 上传文件：将 `playwright-chromium-linux-v1.40.0.tar.gz` 拖放到附件区域
5. 点击 **Publish release**

#### 方法 B：通过 GitHub CLI（需要先安装 gh）

```bash
# 安装 GitHub CLI（如果未安装）
# Mac: brew install gh
# Linux: sudo apt install gh
# Windows: winget install GitHub.cli

# 登录 GitHub
gh auth login

# 创建 Release 并上传文件
gh release create playwright-browsers-v1.40.0 \
  ~/playwright-chromium-linux-v1.40.0.tar.gz \
  --repo indmoo86-ai/AijlCRM \
  --title "Playwright Browsers v1.40.0" \
  --notes "Chromium browser binaries for Playwright testing in Claude Code environment"
```

### 第 5 步：获取下载链接

Release 创建后，下载链接格式为：

```
https://github.com/{owner}/{repo}/releases/download/{tag}/{filename}

示例：
https://github.com/indmoo86-ai/AijlCRM/releases/download/playwright-browsers-v1.40.0/playwright-chromium-linux-v1.40.0.tar.gz
```

---

## Claude Code 环境安装

### 自动安装（推荐）

```bash
# 运行自动安装脚本
cd /home/user/AijlCRM
bash scripts/install-playwright-browsers.sh
```

脚本会自动：
1. 检查是否已安装
2. 从 GitHub Release 下载浏览器
3. 解压到正确位置
4. 设置执行权限
5. 验证安装

### 手动安装

```bash
# 1. 下载浏览器压缩包
cd /home/user/AijlCRM
wget https://github.com/indmoo86-ai/AijlCRM/releases/download/playwright-browsers-v1.40.0/playwright-chromium-linux-v1.40.0.tar.gz

# 2. 创建缓存目录
mkdir -p ~/.cache/ms-playwright

# 3. 解压
tar -xzf playwright-chromium-linux-v1.40.0.tar.gz -C ~/.cache/ms-playwright/

# 4. 设置权限
chmod -R 755 ~/.cache/ms-playwright/chromium-*/

# 5. 清理临时文件
rm playwright-chromium-linux-v1.40.0.tar.gz

# 6. 设置环境变量
export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

---

## 验证安装

### 检查浏览器文件

```bash
# 查看已安装的浏览器
ls -la ~/.cache/ms-playwright/

# 查看 Chromium 可执行文件
find ~/.cache/ms-playwright -name "chrome" -o -name "chromium"
```

### 测试 Playwright

```bash
# 测试 Chromium 启动
cd /home/user/AijlCRM/tests/e2e
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  console.log('✅ Chromium launched successfully!');
  await browser.close();
  console.log('✅ Browser closed');
})();
"
```

### 运行测试

```bash
# 运行 Playwright 测试
cd /home/user/AijlCRM/tests/e2e
npx playwright test

# 运行特定测试
npx playwright test login.spec.js
```

---

## 环境变量配置

### 临时设置（当前会话）

```bash
export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

### 永久设置（推荐）

```bash
# 添加到 .bashrc 或 .zshrc
echo 'export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright' >> ~/.bashrc
echo 'export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1' >> ~/.bashrc
source ~/.bashrc
```

### 在项目中配置

创建 `.env` 文件：

```bash
# tests/e2e/.env
PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/ms-playwright
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

---

## 常见问题

### Q1: 压缩包太大怎么办？

**A**: 只打包 Chromium（~80-100 MB），不要打包所有浏览器。

### Q2: GitHub Release 有文件数量限制吗？

**A**: 没有数量限制，但建议每个 Release 只上传必要的文件。

### Q3: 如何更新浏览器版本？

**A**:
1. 在本地安装新版本 Playwright
2. 重新打包浏览器
3. 创建新的 Release（使用新的 tag）
4. 更新安装脚本中的版本号

### Q4: 可以使用其他云存储吗？

**A**: 可以，但需要确保下载链接是直接链接（不需要登录）。参考方案：
- Google Drive（需要生成直接下载链接）
- Dropbox（将 `?dl=0` 改为 `?dl=1`）
- OneDrive（生成共享链接）

### Q5: Docker 方案如何实现？

**A**: 使用官方 Playwright Docker 镜像：

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "test"]
```

---

## 文件大小参考

| 浏览器 | 原始大小 | 压缩后大小 |
|--------|---------|-----------|
| Chromium | ~140-180 MB | ~80-100 MB |
| Firefox | ~80-120 MB | ~50-70 MB |
| WebKit | ~60-100 MB | ~40-60 MB |
| **全部** | **~280-400 MB** | **~170-270 MB** |

---

## 相关链接

- [Playwright 官方文档](https://playwright.dev/)
- [GitHub Release 文档](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Git LFS 文档](https://git-lfs.github.com/)

---

**更新时间**: 2025-12-28
**维护者**: Claude Code Assistant
**版本**: 1.0
