#!/bin/bash

# 修复所有模型中的数据类型不一致问题
# 将所有外键的BIGINT统一改为与主键一致的类型

echo "🔧 修复Sequelize模型数据类型..."
echo "================================"
echo ""

# 进入models目录
cd "$(dirname "$0")/src/models"

# 备份models目录
echo "📦 创建备份..."
tar -czf ../../models-backup-$(date +%Y%m%d-%H%M%S).tar.gz .
echo "✅ 备份完成"
echo ""

# 修复Product模型 - category_id应该是UNSIGNED
echo "修复 Product.js - category_id"
sed -i.bak 's/category_id: {[[:space:]]*type: DataTypes\.BIGINT,/category_id: { type: DataTypes.BIGINT.UNSIGNED,/g' Product.js

# 修复Quotation模型 - customer_id应该是BIGINT（与Customer.id一致）
echo "修复 Quotation.js - customer_id"
# Customer的主键是BIGINT，所以Quotation的customer_id也应该是BIGINT（不需要UNSIGNED）

# 删除备份文件
rm -f *.bak

echo ""
echo "✅ 修复完成！"
echo ""
echo "请运行以下命令重新初始化数据库："
echo "  cd ../../"
echo "  node scripts/init-database.js"
