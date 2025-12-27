/**
 * SQLite数据库初始化脚本
 * 使用 Sequelize sync() 方法自动创建所有数据表
 *
 * 使用方法：
 * node backend/scripts/init-sqlite.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize } = require('../src/config/database');

// 导入所有模型（包含关联关系定义）
const models = require('../src/models/index');

console.log('='.repeat(60));
console.log('SQLite数据库初始化');
console.log('='.repeat(60));
console.log(`\n已加载 ${Object.keys(models).length} 个模型\n`);

// 初始化数据库
const initDatabase = async () => {
  try {
    // 1. 测试数据库连接
    console.log('步骤1: 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');

    // 2. 同步数据表（创建表结构）
    console.log('步骤2: 同步数据表结构...');
    console.log('同步选项: { force: false, alter: true }');
    console.log('- force: false - 保留现有表数据');
    console.log('- alter: true - 自动调整表结构以匹配模型\n');

    await sequelize.sync({ force: false, alter: true });

    console.log('✓ 数据表同步完成\n');

    // 3. 显示所有已创建的表（SQLite语法）
    const [results] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
    );

    console.log(`已创建的数据表 (${results.length}张):`);
    results.forEach((row, index) => {
      console.log(`  ${String(index + 1).padStart(2)}. ${row.name}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✓ 数据库初始化完成！');
    console.log('='.repeat(60));

    // 4. 检查预期表数量
    const expectedTables = 27;
    if (results.length < expectedTables) {
      console.log(`\n⚠️  警告: 预期${expectedTables}张表，实际创建${results.length}张表`);
      console.log('可能缺少的表，请检查模型定义');
    } else {
      console.log(`\n✓ 所有${results.length}张表已成功创建`);
    }

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('✗ 数据库初始化失败');
    console.error('='.repeat(60));
    console.error('\n错误信息:', error.message);
    console.error('\n完整错误:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n数据库连接已关闭');
  }
};

// 执行初始化
initDatabase();
