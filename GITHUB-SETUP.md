# GitHub 仓库设置指南

本文档指导你如何将艾居来 CRM 项目推送到 GitHub。

---

## 方式一：通过 GitHub 网页创建仓库（推荐）

### 步骤 1：创建 GitHub 仓库

1. 打开浏览器，访问 [GitHub](https://github.com)
2. 登录你的 GitHub 账号
3. 点击右上角的 "+" 按钮，选择 "New repository"
4. 填写仓库信息：
   - **Repository name**: `aijulai-crm`（或你喜欢的名称）
   - **Description**: `艾居来 CRM - 酒店智能硬件营销客户关系管理系统`
   - **Visibility**:
     - 选择 **Private**（私有仓库，仅你可见）
     - 或选择 **Public**（公开仓库，任何人可见）
   - **⚠️ 重要**:
     - **不要勾选** "Add a README file"
     - **不要勾选** "Add .gitignore"
     - **不要勾选** "Choose a license"
     - （因为项目已经有这些文件）
5. 点击 "Create repository" 按钮

### 步骤 2：推送本地代码到 GitHub

创建仓库后，GitHub 会显示推送代码的命令。请在终端中执行：

```bash
cd "/Users/robin/claude code/CRM"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/aijulai-crm.git

# 推送代码到 GitHub
git push -u origin main
```

**示例**（如果你的用户名是 `robin`）：
```bash
git remote add origin https://github.com/robin/aijulai-crm.git
git push -u origin main
```

### 步骤 3：验证推送成功

1. 刷新 GitHub 仓库页面
2. 你应该能看到所有文件已经上传
3. README.md 会自动显示在仓库首页

---

## 方式二：安装 GitHub CLI（可选）

如果你希望使用命令行工具，可以安装 GitHub CLI：

### macOS 安装

```bash
# 使用 Homebrew 安装
brew install gh

# 登录 GitHub
gh auth login

# 创建仓库并推送
cd "/Users/robin/claude code/CRM"
gh repo create aijulai-crm --private --source=. --push
```

### 验证安装

```bash
gh --version
```

---

## 常见问题

### Q1: 推送时提示认证失败

**问题**：
```
remote: Support for password authentication was removed on August 13, 2021.
fatal: Authentication failed
```

**解决方案**：
GitHub 已不再支持密码认证，需要使用 Personal Access Token (PAT)。

1. 访问 [GitHub Settings - Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 填写 Token 信息：
   - **Note**: `CRM Project`
   - **Expiration**: 选择过期时间（建议选择 90 days 或 No expiration）
   - **Select scopes**: 勾选 `repo`（完整仓库权限）
4. 点击 "Generate token"
5. **⚠️ 重要**: 复制生成的 token（只显示一次）
6. 在推送时使用 token 作为密码：
   ```bash
   git push -u origin main
   # Username: 你的GitHub用户名
   # Password: 粘贴刚才复制的token
   ```

### Q2: 如何修改远程仓库地址

```bash
# 查看当前远程仓库
git remote -v

# 修改远程仓库地址
git remote set-url origin https://github.com/YOUR_USERNAME/NEW_REPO_NAME.git

# 验证修改
git remote -v
```

### Q3: 推送时出现冲突

如果你在创建 GitHub 仓库时不小心添加了 README 或其他文件：

```bash
# 先拉取远程更改
git pull origin main --allow-unrelated-histories

# 解决冲突后推送
git push -u origin main
```

### Q4: 如何使用 SSH 代替 HTTPS

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 将公钥添加到 GitHub
# 复制公钥内容
cat ~/.ssh/id_ed25519.pub

# 访问 https://github.com/settings/keys
# 点击 "New SSH key"，粘贴公钥

# 修改远程仓库为 SSH 地址
git remote set-url origin git@github.com:YOUR_USERNAME/aijulai-crm.git

# 推送
git push -u origin main
```

---

## 推送后的下一步

### 1. 设置仓库描述和标签

在 GitHub 仓库页面：
1. 点击仓库名称右侧的 "⚙️" 图标（Settings）
2. 在 "About" 部分：
   - **Description**: `艾居来 CRM - 酒店智能硬件营销客户关系管理系统`
   - **Website**: 如果有的话，填写项目网址
   - **Topics**: 添加标签
     - `crm`
     - `hotel`
     - `vue3`
     - `express`
     - `mysql`
     - `智能硬件`
     - `客户管理`

### 2. 配置 GitHub Pages（可选）

如果你想发布项目文档：
1. 进入仓库的 Settings → Pages
2. Source 选择 `main` 分支
3. 选择 `/docs` 目录（如果有）或 `/ (root)`
4. 保存后会生成一个网址，可以访问 README

### 3. 设置协作者（可选）

如果有团队成员：
1. Settings → Collaborators
2. 点击 "Add people"
3. 输入 GitHub 用户名或邮箱
4. 选择权限级别（Write 或 Admin）

### 4. 启用 Issues 和 Projects（可选）

用于项目管理：
1. Settings → General
2. Features 部分：
   - 勾选 "Issues"
   - 勾选 "Projects"
   - 勾选 "Wiki"（如果需要）

---

## 当前项目状态

### 已提交的内容

```
✅ 最新提交: docs: 整理项目文档结构并补充测试场景
✅ 文件数量: 24个文件变更
✅ 提交时间: 2025-12-27
```

### 项目结构

```
CRM/
├── README.md                    # 项目说明
├── WORK-SUMMARY.md             # 工作总结
├── claude.md                   # 工作方式说明
├── requirements.md             # 需求规格说明书
├── architecture.md             # 架构设计文档
├── docs/                       # 文档目录
│   ├── archive/               # 历史文档归档
│   ├── guides/                # 开发指南
│   └── test-scenarios/        # 测试场景
├── backend/                    # 后端代码
├── database/                   # 数据库脚本
└── ...
```

### 测试场景进度

- **已完成**: 34/79 场景（43%）
- **合同管理**: 10/10 ✅
- **收款管理**: 8/8 ✅
- **发票管理**: 5/8 🔄
- **售后服务**: 5/9 🔄

---

## 快速推送命令（复制即用）

**请将 `YOUR_USERNAME` 替换为你的实际 GitHub 用户名！**

```bash
cd "/Users/robin/claude code/CRM"
git remote add origin https://github.com/YOUR_USERNAME/aijulai-crm.git
git push -u origin main
```

**示例**（用户名为 `robin`）：
```bash
cd "/Users/robin/claude code/CRM"
git remote add origin https://github.com/robin/aijulai-crm.git
git push -u origin main
```

---

## 推送完成后

访问你的 GitHub 仓库：
```
https://github.com/YOUR_USERNAME/aijulai-crm
```

享受你的项目在 GitHub 上的展示吧！🎉

---

**文档状态**: ✅ 已完成
**更新时间**: 2025-12-27
