#!/usr/bin/env node

/**
 * 修复Sequelize模型中的数据类型不一致问题
 * 统一所有主键为BIGINT.UNSIGNED，确保外键与主键类型匹配
 */

const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/models');

console.log('🔧 开始修复Sequelize模型数据类型...\n');

// 需要修复的模式列表
const fixes = [
  {
    name: 'Customer.js - 主键改为UNSIGNED',
    pattern: /id: \{\s*type: DataTypes\.BIGINT,\s*primaryKey: true,\s*autoIncrement: true/,
    replacement: 'id: {\n    type: DataTypes.BIGINT.UNSIGNED,\n    primaryKey: true,\n    autoIncrement: true'
  },
  {
    name: 'Quotation.js - customer_id改为BIGINT（不要UNSIGNED）',
    pattern: /customer_id: \{\s*type: DataTypes\.BIGINT\.UNSIGNED,/,
    replacement: 'customer_id: {\n    type: DataTypes.BIGINT,'
  },
  {
    name: 'Contract.js - customer_id改为BIGINT（不要UNSIGNED）',
    pattern: /customer_id: \{\s*type: DataTypes\.BIGINT\.UNSIGNED,/,
    replacement: 'customer_id: {\n    type: DataTypes.BIGINT,'
  }
];

// 读取所有模型文件
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');

let totalFixed = 0;

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  fixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      console.log(`✓ 修复: ${file} - ${fix.name}`);
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
      totalFixed++;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});

console.log(`\n✅ 修复完成！共修复 ${totalFixed} 处`);
console.log('\n📋 下一步:');
console.log('  1. 删除并重建数据库:');
console.log('     docker exec aijulai-crm-mysql mysql -uroot -e "DROP DATABASE IF EXISTS aijulai_crm; CREATE DATABASE aijulai_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"');
console.log('  2. 运行数据库初始化:');
console.log('     node scripts/init-database.js');
console.log('  3. 生成测试数据:');
console.log('     node scripts/seed-data.js\n');
