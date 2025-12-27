/**
 * API测试 - 报价单到合同流程
 * 测试场景 5.1 和 6.1
 * Scene 5.1: 创建报价单
 * Scene 6.1: 基于报价单创建合同
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// 测试数据
const loginData = {
  username: 'admin',
  password: 'admin123'
};

// 全局变量
let authToken = null;
let customerId = null;
let productId = null;
let createdQuotationId = null;
let createdContractId = null;

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
 * 准备：获取客户ID（使用之前创建的客户）
 */
async function getCustomer() {
  log('\n========================================', 'blue');
  log('准备: 获取客户信息', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/customers`,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );

    log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);

    // 处理不同的响应格式
    let customers = null;
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        customers = response.data.data;
      } else if (response.data.data.list) {
        customers = response.data.data.list;
      } else if (response.data.data.rows) {
        customers = response.data.data.rows;
      }
    } else if (response.data && Array.isArray(response.data)) {
      customers = response.data;
    }

    if (customers && customers.length > 0) {
      customerId = customers[0].id;
      log('✅ 获取到客户ID', 'green');
      log(`   客户ID: ${customerId}`);
      log(`   客户名称: ${customers[0].customerName || customers[0].customer_name}`);
      return true;
    } else {
      log('❌ 没有找到客户', 'red');
      log('   提示: 请先运行线索转客户测试以创建客户数据', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ 获取客户失败', 'red');
    log(`错误: ${error.message}`, 'red');
    if (error.response) {
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

/**
 * 准备：获取产品ID
 */
async function getProduct() {
  log('\n========================================', 'blue');
  log('准备: 获取产品信息', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/products`,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );

    log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);

    // 处理不同的响应格式
    let products = null;
    if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (response.data.data.list) {
        products = response.data.data.list;
      } else if (response.data.data.rows) {
        products = response.data.data.rows;
      }
    } else if (response.data && Array.isArray(response.data)) {
      products = response.data;
    }

    if (products && products.length > 0) {
      productId = products[0].product_id;
      log('✅ 获取到产品ID', 'green');
      log(`   产品ID: ${productId}`);
      log(`   产品名称: ${products[0].product_name}`);
      return true;
    } else {
      log('❌ 没有找到产品', 'red');
      log('   提示: 数据库中应该有seed产品数据', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ 获取产品失败', 'red');
    log(`错误: ${error.message}`, 'red');
    if (error.response) {
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

/**
 * 测试场景 5.1: 创建报价单
 */
async function testCreateQuotation() {
  log('\n========================================', 'blue');
  log('测试场景 5.1: 创建报价单', 'blue');
  log('========================================\n', 'blue');

  const quotationData = {
    customer_id: customerId,
    quotation_date: '2025-12-27',
    valid_until: '2026-01-27',
    notes: '智能门锁及控制系统报价',
    owner_id: 1,
    created_by: 1,
    items: [
      {
        product_id: productId,
        product_name: '酒店智能门锁 Pro',
        quantity: 200,
        unit_price: 880.00,
        discount: 0.05,
        tax_rate: 0.13
      }
    ]
  };

  try {
    log('步骤 1: 发送创建报价单请求', 'yellow');
    log(`请求数据: ${JSON.stringify(quotationData, null, 2)}`);

    const response = await axios.post(
      `${API_BASE_URL}/api/quotations`,
      quotationData,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );

    log('\n步骤 2: 验证API响应', 'yellow');
    log(`响应状态: ${response.status}`);
    log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);

    const checks = [];

    // 检查1: HTTP状态码
    if (response.status === 200 || response.status === 201) {
      log('✅ HTTP状态码正确', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: 预期200/201, 实际${response.status}`, 'red');
      checks.push(false);
    }

    // 检查2: 响应中应包含报价单ID
    if (response.data && response.data.data) {
      createdQuotationId = response.data.data.quotation_id || response.data.data.quotationId || response.data.data.id;
      if (createdQuotationId) {
        log('✅ 响应包含报价单ID', 'green');
        log(`   报价单ID: ${createdQuotationId}`);
        checks.push(true);
      } else {
        log('❌ 响应不包含报价单ID', 'red');
        checks.push(false);
      }
    } else {
      log('❌ 响应格式错误', 'red');
      checks.push(false);
    }

    // 检查3: 验证报价单编号
    if (response.data && response.data.data) {
      const quotation = response.data.data;
      const quotationNo = quotation.quotation_no || quotation.quotationNo;
      if (quotationNo && quotationNo.startsWith('QT')) {
        log('✅ 报价单编号格式正确', 'green');
        log(`   报价单编号: ${quotationNo}`);
        checks.push(true);
      } else {
        log('❌ 报价单编号格式错误', 'red');
        checks.push(false);
      }
    }

    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 场景 5.1 API测试通过', 'green');
      return { passed: true, scenario: '5.1', name: '创建报价单', quotationId: createdQuotationId };
    } else {
      log('\n❌ 场景 5.1 API测试失败', 'red');
      return { passed: false, scenario: '5.1', name: '创建报价单', error: '部分验证点失败' };
    }

  } catch (error) {
    log(`\n❌ 场景 5.1 API测试失败`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    if (error.response) {
      log(`响应状态: ${error.response.status}`, 'red');
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { passed: false, scenario: '5.1', name: '创建报价单', error: error.message };
  }
}

/**
 * 测试场景 6.1: 基于报价单创建合同
 */
async function testCreateContractFromQuotation() {
  log('\n========================================', 'blue');
  log('测试场景 6.1: 基于报价单创建合同', 'blue');
  log('========================================\n', 'blue');

  if (!createdQuotationId) {
    log('❌ 无法执行测试：未找到报价单ID', 'red');
    return { passed: false, scenario: '6.1', name: '基于报价单创建合同', error: '缺少报价单ID' };
  }

  const contractData = {
    quotation_id: createdQuotationId,
    contract_title: '北京国际大酒店智能门锁采购合同',
    customer_id: customerId,
    contract_amount: 176000.00,
    payment_terms: [
      { stage: 1, stageName: '签约款', percentage: 30, amount: 52800, dueDate: '2025-01-15' },
      { stage: 2, stageName: '发货款', percentage: 40, amount: 70400, dueDate: '2025-02-01' },
      { stage: 3, stageName: '验收款', percentage: 30, amount: 52800, dueDate: '2025-03-01' }
    ],
    delivery_terms: '合同签订后30个工作日内完成交付',
    warranty_terms: {
      warrantyPeriod: '2年',
      warrantyScope: '产品质量问题免费维修',
      warrantyConditions: '正常使用情况下'
    },
    delivery_deadline: '2025-02-28',
    owner_id: 1,
    created_by: 1
  };

  try {
    log('步骤 1: 发送创建合同请求', 'yellow');
    log(`请求数据: ${JSON.stringify(contractData, null, 2)}`);

    const response = await axios.post(
      `${API_BASE_URL}/api/contracts`,
      contractData,
      { headers: { 'Authorization': `Bearer ${authToken}` } }
    );

    log('\n步骤 2: 验证API响应', 'yellow');
    log(`响应状态: ${response.status}`);
    log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);

    const checks = [];

    // 检查1: HTTP状态码
    if (response.status === 200 || response.status === 201) {
      log('✅ HTTP状态码正确', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: 预期200/201, 实际${response.status}`, 'red');
      checks.push(false);
    }

    // 检查2: 响应中应包含合同ID
    if (response.data && response.data.data) {
      createdContractId = response.data.data.contract_id || response.data.data.contractId || response.data.data.id;
      if (createdContractId) {
        log('✅ 响应包含合同ID', 'green');
        log(`   合同ID: ${createdContractId}`);
        checks.push(true);
      } else {
        log('❌ 响应不包含合同ID', 'red');
        checks.push(false);
      }
    } else {
      log('❌ 响应格式错误', 'red');
      checks.push(false);
    }

    // 检查3: 验证合同编号
    if (response.data && response.data.data) {
      const contract = response.data.data;
      const contractNo = contract.contract_no || contract.contractNo;
      if (contractNo && (contractNo.startsWith('CT') || contractNo.startsWith('CONT'))) {
        log('✅ 合同编号格式正确', 'green');
        log(`   合同编号: ${contractNo}`);
        checks.push(true);
      } else {
        log(`❌ 合同编号格式错误: ${contractNo}`, 'red');
        checks.push(false);
      }
    }

    // 检查4: 验证合同状态
    if (response.data && response.data.data) {
      const contract = response.data.data;
      const status = contract.status;
      if (status === 'draft' || status === 'pending') {
        log('✅ 合同状态正确', 'green');
        log(`   合同状态: ${status}`);
        checks.push(true);
      } else {
        log(`❌ 合同状态异常: ${status}`, 'red');
        checks.push(false);
      }
    }

    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 场景 6.1 API测试通过', 'green');
      return { passed: true, scenario: '6.1', name: '基于报价单创建合同', contractId: createdContractId };
    } else {
      log('\n❌ 场景 6.1 API测试失败', 'red');
      return { passed: false, scenario: '6.1', name: '基于报价单创建合同', error: '部分验证点失败' };
    }

  } catch (error) {
    log(`\n❌ 场景 6.1 API测试失败`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    if (error.response) {
      log(`响应状态: ${error.response.status}`, 'red');
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { passed: false, scenario: '6.1', name: '基于报价单创建合同', error: error.message };
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  log('\n┌─────────────────────────────────────────┐', 'blue');
  log('│  AijlCRM API测试 - 报价单到合同流程      │', 'blue');
  log('└─────────────────────────────────────────┘', 'blue');

  const results = [];

  // 步骤0: 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ 登录失败，无法继续测试', 'red');
    process.exit(1);
  }

  // 准备: 获取客户和产品
  const customerSuccess = await getCustomer();
  if (!customerSuccess) {
    log('\n❌ 获取客户失败，无法继续测试', 'red');
    process.exit(1);
  }

  const productSuccess = await getProduct();
  if (!productSuccess) {
    log('\n❌ 获取产品失败，无法继续测试', 'red');
    process.exit(1);
  }

  // 运行测试
  results.push(await testCreateQuotation());
  results.push(await testCreateContractFromQuotation());

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
    if (result.quotationId) {
      log(`  报价单ID: ${result.quotationId}`, 'green');
    }
    if (result.contractId) {
      log(`  合同ID: ${result.contractId}`, 'green');
    }
  });

  log(`\n总计: ${results.length} 个场景, ${passed} 个通过, ${failed} 个失败\n`);

  if (failed > 0) {
    log('⚠️  部分测试失败，请检查错误信息并修复', 'yellow');
    process.exit(1);
  } else {
    log('🎉 所有API测试通过！', 'green');
    process.exit(0);
  }
}

// 运行测试
runTests().catch(error => {
  log(`\n❌ 测试执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
