#!/bin/bash

# Playwright 浏览器安装脚本
# 用途：从 GitHub Release 下载预编译的 Playwright 浏览器

set -e

PLAYWRIGHT_VERSION="1.40.0"
RELEASE_TAG="playwright-browsers-v${PLAYWRIGHT_VERSION}"
REPO_OWNER="indmoo86-ai"
REPO_NAME="AijlCRM"
BROWSER_CACHE_DIR="${HOME}/.cache/ms-playwright"

echo "========================================"
echo "  Playwright 浏览器安装脚本"
echo "========================================"

# 检查是否已安装
if [ -d "${BROWSER_CACHE_DIR}/chromium-"* ]; then
    echo "✅ Playwright 浏览器已安装"
    ls -la "${BROWSER_CACHE_DIR}"
    read -p "是否重新下载? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "跳过安装"
        exit 0
    fi
fi

# 创建缓存目录
mkdir -p "${BROWSER_CACHE_DIR}"

# 下载浏览器压缩包
DOWNLOAD_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${RELEASE_TAG}/playwright-chromium-linux-v${PLAYWRIGHT_VERSION}.tar.gz"

echo "📦 下载 Playwright 浏览器..."
echo "   URL: ${DOWNLOAD_URL}"

# 尝试下载
if command -v wget &> /dev/null; then
    wget --progress=bar:force "${DOWNLOAD_URL}" -O /tmp/playwright-chromium.tar.gz
elif command -v curl &> /dev/null; then
    curl -L "${DOWNLOAD_URL}" -o /tmp/playwright-chromium.tar.gz
else
    echo "❌ 错误: 需要 wget 或 curl 命令"
    exit 1
fi

# 解压
echo "📂 解压浏览器文件..."
tar -xzf /tmp/playwright-chromium.tar.gz -C "${BROWSER_CACHE_DIR}"/

# 设置权限
echo "🔧 设置执行权限..."
chmod -R 755 "${BROWSER_CACHE_DIR}"/chromium-*/

# 清理临时文件
rm -f /tmp/playwright-chromium.tar.gz

# 验证安装
echo "✅ 验证安装..."
CHROMIUM_PATH=$(find "${BROWSER_CACHE_DIR}" -name "chrome" -o -name "chromium" | head -1)

if [ -n "${CHROMIUM_PATH}" ]; then
    echo "✅ Chromium 已安装: ${CHROMIUM_PATH}"
    ls -lh "${CHROMIUM_PATH}"
else
    echo "❌ 错误: 未找到 Chromium 可执行文件"
    exit 1
fi

# 设置环境变量
echo ""
echo "========================================"
echo "  安装完成！"
echo "========================================"
echo ""
echo "请在 .bashrc 或 .zshrc 中添加以下环境变量："
echo ""
echo "export PLAYWRIGHT_BROWSERS_PATH=${BROWSER_CACHE_DIR}"
echo "export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1"
echo ""
echo "或者在运行测试前执行："
echo "export PLAYWRIGHT_BROWSERS_PATH=${BROWSER_CACHE_DIR}"
echo ""

exit 0
