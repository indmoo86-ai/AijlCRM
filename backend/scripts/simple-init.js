/**
 * 简化的数据库初始化脚本 - 只创建基本测试数据
 */
const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    console.log('\n开始初始化数据库...\n');

    // 1. 测试连接
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');

    // 2. 同步所有模型
    console.log('\n同步数据库表结构...');
    await sequelize.sync({ force: true });
    console.log('✓ 数据库表结构创建完成');

    // 3. 使用原生SQL创建基本数据
    console.log('\n创建初始数据...');

    // 创建管理员用户
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await sequelize.query(`
      INSERT INTO user (username, real_name, password, mobile, email, status, created_at, updated_at)
      VALUES ('admin', '系统管理员', ?, '13800138000', 'admin@aijulai.com', 'active', datetime('now'), datetime('now'))
    `, { replacements: [hashedPassword] });
    console.log('✓ 创建了管理员账号: admin');

    // 创建产品分类
    await sequelize.query(`
      INSERT INTO product_category (category_name, category_code, description, status, created_at, updated_at)
      VALUES 
      ('智能门锁', 'door_lock', '酒店客房智能门锁系统', 'active', datetime('now'), datetime('now')),
      ('智能控制系统', 'control_system', '客房智能控制面板和系统', 'active', datetime('now'), datetime('now')),
      ('能源管理系统', 'energy_system', '酒店能源管理和节能系统', 'active', datetime('now'), datetime('now'))
    `);
    console.log('✓ 创建了 3 个产品分类');

    // 创建测试产品
    await sequelize.query(`
      INSERT INTO product (product_code, product_name, brand, category_id, cost_price, sale_price, unit, description, status, created_by, created_at, updated_at)
      VALUES 
      ('DL-001', '智能门锁 A1', '艾居来', 1, 350.00, 580.00, '套', '酒店客房智能门锁', 'active', 1, datetime('now'), datetime('now')),
      ('CS-001', '客房控制面板', '艾居来', 2, 280.00, 460.00, '套', '7寸触摸屏客房控制面板', 'active', 1, datetime('now'), datetime('now'))
    `);
    console.log('✓ 创建了 2 个测试产品');

    console.log('\n✅ 数据库初始化完成！\n');
    console.log('📝 测试账号信息：');
    console.log('   用户名: admin');
    console.log('   密码: Admin@123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

initDatabase();
