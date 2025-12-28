#!/bin/bash

# GitHub Release 上传脚本
# 用于上传 Playwright 浏览器文件到 GitHub Release

set -e

# 配置
REPO_OWNER="indmoo86-ai"
REPO_NAME="AijlCRM"
TAG_NAME="playwright-browsers-v1.0"
RELEASE_NAME="Playwright Browsers for Mac (v1.0)"
FILE_PATH="$HOME/Downloads/playwright-browsers-mac-20251228.tar.gz"

echo "📦 准备上传 Playwright 浏览器文件到 GitHub Release..."
echo ""
echo "仓库: $REPO_OWNER/$REPO_NAME"
echo "标签: $TAG_NAME"
echo "文件: $FILE_PATH"
echo ""

# 检查文件是否存在
if [ ! -f "$FILE_PATH" ]; then
    echo "❌ 错误: 文件不存在: $FILE_PATH"
    exit 1
fi

FILE_SIZE=$(ls -lh "$FILE_PATH" | awk '{print $5}')
echo "✓ 文件大小: $FILE_SIZE"
echo ""

# 提示用户提供 GitHub Token
echo "⚠️  需要 GitHub Personal Access Token 来创建 Release"
echo ""
echo "如何获取 Token:"
echo "1. 访问: https://github.com/settings/tokens/new"
echo "2. 勾选权限: repo (全部)"
echo "3. 生成 Token 并复制"
echo ""
echo "请输入您的 GitHub Token (输入时不会显示):"
read -s GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 错误: Token 不能为空"
    exit 1
fi

echo "✓ Token 已接收"
echo ""

# 创建 Release
echo "📝 创建 Release..."
RELEASE_BODY="Playwright 浏览器文件包 (Mac 版本)

包含:
- chromium-1200
- chromium_headless_shell-1200
- ffmpeg-1011

文件大小: $FILE_SIZE
创建日期: $(date +%Y-%m-%d)
"

RELEASE_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases" \
  -d "{
    \"tag_name\": \"$TAG_NAME\",
    \"name\": \"$RELEASE_NAME\",
    \"body\": $(echo "$RELEASE_BODY" | jq -Rs .),
    \"draft\": false,
    \"prerelease\": false
  }")

# 检查是否创建成功
UPLOAD_URL=$(echo "$RELEASE_RESPONSE" | grep -o '"upload_url": "[^"]*' | cut -d '"' -f 4 | sed 's/{?name,label}//')

if [ -z "$UPLOAD_URL" ]; then
    echo "❌ 创建 Release 失败"
    echo "$RELEASE_RESPONSE" | jq .
    exit 1
fi

echo "✓ Release 创建成功"
echo ""

# 上传文件
echo "📤 上传文件 (这可能需要几分钟)..."
FILE_NAME=$(basename "$FILE_PATH")

UPLOAD_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/gzip" \
  --data-binary @"$FILE_PATH" \
  "$UPLOAD_URL?name=$FILE_NAME")

# 检查上传结果
DOWNLOAD_URL=$(echo "$UPLOAD_RESPONSE" | grep -o '"browser_download_url": "[^"]*' | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
    echo "❌ 上传失败"
    echo "$UPLOAD_RESPONSE" | jq .
    exit 1
fi

echo "✓ 上传成功！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 完成！"
echo ""
echo "📥 下载链接:"
echo "$DOWNLOAD_URL"
echo ""
echo "🔗 Release 页面:"
echo "https://github.com/$REPO_OWNER/$REPO_NAME/releases/tag/$TAG_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "请将此下载链接提供给 Claude Code 继续安装。"
