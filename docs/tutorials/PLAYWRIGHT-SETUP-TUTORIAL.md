# 📖 Playwright 浏览器安装详细教程

> **适用场景**: Claude Code 环境无法直接下载 Playwright 浏览器
> **解决方案**: GitHub Release + 自动化脚本
> **难度等级**: ⭐⭐ (中等)
> **预计时间**: 15-30 分钟

---

## 📚 目录

1. [前置准备](#前置准备)
2. [第一部分：本地操作（在您的电脑上）](#第一部分本地操作在您的电脑上)
3. [第二部分：上传到 GitHub Release](#第二部分上传到-github-release)
4. [第三部分：Claude Code 环境安装](#第三部分claude-code-环境安装)
5. [第四部分：验证和测试](#第四部分验证和测试)
6. [故障排除](#故障排除)

---

## 前置准备

### ✅ 检查清单

在开始之前，请确保：

- [ ] 本地已安装 Playwright（`npm install -D playwright`）
- [ ] 本地 Playwright 浏览器已下载（`npx playwright install`）
- [ ] 有 GitHub 账户访问权限
- [ ] 了解基本的命令行操作

### 📦 所需工具

| 工具 | 用途 | 如何获取 |
|------|------|---------|
| **终端/命令行** | 执行命令 | Mac: Terminal, Windows: PowerShell |
| **压缩工具** | 打包文件 | tar (Linux/Mac), 7-Zip (Windows) |
| **GitHub 账户** | 上传文件 | https://github.com |
| **文本编辑器** | 查看文件 | VS Code, Notepad++, 等 |

---

## 第一部分：本地操作（在您的电脑上）

### 步骤 1.1：打开终端

**Mac/Linux:**
```bash
# 按 Command+Space，输入 "Terminal"，回车
# 或者在应用程序 > 实用工具 > 终端
```

**Windows:**
```powershell
# 按 Win+X，选择 "Windows PowerShell"
# 或者搜索 "PowerShell"
```

---

### 步骤 1.2：定位 Playwright 浏览器目录

复制粘贴以下命令并执行：

**Mac/Linux:**
```bash
cd ~/.cache/ms-playwright
ls -la
```

**预期输出：**
```
drwxr-xr-x  chromium-1117/
drwxr-xr-x  firefox-1398/
drwxr-xr-x  webkit-1895/
```

**Windows:**
```powershell
cd $env:USERPROFILE\AppData\Local\ms-playwright
dir
```

**预期输出：**
```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        12/28/2025   3:00 PM                chromium-1117
d-----        12/28/2025   3:01 PM                firefox-1398
d-----        12/28/2025   3:02 PM                webkit-1895
```

> **💡 提示**: 如果看不到这些文件夹，说明 Playwright 浏览器未安装。请先运行：
> ```bash
> npx playwright install
> ```

---

### 步骤 1.3：检查浏览器版本

```bash
# 查看 Playwright 版本
npx playwright --version
```

**预期输出：**
```
Version 1.40.0
```

> **📝 记录这个版本号**，稍后创建 Release 时需要用到！

---

### 步骤 1.4：检查文件大小

**Mac/Linux:**
```bash
du -sh chromium-* firefox-* webkit-*
```

**预期输出：**
```
140M    chromium-1117
 85M    firefox-1398
 75M    webkit-1895
```

**Windows:**
```powershell
Get-ChildItem -Directory | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round((Get-ChildItem $_.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)}}
```

> **💡 建议**: 只打包 Chromium（~140MB），可以节省空间和上传时间。

---

### 步骤 1.5：打包浏览器文件

#### 选项 A：只打包 Chromium（推荐）

**Mac/Linux:**
```bash
# 注意：替换版本号为您的实际版本
tar -czf ~/playwright-chromium-linux-v1.40.0.tar.gz chromium-*/

# 检查生成的文件
ls -lh ~/playwright-chromium-*.tar.gz
```

**预期输出：**
```
-rw-r--r--  1 user  staff    82M Dec 28 15:30 playwright-chromium-linux-v1.40.0.tar.gz
```

**Windows:**
```powershell
# 注意：替换版本号为您的实际版本
Compress-Archive -Path chromium-* -DestinationPath $env:USERPROFILE\playwright-chromium-win-v1.40.0.zip

# 检查生成的文件
Get-Item $env:USERPROFILE\playwright-chromium-*.zip | Select-Object Name, Length
```

**预期输出：**
```
Name                                    Length
----                                    ------
playwright-chromium-win-v1.40.0.zip  86016000
```

#### 选项 B：打包所有浏览器（可选）

**Mac/Linux:**
```bash
tar -czf ~/playwright-all-browsers-linux-v1.40.0.tar.gz */
ls -lh ~/playwright-all-*.tar.gz
```

**Windows:**
```powershell
Compress-Archive -Path * -DestinationPath $env:USERPROFILE\playwright-all-browsers-win-v1.40.0.zip
Get-Item $env:USERPROFILE\playwright-all-*.zip | Select-Object Name, Length
```

---

### 步骤 1.6：验证压缩包完整性

**Mac/Linux:**
```bash
# 查看压缩包内容（不解压）
tar -tzf ~/playwright-chromium-linux-v1.40.0.tar.gz | head -20
```

**预期输出：**
```
chromium-1117/
chromium-1117/chrome-linux/
chromium-1117/chrome-linux/chrome
chromium-1117/chrome-linux/chrome_100_percent.pak
...
```

**Windows:**
```powershell
# 查看压缩包内容
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::OpenRead("$env:USERPROFILE\playwright-chromium-win-v1.40.0.zip").Entries | Select-Object -First 20
```

> **✅ 检查点**: 确认压缩包中包含 `chromium-*/chrome-linux/chrome` 或类似路径。

---

## 第二部分：上传到 GitHub Release

### 步骤 2.1：打开 GitHub 仓库

1. 打开浏览器
2. 访问：https://github.com/indmoo86-ai/AijlCRM
3. 登录您的 GitHub 账户

---

### 步骤 2.2：创建新 Release

#### 方法 A：通过 Web 界面（推荐，图形化界面）

**第 1 步：进入 Releases 页面**

```
点击右侧边栏 "Releases" → 点击 "Create a new release"
```

或直接访问：https://github.com/indmoo86-ai/AijlCRM/releases/new

**第 2 步：填写 Release 信息**

| 字段 | 填写内容 | 示例 |
|------|---------|------|
| **Choose a tag** | `playwright-browsers-v{版本号}` | `playwright-browsers-v1.40.0` |
| **Release title** | `Playwright Browsers v{版本号}` | `Playwright Browsers v1.40.0` |
| **Description** | 见下方模板 | - |

**Description 模板：**
```markdown
# Playwright 浏览器二进制文件

## 📦 包含内容

- **Chromium**: v1.40.0 (Linux x64)
- **文件大小**: ~82 MB (压缩后)
- **原始大小**: ~140 MB

## 🎯 用途

- 用于 Claude Code 环境的 Playwright E2E 测试
- 解决 `cdn.playwright.dev` 无法访问的问题

## 📥 安装方法

在 Claude Code 环境中运行：

\`\`\`bash
cd /home/user/AijlCRM
bash scripts/install-playwright-browsers.sh
\`\`\`

或手动安装：

\`\`\`bash
wget https://github.com/indmoo86-ai/AijlCRM/releases/download/playwright-browsers-v1.40.0/playwright-chromium-linux-v1.40.0.tar.gz
mkdir -p ~/.cache/ms-playwright
tar -xzf playwright-chromium-linux-v1.40.0.tar.gz -C ~/.cache/ms-playwright/
chmod -R 755 ~/.cache/ms-playwright/chromium-*/
\`\`\`

## ✅ 验证

\`\`\`bash
npx playwright --version
node -e "require('playwright').chromium.launch().then(b => b.close())"
\`\`\`

---

**上传时间**: 2025-12-28
**维护者**: @indmoo86-ai
```

**第 3 步：上传文件**

1. 找到页面底部的 "Attach binaries by dropping them here or selecting them" 区域
2. 点击或拖放您的压缩包文件：
   - `playwright-chromium-linux-v1.40.0.tar.gz` (Mac/Linux)
   - `playwright-chromium-win-v1.40.0.zip` (Windows)

**上传进度示例：**
```
⬆️ 上传中... playwright-chromium-linux-v1.40.0.tar.gz (82 MB)
[████████████████████████████████████] 100%
✅ 上传完成
```

**第 4 步：发布 Release**

1. 检查所有信息是否正确
2. 点击绿色按钮 **"Publish release"**
3. 等待页面刷新

**成功标志：**
```
✅ Release "Playwright Browsers v1.40.0" has been published
```

---

#### 方法 B：通过 GitHub CLI（高级用户）

**前置条件：**
```bash
# 安装 GitHub CLI
# Mac
brew install gh

# Linux (Debian/Ubuntu)
sudo apt install gh

# Windows
winget install GitHub.cli
```

**执行命令：**
```bash
# 1. 登录 GitHub
gh auth login

# 按照提示选择：
# - GitHub.com
# - HTTPS
# - Yes (认证)
# - Login with a web browser

# 2. 创建 Release
gh release create playwright-browsers-v1.40.0 \
  ~/playwright-chromium-linux-v1.40.0.tar.gz \
  --repo indmoo86-ai/AijlCRM \
  --title "Playwright Browsers v1.40.0" \
  --notes "Chromium browser binaries for Playwright testing in Claude Code environment"
```

**预期输出：**
```
✓ Created release Playwright Browsers v1.40.0
  https://github.com/indmoo86-ai/AijlCRM/releases/tag/playwright-browsers-v1.40.0
```

---

### 步骤 2.3：获取并验证下载链接

**下载链接格式：**
```
https://github.com/{owner}/{repo}/releases/download/{tag}/{filename}
```

**您的下载链接：**
```
https://github.com/indmoo86-ai/AijlCRM/releases/download/playwright-browsers-v1.40.0/playwright-chromium-linux-v1.40.0.tar.gz
```

**验证下载链接（可选）：**

在本地终端测试下载：
```bash
# 测试下载（不保存文件）
curl -I "https://github.com/indmoo86-ai/AijlCRM/releases/download/playwright-browsers-v1.40.0/playwright-chromium-linux-v1.40.0.tar.gz"
```

**预期输出：**
```
HTTP/2 200
content-type: application/gzip
content-length: 86016000
...
```

> **✅ 检查点**: HTTP 状态码应该是 200，表示文件可访问。

---

## 第三部分：Claude Code 环境安装

现在切换到 Claude Code 环境进行安装。

### 步骤 3.1：检查自动安装脚本

**在 Claude Code 中执行：**
```bash
# 查看脚本是否存在
ls -la /home/user/AijlCRM/scripts/install-playwright-browsers.sh

# 查看脚本内容（可选）
cat /home/user/AijlCRM/scripts/install-playwright-browsers.sh
```

**预期输出：**
```
-rwxr-xr-x 1 user user 2468 Dec 28 15:00 install-playwright-browsers.sh
```

> **💡 注意**: 如果文件不存在，说明可能需要先 `git pull` 拉取最新代码。

---

### 步骤 3.2：更新安装脚本中的版本号

**编辑脚本（如果版本号不匹配）：**

```bash
# 使用 sed 更新版本号（示例：从 1.40.0 改为 1.41.0）
sed -i 's/PLAYWRIGHT_VERSION="1.40.0"/PLAYWRIGHT_VERSION="1.41.0"/' \
  /home/user/AijlCRM/scripts/install-playwright-browsers.sh

# 验证修改
grep PLAYWRIGHT_VERSION /home/user/AijlCRM/scripts/install-playwright-browsers.sh
```

**预期输出：**
```
PLAYWRIGHT_VERSION="1.40.0"
```

---

### 步骤 3.3：运行自动安装脚本

**执行安装：**
```bash
cd /home/user/AijlCRM
bash scripts/install-playwright-browsers.sh
```

**安装过程输出（示例）：**
```bash
========================================
  Playwright 浏览器安装脚本
========================================

📦 下载 Playwright 浏览器...
   URL: https://github.com/indmoo86-ai/AijlCRM/releases/download/playwright-browsers-v1.40.0/playwright-chromium-linux-v1.40.0.tar.gz

playwright-chromium-linux-v1.40.0.tar.gz 100%[===================>]  82.00M  10.5MB/s    in 8.2s

📂 解压浏览器文件...
chromium-1117/
chromium-1117/chrome-linux/
chromium-1117/chrome-linux/chrome
...

🔧 设置执行权限...

✅ 验证安装...
✅ Chromium 已安装: /home/user/.cache/ms-playwright/chromium-1117/chrome-linux/chrome
-rwxr-xr-x 1 user user 145234234 Dec 28 15:45 /home/user/.cache/ms-playwright/chromium-1117/chrome-linux/chrome

========================================
  安装完成！
========================================

请在 .bashrc 或 .zshrc 中添加以下环境变量：

export PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/ms-playwright
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

或者在运行测试前执行：
export PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/ms-playwright
```

> **✅ 检查点**: 看到 "✅ Chromium 已安装" 和可执行文件路径，说明安装成功。

---

### 步骤 3.4：设置环境变量

**临时设置（当前会话）：**
```bash
export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

**永久设置（推荐）：**
```bash
# 添加到 .bashrc
echo 'export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright' >> ~/.bashrc
echo 'export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1' >> ~/.bashrc

# 重新加载配置
source ~/.bashrc

# 验证
echo $PLAYWRIGHT_BROWSERS_PATH
```

**预期输出：**
```
/home/user/.cache/ms-playwright
```

---

## 第四部分：验证和测试

### 步骤 4.1：检查浏览器文件

```bash
# 查看已安装的浏览器
ls -la ~/.cache/ms-playwright/

# 查找 Chrome 可执行文件
find ~/.cache/ms-playwright -name "chrome" -type f
```

**预期输出：**
```
drwxr-xr-x 4 user user     4096 Dec 28 15:45 chromium-1117

/home/user/.cache/ms-playwright/chromium-1117/chrome-linux/chrome
```

---

### 步骤 4.2：测试 Playwright Chromium 启动

```bash
cd /home/user/AijlCRM/tests/e2e

node -e "
const { chromium } = require('playwright');
(async () => {
  try {
    console.log('🚀 启动 Chromium...');
    const browser = await chromium.launch({ headless: true });
    console.log('✅ Chromium 启动成功!');

    const context = await browser.newContext();
    console.log('✅ 浏览器上下文创建成功');

    const page = await context.newPage();
    console.log('✅ 页面创建成功');

    await browser.close();
    console.log('✅ 浏览器已关闭');
    console.log('');
    console.log('🎉 所有测试通过！Playwright 工作正常。');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
})();
"
```

**预期输出：**
```
🚀 启动 Chromium...
✅ Chromium 启动成功!
✅ 浏览器上下文创建成功
✅ 页面创建成功
✅ 浏览器已关闭

🎉 所有测试通过！Playwright 工作正常。
```

---

### 步骤 4.3：运行实际测试

```bash
# 安装测试依赖
cd /home/user/AijlCRM/tests/e2e
npm install

# 运行所有测试
npx playwright test

# 或运行特定测试
npx playwright test login.spec.js
```

**预期输出（成功）：**
```
Running 5 tests using 1 worker

  ✓  tests/login.spec.js:3:1 › should login successfully (2s)
  ✓  tests/customer.spec.js:5:1 › should create customer (3s)
  ✓  tests/quotation.spec.js:7:1 › should create quotation (2s)

  5 passed (10s)
```

---

## 故障排除

### 问题 1: 下载失败 "403 Forbidden"

**症状：**
```
wget: server returned error: HTTP/1.1 403 Forbidden
```

**可能原因：**
- Release 是私有的（需要设置为 Public）
- 下载链接错误

**解决方案：**
```bash
# 1. 检查 Release 是否公开
# 访问 https://github.com/indmoo86-ai/AijlCRM/releases
# 确保可以看到 Release

# 2. 验证下载链接
curl -I "YOUR_DOWNLOAD_LINK"

# 3. 如果仍然 403，尝试使用 GitHub token
wget --header="Authorization: token YOUR_GITHUB_TOKEN" "DOWNLOAD_LINK"
```

---

### 问题 2: 解压失败

**症状：**
```
tar: Error is not recoverable: exiting now
```

**可能原因：**
- 压缩包损坏
- 磁盘空间不足

**解决方案：**
```bash
# 1. 检查磁盘空间
df -h

# 2. 验证压缩包完整性
tar -tzf playwright-chromium-linux-v1.40.0.tar.gz | wc -l

# 3. 重新下载
rm playwright-chromium-linux-v1.40.0.tar.gz
wget "DOWNLOAD_LINK"
```

---

### 问题 3: Chromium 启动失败

**症状：**
```
Error: browserType.launch: Executable doesn't exist at /home/user/.cache/ms-playwright/chromium-1117/chrome-linux/chrome
```

**可能原因：**
- 文件权限问题
- 路径不正确
- 缺少系统依赖

**解决方案：**
```bash
# 1. 检查文件是否存在
ls -la ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome

# 2. 设置正确权限
chmod +x ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome

# 3. 安装系统依赖
npx playwright install-deps chromium

# 4. 设置环境变量
export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright
```

---

### 问题 4: "Cannot find module 'playwright'"

**症状：**
```
Error: Cannot find module 'playwright'
```

**解决方案：**
```bash
# 安装 Playwright
cd /home/user/AijlCRM/tests/e2e
npm install -D playwright

# 或者在项目根目录
cd /home/user/AijlCRM
npm install -D playwright
```

---

### 问题 5: 版本不匹配

**症状：**
```
Error: Chromium 1117 is not compatible with Playwright 1.41.0
```

**解决方案：**
```bash
# 检查 Playwright 版本
npx playwright --version

# 检查浏览器版本
ls ~/.cache/ms-playwright/

# 重新下载匹配版本的浏览器
# 或更新 Playwright 到匹配版本
npm install -D playwright@1.40.0
```

---

## 📊 完成检查清单

安装完成后，请确认以下所有项：

- [ ] 压缩包已成功创建（文件大小 80-100 MB）
- [ ] GitHub Release 已成功发布
- [ ] 下载链接可访问（curl 返回 200）
- [ ] 浏览器文件已解压到 `~/.cache/ms-playwright/`
- [ ] Chrome 可执行文件存在且有执行权限
- [ ] 环境变量已设置
- [ ] `npx playwright --version` 有输出
- [ ] Node.js 测试脚本成功启动 Chromium
- [ ] `npx playwright test` 可以运行

---

## 🎉 恭喜！

如果所有步骤都成功，您现在可以在 Claude Code 环境中使用 Playwright 进行 E2E 测试了！

### 下一步

- 运行完整的测试套件
- 编写新的测试用例
- 配置 CI/CD 集成

### 需要帮助？

如果遇到问题：
1. 查看本文档的"故障排除"部分
2. 检查 GitHub Issues: https://github.com/indmoo86-ai/AijlCRM/issues
3. 联系项目维护者

---

**教程版本**: 1.0
**更新时间**: 2025-12-28
**作者**: Claude Code Assistant
**适用版本**: Playwright 1.40.0+
