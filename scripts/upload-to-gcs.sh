#!/bin/bash

# Google Cloud Storage 上传脚本
# 用于上传 Playwright 浏览器文件到 GCS

set -e

# 配置
BUCKET_NAME="${GCS_BUCKET_NAME:-your-bucket-name}"  # 从环境变量读取或使用默认值
FILE_PATH="$HOME/Downloads/playwright-browsers-mac-20251228.tar.gz"
OBJECT_NAME="playwright-browsers/playwright-browsers-mac-20251228.tar.gz"

echo "📦 准备上传 Playwright 浏览器文件到 Google Cloud Storage..."
echo ""
echo "Bucket: gs://$BUCKET_NAME"
echo "对象路径: $OBJECT_NAME"
echo "本地文件: $FILE_PATH"
echo ""

# 检查文件是否存在
if [ ! -f "$FILE_PATH" ]; then
    echo "❌ 错误: 文件不存在: $FILE_PATH"
    exit 1
fi

FILE_SIZE=$(ls -lh "$FILE_PATH" | awk '{print $5}')
echo "✓ 文件大小: $FILE_SIZE"
echo ""

# 方法 1: 使用 gcloud CLI（推荐）
if command -v gcloud &> /dev/null; then
    echo "🔧 使用 gcloud CLI 上传..."

    # 检查是否已认证
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        echo "⚠️  需要先登录 Google Cloud"
        echo "运行: gcloud auth login"
        exit 1
    fi

    # 上传文件
    echo "📤 上传中（这可能需要几分钟）..."
    gcloud storage cp "$FILE_PATH" "gs://$BUCKET_NAME/$OBJECT_NAME" \
        --content-type="application/gzip"

    # 设置为公开可读（可选）
    echo "🔓 设置为公开访问..."
    gcloud storage objects update "gs://$BUCKET_NAME/$OBJECT_NAME" \
        --add-acl-grant=entity=allUsers,role=READER

    PUBLIC_URL="https://storage.googleapis.com/$BUCKET_NAME/$OBJECT_NAME"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ 上传成功！"
    echo ""
    echo "📥 公开下载链接:"
    echo "$PUBLIC_URL"
    echo ""
    echo "🔗 GCS 控制台:"
    echo "https://console.cloud.google.com/storage/browser/$BUCKET_NAME/playwright-browsers"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

else
    # 方法 2: 使用 gsutil（备选）
    if command -v gsutil &> /dev/null; then
        echo "🔧 使用 gsutil 上传..."

        echo "📤 上传中（这可能需要几分钟）..."
        gsutil cp "$FILE_PATH" "gs://$BUCKET_NAME/$OBJECT_NAME"

        # 设置为公开可读
        echo "🔓 设置为公开访问..."
        gsutil acl ch -u AllUsers:R "gs://$BUCKET_NAME/$OBJECT_NAME"

        PUBLIC_URL="https://storage.googleapis.com/$BUCKET_NAME/$OBJECT_NAME"

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ 上传成功！"
        echo ""
        echo "📥 公开下载链接:"
        echo "$PUBLIC_URL"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    else
        # 方法 3: 提示安装工具
        echo "❌ 错误: 未找到 gcloud 或 gsutil 命令"
        echo ""
        echo "请先安装 Google Cloud SDK:"
        echo ""
        echo "Mac/Linux:"
        echo "  curl https://sdk.cloud.google.com | bash"
        echo "  exec -l \$SHELL"
        echo "  gcloud init"
        echo ""
        echo "或访问: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
fi

echo ""
echo "💡 提示: 将此链接提供给 Claude Code 用于浏览器安装"
