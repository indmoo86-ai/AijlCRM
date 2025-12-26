#!/usr/bin/env node

/**
 * 创建测试用户 - 用于E2E测试
 */

const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('🔧 创建测试用户...\n');

    // 创建管理员用户
    // 注意：不需要手动hash密码，User模型的beforeCreate钩子会自动处理

    const admin = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        password: '123456',  // 明文密码，模型会自动加密
        name: '系统管理员',
        role: 6, // 管理员
        status: 1,
        department: '管理部',
        phone: '13800138000',
        email: 'admin@aijulai.com'
      }
    });

    if (admin[1]) {
      console.log('✅ 管理员账号创建成功');
    } else {
      console.log('✅ 管理员账号已存在');
    }

    console.log('\n📝 测试账号信息:');
    console.log('   用户名: admin');
    console.log('   密码: 123456');
    console.log('   角色: 管理员\n');

    console.log('✅ 完成！可以使用此账号登录系统\n');
    process.exit(0);

  } catch (error) {
    console.error('✗ 创建用户失败:', error.message);
    process.exit(1);
  }
}

createTestUser();
