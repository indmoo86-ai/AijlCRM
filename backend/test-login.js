#!/usr/bin/env node

const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    // 查找用户
    const user = await User.findOne({ where: { username: 'admin' } });

    if (!user) {
      console.log('❌ 用户不存在');
      process.exit(1);
    }

    console.log('✅ 找到用户:', user.username);
    console.log('   姓名:', user.name);
    console.log('   密码哈希:', user.password.substring(0, 20) + '...');

    // 测试密码验证
    const password = '123456';
    console.log('\n测试密码:', password);

    const isValid = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare 结果:', isValid);

    const isValidMethod = await user.validatePassword(password);
    console.log('validatePassword 结果:', isValidMethod);

    if (isValid && isValidMethod) {
      console.log('\n✅ 密码验证成功！');
    } else {
      console.log('\n❌ 密码验证失败');
    }

    process.exit(0);

  } catch (error) {
    console.error('✗ 错误:', error.message);
    process.exit(1);
  }
}

testLogin();
