#!/usr/bin/env node

/**
 * 统一所有数据类型为BIGINT（不带UNSIGNED）
 * 这样可以避免外键类型不匹配的问题
 */

const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/models');

console.log('🔧 统一所有数据类型为BIGINT...\n');

// 读取所有模型文件
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // 将所有 BIGINT.UNSIGNED 改为 BIGINT
  const originalContent = content;
  content = content.replace(/DataTypes\.BIGINT\.UNSIGNED/g, 'DataTypes.BIGINT');

  if (content !== originalContent) {
    console.log(`✓ 修复: ${file}`);
    fs.writeFileSync(filePath, content, 'utf-8');
    totalFixed++;
  }
});

console.log(`\n✅ 修复完成！共修复 ${totalFixed} 个文件`);
console.log('\n📋 下一步:');
console.log('  1. 删除并重建数据库:');
console.log('     docker exec aijulai-crm-mysql mysql -uroot -e "DROP DATABASE IF EXISTS aijulai_crm; CREATE DATABASE aijulai_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"');
console.log('  2. 运行数据库初始化:');
console.log('     node scripts/init-database.js');
console.log('  3. 生成测试数据:');
console.log('     node scripts/seed-data.js\n');
