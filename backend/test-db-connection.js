/**
 * 数据库连接测试脚本
 * 运行: node backend/test-db-connection.js
 */

require('dotenv').config();
const { sequelize, testConnection } = require('./src/config/database');

const runTest = async () => {
  console.log('\n=================================');
  console.log('  数据库连接测试');
  console.log('=================================\n');

  console.log('配置信息:');
  console.log(`  数据库: ${process.env.DB_NAME}`);
  console.log(`  主机: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
  console.log(`  用户: ${process.env.DB_USER}`);
  console.log(`  密码: ${process.env.DB_PASSWORD ? '***' : '(空)'}\n`);

  await testConnection();

  await sequelize.close();
  console.log('\n连接已关闭\n');
};

runTest();
