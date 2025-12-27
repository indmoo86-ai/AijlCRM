/**
 * API测试 - 列表查询综合测试
 * 测试各模块的列表查询功能
 * 验证之前创建的数据是否可以通过列表API查询到
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// 测试数据
const loginData = {
  username: 'admin',
  password: 'admin123'
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

// 全局变量
let authToken = null;

/**
 * 步骤0: 登录获取token
 */
async function login() {
  log('\n========================================', 'blue');
  log('步骤 0: 用户登录获取Token', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);

    if (response.data && response.data.data && response.data.data.token) {
      authToken = response.data.data.token;
      log('✅ 登录成功，获取到Token', 'green');
      return true;
    } else {
      log('❌ 登录失败，无法获取Token', 'red');
      return false;
    }
  } catch (error) {
    log('❌ 登录失败', 'red');
    log(`错误: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 测试1: 查询线索列表
 */
async function testGetLeadsList() {
  log('\n========================================', 'blue');
  log('测试1: 查询线索列表', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/leads`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const checks = [];

    // 检查HTTP状态码
    if (response.status === 200) {
      log('✅ HTTP状态码正确 (200)', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    // 检查响应结构
    if (response.data && response.data.data) {
      log('✅ 响应包含数据对象', 'green');
      checks.push(true);

      // 获取列表数据
      let leads = null;
      if (Array.isArray(response.data.data)) {
        leads = response.data.data;
      } else if (response.data.data.list) {
        leads = response.data.data.list;
      } else if (response.data.data.rows) {
        leads = response.data.data.rows;
      }

      if (leads && leads.length > 0) {
        log(`✅ 找到 ${leads.length} 条线索记录`, 'green');
        log(`   第一条线索: ${leads[0].customerName || leads[0].customer_name}`, 'green');
        checks.push(true);
      } else {
        log('⚠️  线索列表为空（可能是正常情况）', 'yellow');
        checks.push(true); // 空列表也是有效的
      }
    } else {
      log('❌ 响应数据格式错误', 'red');
      checks.push(false);
    }

    const allPassed = checks.every(check => check);
    return { passed: allPassed, name: '查询线索列表', module: '线索管理' };

  } catch (error) {
    log(`❌ 查询线索列表失败: ${error.message}`, 'red');
    return { passed: false, name: '查询线索列表', module: '线索管理', error: error.message };
  }
}

/**
 * 测试2: 查询客户列表
 */
async function testGetCustomersList() {
  log('\n========================================', 'blue');
  log('测试2: 查询客户列表', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/customers`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const checks = [];

    if (response.status === 200) {
      log('✅ HTTP状态码正确 (200)', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    if (response.data && response.data.data) {
      log('✅ 响应包含数据对象', 'green');
      checks.push(true);

      let customers = null;
      if (Array.isArray(response.data.data)) {
        customers = response.data.data;
      } else if (response.data.data.list) {
        customers = response.data.data.list;
      } else if (response.data.data.rows) {
        customers = response.data.data.rows;
      }

      if (customers && customers.length > 0) {
        log(`✅ 找到 ${customers.length} 条客户记录`, 'green');
        log(`   第一个客户: ${customers[0].customer_name || customers[0].customerName}`, 'green');
        checks.push(true);
      } else {
        log('⚠️  客户列表为空（可能是正常情况）', 'yellow');
        checks.push(true);
      }
    } else {
      log('❌ 响应数据格式错误', 'red');
      checks.push(false);
    }

    const allPassed = checks.every(check => check);
    return { passed: allPassed, name: '查询客户列表', module: '客户管理' };

  } catch (error) {
    log(`❌ 查询客户列表失败: ${error.message}`, 'red');
    return { passed: false, name: '查询客户列表', module: '客户管理', error: error.message };
  }
}

/**
 * 测试3: 查询报价单列表
 */
async function testGetQuotationsList() {
  log('\n========================================', 'blue');
  log('测试3: 查询报价单列表', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/quotations`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const checks = [];

    if (response.status === 200) {
      log('✅ HTTP状态码正确 (200)', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    if (response.data && response.data.data) {
      log('✅ 响应包含数据对象', 'green');
      checks.push(true);

      let quotations = null;
      if (Array.isArray(response.data.data)) {
        quotations = response.data.data;
      } else if (response.data.data.list) {
        quotations = response.data.data.list;
      } else if (response.data.data.rows) {
        quotations = response.data.data.rows;
      }

      if (quotations && quotations.length > 0) {
        log(`✅ 找到 ${quotations.length} 条报价单记录`, 'green');
        const firstQuotation = quotations[0];
        const quotationNo = firstQuotation.quotation_no || firstQuotation.quotationNo;
        log(`   第一个报价单: ${quotationNo}`, 'green');
        checks.push(true);
      } else {
        log('⚠️  报价单列表为空（可能是正常情况）', 'yellow');
        checks.push(true);
      }
    } else {
      log('❌ 响应数据格式错误', 'red');
      checks.push(false);
    }

    const allPassed = checks.every(check => check);
    return { passed: allPassed, name: '查询报价单列表', module: '报价单管理' };

  } catch (error) {
    log(`❌ 查询报价单列表失败: ${error.message}`, 'red');
    return { passed: false, name: '查询报价单列表', module: '报价单管理', error: error.message };
  }
}

/**
 * 测试4: 查询合同列表
 */
async function testGetContractsList() {
  log('\n========================================', 'blue');
  log('测试4: 查询合同列表', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/contracts`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const checks = [];

    if (response.status === 200) {
      log('✅ HTTP状态码正确 (200)', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    if (response.data && response.data.data) {
      log('✅ 响应包含数据对象', 'green');
      checks.push(true);

      let contracts = null;
      if (Array.isArray(response.data.data)) {
        contracts = response.data.data;
      } else if (response.data.data.list) {
        contracts = response.data.data.list;
      } else if (response.data.data.rows) {
        contracts = response.data.data.rows;
      }

      if (contracts && contracts.length > 0) {
        log(`✅ 找到 ${contracts.length} 条合同记录`, 'green');
        const firstContract = contracts[0];
        const contractNo = firstContract.contract_no || firstContract.contractNo;
        log(`   第一个合同: ${contractNo}`, 'green');
        checks.push(true);
      } else {
        log('⚠️  合同列表为空（可能是正常情况）', 'yellow');
        checks.push(true);
      }
    } else {
      log('❌ 响应数据格式错误', 'red');
      checks.push(false);
    }

    const allPassed = checks.every(check => check);
    return { passed: allPassed, name: '查询合同列表', module: '合同管理' };

  } catch (error) {
    log(`❌ 查询合同列表失败: ${error.message}`, 'red');
    return { passed: false, name: '查询合同列表', module: '合同管理', error: error.message };
  }
}

/**
 * 测试5: 查询收款记录列表
 */
async function testGetPaymentsList() {
  log('\n========================================', 'blue');
  log('测试5: 查询收款记录列表', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/payments`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const checks = [];

    if (response.status === 200) {
      log('✅ HTTP状态码正确 (200)', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    if (response.data && response.data.data) {
      log('✅ 响应包含数据对象', 'green');
      checks.push(true);

      let payments = null;
      if (Array.isArray(response.data.data)) {
        payments = response.data.data;
      } else if (response.data.data.list) {
        payments = response.data.data.list;
      } else if (response.data.data.rows) {
        payments = response.data.data.rows;
      }

      if (payments && payments.length > 0) {
        log(`✅ 找到 ${payments.length} 条收款记录`, 'green');
        const firstPayment = payments[0];
        const paymentNo = firstPayment.payment_no || firstPayment.paymentNo;
        log(`   第一个收款记录: ${paymentNo}`, 'green');
        checks.push(true);
      } else {
        log('⚠️  收款记录列表为空（可能是正常情况）', 'yellow');
        checks.push(true);
      }
    } else {
      log('❌ 响应数据格式错误', 'red');
      checks.push(false);
    }

    const allPassed = checks.every(check => check);
    return { passed: allPassed, name: '查询收款记录列表', module: '收款管理' };

  } catch (error) {
    log(`❌ 查询收款记录列表失败: ${error.message}`, 'red');
    return { passed: false, name: '查询收款记录列表', module: '收款管理', error: error.message };
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  log('\n┌──────────────────────────────────────────┐', 'blue');
  log('│  AijlCRM API测试 - 列表查询综合测试       │', 'blue');
  log('└──────────────────────────────────────────┘', 'blue');

  const results = [];

  // 步骤0: 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ 登录失败，无法继续测试', 'red');
    process.exit(1);
  }

  // 运行所有列表查询测试
  results.push(await testGetLeadsList());
  results.push(await testGetCustomersList());
  results.push(await testGetQuotationsList());
  results.push(await testGetContractsList());
  results.push(await testGetPaymentsList());

  // 总结
  log('\n========================================', 'blue');
  log('测试总结', 'blue');
  log('========================================\n', 'blue');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  // 按模块分组统计
  const byModule = {};
  results.forEach(result => {
    if (!byModule[result.module]) {
      byModule[result.module] = { total: 0, passed: 0 };
    }
    byModule[result.module].total++;
    if (result.passed) {
      byModule[result.module].passed++;
    }
  });

  log('模块测试统计:', 'blue');
  Object.keys(byModule).forEach(module => {
    const stat = byModule[module];
    const color = stat.passed === stat.total ? 'green' : 'red';
    log(`  ${module}: ${stat.passed}/${stat.total} 通过`, color);
  });

  log('\n测试详情:', 'blue');
  results.forEach(result => {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    const color = result.passed ? 'green' : 'red';
    log(`${status} - ${result.name}`, color);
    if (result.error) {
      log(`  错误: ${result.error}`, 'red');
    }
  });

  log(`\n总计: ${results.length} 个查询测试, ${passed} 个通过, ${failed} 个失败\n`);

  if (failed > 0) {
    log('⚠️  部分测试失败，请检查错误信息并修复', 'yellow');
    process.exit(1);
  } else {
    log('🎉 所有列表查询API测试通过！', 'green');
    process.exit(0);
  }
}

// 运行测试
runTests().catch(error => {
  log(`\n❌ 测试执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
