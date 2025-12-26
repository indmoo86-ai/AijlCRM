/**
 * 数据库初始化脚本
 * 使用 Sequelize sync() 方法自动创建数据表
 *
 * 使用方法：
 * 1. 确保 MySQL 服务已启动
 * 2. 在 .env 文件中配置正确的数据库连接信息
 * 3. 运行: node backend/scripts/init-database.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize } = require('../src/config/database');

// 导入所有模型（包含关联关系定义）
const models = require('../src/models/index');

console.log('已加载所有模型和关联关系 (' + Object.keys(models).length + ' 个模型)');

// 初始化数据库
const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...\n');

    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');

    // 2. 同步数据表（创建表结构）
    console.log('2. 同步数据表结构...');
    console.log('警告: 使用 force:true 会删除所有现有数据！');
    console.log('建议: 生产环境请使用迁移(migration)工具\n');

    // force: false - 不删除现有表
    // alter: true - 修改表结构以匹配模型（谨慎使用）
    await sequelize.sync({ force: false, alter: false });

    console.log('✓ 数据表同步完成\n');

    // 3. 显示所有已创建的表
    const [results] = await sequelize.query('SHOW TABLES');
    console.log('已创建的数据表 (' + results.length + '张):');
    results.forEach((row, index) => {
      const tableName = Object.values(row)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });

    console.log('\n✓ 数据库初始化完成！');
    console.log('\n下一步: 运行种子数据脚本创建初始数据');

  } catch (error) {
    console.error('\n✗ 数据库初始化失败:', error.message);
    console.error('\n错误详情:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// 执行初始化
initDatabase();
