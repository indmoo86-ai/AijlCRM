/**
 * API级别测试 - 用户登录
 * 测试场景 1.1 和 1.2
 * 由于网络限制无法安装Playwright浏览器，采用API测试 + 手动UI验证方式
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// 测试数据
const testData = {
  validUser: {
    username: 'admin',
    password: 'admin123'
  },
  invalidUser: {
    username: 'wronguser',
    password: 'wrongpass'
  }
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * 测试场景 1.1: 用户成功登录
 */
async function testSuccessfulLogin() {
  log('\n========================================', 'blue');
  log('测试场景 1.1: 用户成功登录', 'blue');
  log('========================================\n', 'blue');

  try {
    log('步骤 1: 发送登录请求', 'yellow');
    log(`请求数据: ${JSON.stringify(testData.validUser, null, 2)}`);

    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, testData.validUser);

    log('\n步骤 2: 验证响应', 'yellow');
    log(`响应状态: ${response.status}`);
    log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);

    // 验证点
    const checks = [];

    // 检查1: HTTP状态码应为200
    if (response.status === 200) {
      log('✅ HTTP状态码为200', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: 预期200, 实际${response.status}`, 'red');
      checks.push(false);
    }

    // 检查2: 响应中应包含token
    if (response.data && response.data.data && response.data.data.token) {
      log('✅ 响应包含token', 'green');
      log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
      checks.push(true);
    } else {
      log('❌ 响应不包含token', 'red');
      checks.push(false);
    }

    // 检查3: 响应中应包含用户信息
    if (response.data && response.data.data && response.data.data.user) {
      log('✅ 响应包含用户信息', 'green');
      log(`   用户名: ${response.data.data.user.username}`);
      log(`   用户ID: ${response.data.data.user.id}`);
      checks.push(true);
    } else {
      log('❌ 响应不包含用户信息', 'red');
      checks.push(false);
    }

    // 总结
    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 场景 1.1 测试通过', 'green');
      return { passed: true, scenario: '1.1', name: '用户成功登录' };
    } else {
      log('\n❌ 场景 1.1 测试失败', 'red');
      return { passed: false, scenario: '1.1', name: '用户成功登录', error: '部分验证点失败' };
    }

  } catch (error) {
    log(`\n❌ 场景 1.1 测试失败`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    if (error.response) {
      log(`响应状态: ${error.response.status}`, 'red');
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { passed: false, scenario: '1.1', name: '用户成功登录', error: error.message };
  }
}

/**
 * 测试场景 1.2: 错误密码登录
 */
async function testFailedLogin() {
  log('\n========================================', 'blue');
  log('测试场景 1.2: 错误密码登录', 'blue');
  log('========================================\n', 'blue');

  try {
    log('步骤 1: 发送错误凭证登录请求', 'yellow');
    log(`请求数据: ${JSON.stringify(testData.invalidUser, null, 2)}`);

    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, testData.invalidUser);

    // 如果请求成功（不应该发生）
    log('\n❌ 场景 1.2 测试失败', 'red');
    log('错误: 使用错误凭证登录成功了（不应该发生）', 'red');
    return { passed: false, scenario: '1.2', name: '错误密码登录', error: '错误凭证被接受' };

  } catch (error) {
    log('\n步骤 2: 验证错误响应', 'yellow');

    const checks = [];

    // 检查1: HTTP状态码应为401或400
    if (error.response && (error.response.status === 401 || error.response.status === 400)) {
      log(`✅ HTTP状态码为${error.response.status} (正确拒绝)`, 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: 预期401或400, 实际${error.response?.status || '无响应'}`, 'red');
      checks.push(false);
    }

    // 检查2: 响应中应包含错误消息
    if (error.response && error.response.data && error.response.data.message) {
      log('✅ 响应包含错误消息', 'green');
      log(`   错误消息: ${error.response.data.message}`);
      checks.push(true);
    } else {
      log('❌ 响应不包含错误消息', 'red');
      checks.push(false);
    }

    // 检查3: 响应中不应包含token
    if (!error.response || !error.response.data || !error.response.data.token) {
      log('✅ 响应不包含token (正确)', 'green');
      checks.push(true);
    } else {
      log('❌ 响应包含token (不应该)', 'red');
      checks.push(false);
    }

    // 总结
    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 场景 1.2 测试通过', 'green');
      return { passed: true, scenario: '1.2', name: '错误密码登录' };
    } else {
      log('\n❌ 场景 1.2 测试失败', 'red');
      return { passed: false, scenario: '1.2', name: '错误密码登录', error: '部分验证点失败' };
    }
  }
}

/**
 * UI手动测试指导
 */
function printManualTestGuide() {
  log('\n========================================', 'blue');
  log('手动UI测试指导', 'blue');
  log('========================================\n', 'blue');

  log('由于无法自动化浏览器测试，请按以下步骤手动验证UI:', 'yellow');
  log('\n场景 1.1: 用户成功登录');
  log('1. 打开浏览器访问: http://localhost:5173/login');
  log('2. 在用户名输入框中输入: admin');
  log('3. 在密码输入框中输入: admin123');
  log('4. 点击"登录"按钮');
  log('5. 预期结果: 跳转到工作台页面 (/dashboard)');
  log('6. 验证: 页面URL包含"/dashboard"');
  log('7. 验证: 页面显示用户信息和导航菜单\n');

  log('场景 1.2: 错误密码登录');
  log('1. 打开浏览器访问: http://localhost:5173/login');
  log('2. 在用户名输入框中输入: wronguser');
  log('3. 在密码输入框中输入: wrongpass');
  log('4. 点击"登录"按钮');
  log('5. 预期结果: 显示错误提示消息');
  log('6. 验证: 页面仍在登录页面 (/login)');
  log('7. 验证: 显示"用户名或密码错误"等错误提示\n');

  log('请在完成手动测试后，将结果记录到 TEST-ISSUES-TRACKING.md 文件中', 'yellow');
}

/**
 * 主测试函数
 */
async function runTests() {
  log('\n┌─────────────────────────────────────────┐', 'blue');
  log('│  AijlCRM API测试 - 用户认证模块          │', 'blue');
  log('└─────────────────────────────────────────┘', 'blue');

  const results = [];

  // 运行测试
  results.push(await testSuccessfulLogin());
  results.push(await testFailedLogin());

  // 显示手动测试指导
  printManualTestGuide();

  // 总结
  log('\n========================================', 'blue');
  log('测试总结', 'blue');
  log('========================================\n', 'blue');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    const color = result.passed ? 'green' : 'red';
    log(`场景 ${result.scenario} - ${result.name}: ${status}`, color);
    if (result.error) {
      log(`  错误: ${result.error}`, 'red');
    }
  });

  log(`\n总计: ${results.length} 个场景, ${passed} 个通过, ${failed} 个失败\n`);

  if (failed > 0) {
    log('⚠️  部分测试失败，请检查错误信息并修复', 'yellow');
    process.exit(1);
  } else {
    log('🎉 所有API测试通过！请继续进行手动UI验证', 'green');
    process.exit(0);
  }
}

// 运行测试
runTests().catch(error => {
  log(`\n❌ 测试执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
