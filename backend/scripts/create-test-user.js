const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // 先同步数据库表
    await sequelize.sync();
    
    // 创建测试用户
    await sequelize.query(`
      INSERT OR IGNORE INTO users (username, real_name, password, mobile, email, status, created_at, updated_at)
      VALUES ('admin', '系统管理员', ?, '13800138000', 'admin@test.com', 'active', datetime('now'), datetime('now'))
    `, { replacements: [hashedPassword] });
    
    console.log('✓ 测试用户创建成功');
    console.log('  用户名: admin');
    console.log('  密码: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('创建用户失败:', error.message);
    process.exit(1);
  }
}

createTestUser();
