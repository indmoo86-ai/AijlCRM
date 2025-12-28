/**
 * API测试 - 收款管理
 * 测试场景 7.1 - 创建收款记录
 * 使用API测试 + 手动UI截图验证
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
let contractId = null;
let customerId = null;
let createdPaymentId = null;

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
      log(`   Token: ${authToken.substring(0, 20)}...`);
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
 * 步骤1: 获取已存在的合同
 */
async function getContract() {
  log('\n========================================', 'blue');
  log('步骤 1: 获取已存在的合同', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/contracts`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    log('响应数据结构:');
    log(JSON.stringify(response.data, null, 2));

    // 处理不同的响应格式
    let contracts = null;
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        contracts = response.data.data;
      } else if (response.data.data.list) {
        contracts = response.data.data.list;
      } else if (response.data.data.rows) {
        contracts = response.data.data.rows;
      }
    }

    if (contracts && contracts.length > 0) {
      const contract = contracts[0];
      contractId = contract.contract_id || contract.contractId;
      customerId = contract.customer_id || contract.customerId;

      log('✅ 找到合同', 'green');
      log(`   合同ID: ${contractId}`);
      log(`   合同编号: ${contract.contract_no || contract.contractNo}`);
      log(`   客户ID: ${customerId}`);
      log(`   合同金额: ${contract.contract_amount || contract.contractAmount}`);
      return true;
    } else {
      log('❌ 未找到合同', 'red');
      return false;
    }
  } catch (error) {
    log('❌ 获取合同失败', 'red');
    log(`错误: ${error.message}`, 'red');
    if (error.response) {
      log(`响应状态: ${error.response.status}`, 'red');
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

/**
 * 测试场景 7.1: 创建收款记录
 */
async function testCreatePayment() {
  log('\n========================================', 'blue');
  log('测试场景 7.1: 创建收款记录', 'blue');
  log('========================================\n', 'blue');

  const paymentData = {
    contractId: contractId,
    paymentStage: '签约款',
    paymentAmount: 10759.80,
    paymentDate: '2025-12-26',
    paymentMethod: '银行转账',
    bankAccount: '艾居来科技 6228********5678',
    transactionNo: 'TXN202512260001',
    payerName: '测试酒店有限公司',
    expectedAmount: 10759.80,
    paymentNote: '首笔签约款，银行转账已到账'
  };

  try {
    log('步骤 1: 发送创建收款记录请求', 'yellow');
    log(`请求数据: ${JSON.stringify(paymentData, null, 2)}`);

    const response = await axios.post(
      `${API_BASE_URL}/api/payments`,
      paymentData,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    log('\n步骤 2: 验证API响应', 'yellow');
    log(`响应状态: ${response.status}`);
    log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);

    const checks = [];

    // 检查1: HTTP状态码应为200或201
    if (response.status === 200 || response.status === 201) {
      log('✅ HTTP状态码正确', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: 预期200/201, 实际${response.status}`, 'red');
      checks.push(false);
    }

    // 检查2: 响应中应包含收款ID
    if (response.data && response.data.data) {
      createdPaymentId = response.data.data.paymentId || response.data.data.payment_id;
      if (createdPaymentId) {
        log('✅ 响应包含收款ID', 'green');
        log(`   收款ID: ${createdPaymentId}`);
        checks.push(true);
      } else {
        log('❌ 响应不包含收款ID', 'red');
        checks.push(false);
      }
    } else {
      log('❌ 响应数据格式错误', 'red');
      checks.push(false);
    }

    // 检查3: 验证收款编号
    if (response.data && response.data.data) {
      const paymentNo = response.data.data.paymentNo || response.data.data.payment_no;
      if (paymentNo && paymentNo.startsWith('PAY')) {
        log('✅ 收款编号格式正确', 'green');
        log(`   收款编号: ${paymentNo}`);
        checks.push(true);
      } else {
        log('❌ 收款编号格式错误', 'red');
        checks.push(false);
      }
    } else {
      checks.push(false);
    }

    // 检查4: 验证关联的合同ID和客户ID
    if (response.data && response.data.data) {
      const returnedContractId = response.data.data.contractId || response.data.data.contract_id;
      const returnedCustomerId = response.data.data.customerId || response.data.data.customer_id;

      if (returnedContractId == contractId && returnedCustomerId == customerId) {
        log('✅ 合同ID和客户ID正确', 'green');
        log(`   合同ID: ${returnedContractId}`);
        log(`   客户ID: ${returnedCustomerId}`);
        checks.push(true);
      } else {
        log('❌ 合同ID或客户ID不匹配', 'red');
        checks.push(false);
      }
    } else {
      checks.push(false);
    }

    // 检查5: 验证收款数据
    if (response.data && response.data.data) {
      const payment = response.data.data;
      const stage = payment.paymentStage || payment.payment_stage;
      const amount = payment.paymentAmount || payment.payment_amount;

      if (stage === paymentData.paymentStage &&
          parseFloat(amount) === paymentData.paymentAmount) {
        log('✅ 收款数据正确', 'green');
        log(`   收款阶段: ${stage}`);
        log(`   收款金额: ${amount}`);
        checks.push(true);
      } else {
        log('❌ 收款数据不匹配', 'red');
        log(`   实际阶段: ${stage}, 期望: ${paymentData.paymentStage}`, 'red');
        log(`   实际金额: ${amount}, 期望: ${paymentData.paymentAmount}`, 'red');
        checks.push(false);
      }
    } else {
      checks.push(false);
    }

    // 检查6: 验证收款状态
    if (response.data && response.data.data) {
      const status = response.data.data.status;
      if (status === 'draft') {
        log('✅ 收款状态正确（草稿）', 'green');
        log(`   状态: ${status}`);
        checks.push(true);
      } else {
        log('❌ 收款状态错误', 'red');
        checks.push(false);
      }
    } else {
      checks.push(false);
    }

    // 总结
    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 场景 7.1 API测试通过', 'green');
      return {
        passed: true,
        scenario: '7.1',
        name: '创建收款记录',
        paymentId: createdPaymentId,
        paymentNo: response.data.data.paymentNo || response.data.data.payment_no
      };
    } else {
      log('\n❌ 场景 7.1 API测试失败', 'red');
      return { passed: false, scenario: '7.1', name: '创建收款记录', error: '部分验证点失败' };
    }

  } catch (error) {
    log(`\n❌ 场景 7.1 API测试失败`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    if (error.response) {
      log(`响应状态: ${error.response.status}`, 'red');
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { passed: false, scenario: '7.1', name: '创建收款记录', error: error.message };
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

  log('\n场景 7.1: 创建收款记录');
  log('1. 打开浏览器访问: http://localhost:5173/payments');
  log('2. 点击"新建收款"按钮');
  log('3. 填写表单:');
  log('   - 选择关联合同: 选择已存在的合同');
  log('   - 收款阶段: 签约款');
  log('   - 应收金额: 10759.80（自动填充）');
  log('   - 实际收款金额: 10759.80');
  log('   - 收款日期: 2025-12-26');
  log('   - 付款方式: 银行转账');
  log('   - 付款账户: 中国银行 6217********1234');
  log('   - 收款账户: 艾居来科技 6228********5678');
  log('   - 交易流水号: TXN202512260001');
  log('   - 勾选"需要开票"');
  log('   - 备注: 首笔签约款，银行转账已到账');
  log('4. 点击"保存"按钮');
  log('5. 预期结果: 显示成功提示，收款列表中出现新创建的收款记录');
  log('6. 截图保存: test-results/screenshots/04-create-payment.png\n');

  log('请在完成手动测试后，将结果记录到 TEST-ISSUES-TRACKING.md 文件中', 'yellow');
}

/**
 * 主测试函数
 */
async function runTests() {
  log('\n┌─────────────────────────────────────────┐', 'blue');
  log('│  AijlCRM API测试 - 收款管理             │', 'blue');
  log('└─────────────────────────────────────────┘', 'blue');

  const results = [];

  // 步骤0: 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ 登录失败，无法继续测试', 'red');
    process.exit(1);
  }

  // 步骤1: 获取合同
  const contractSuccess = await getContract();
  if (!contractSuccess) {
    log('\n❌ 获取合同失败，无法继续测试', 'red');
    process.exit(1);
  }

  // 运行测试
  results.push(await testCreatePayment());

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
    if (result.paymentId) {
      log(`  收款ID: ${result.paymentId}`, 'green');
    }
    if (result.paymentNo) {
      log(`  收款编号: ${result.paymentNo}`, 'green');
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
