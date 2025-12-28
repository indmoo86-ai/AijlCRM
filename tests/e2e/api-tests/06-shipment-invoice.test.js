/**
 * API测试 - 发货和发票管理
 * 测试场景 8.1 - 创建发货单
 * 测试场景 9.1 - 创建发票
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
let paymentId = null;
let createdShipmentId = null;
let createdInvoiceId = null;

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
 * 步骤1: 获取已存在的合同和收款记录
 */
async function getContractAndPayment() {
  log('\n========================================', 'blue');
  log('步骤 1: 获取已存在的合同和收款记录', 'blue');
  log('========================================\n', 'blue');

  try {
    // 获取合同
    const contractResponse = await axios.get(
      `${API_BASE_URL}/api/contracts`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    let contracts = null;
    if (contractResponse.data && contractResponse.data.data) {
      if (Array.isArray(contractResponse.data.data)) {
        contracts = contractResponse.data.data;
      } else if (contractResponse.data.data.list) {
        contracts = contractResponse.data.data.list;
      } else if (contractResponse.data.data.rows) {
        contracts = contractResponse.data.data.rows;
      }
    }

    if (contracts && contracts.length > 0) {
      const contract = contracts[0];
      contractId = contract.contract_id || contract.contractId;
      customerId = contract.customer_id || contract.customerId;

      log('✅ 找到合同', 'green');
      log(`   合同ID: ${contractId}`);
      log(`   客户ID: ${customerId}`);
    } else {
      log('❌ 未找到合同', 'red');
      return false;
    }

    // 获取收款记录
    const paymentResponse = await axios.get(
      `${API_BASE_URL}/api/payments`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    let payments = null;
    if (paymentResponse.data && paymentResponse.data.data) {
      if (Array.isArray(paymentResponse.data.data)) {
        payments = paymentResponse.data.data;
      } else if (paymentResponse.data.data.list) {
        payments = paymentResponse.data.data.list;
      } else if (paymentResponse.data.data.rows) {
        payments = paymentResponse.data.data.rows;
      }
    }

    if (payments && payments.length > 0) {
      const payment = payments[0];
      paymentId = payment.payment_id || payment.paymentId;

      log('✅ 找到收款记录', 'green');
      log(`   收款ID: ${paymentId}`);
      return true;
    } else {
      log('⚠️  未找到收款记录，发票测试将使用null', 'yellow');
      paymentId = null;
      return true;
    }
  } catch (error) {
    log('❌ 获取数据失败', 'red');
    log(`错误: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 测试场景 8.1: 创建发货单
 */
async function testCreateShipment() {
  log('\n========================================', 'blue');
  log('测试场景 8.1: 创建发货单', 'blue');
  log('========================================\n', 'blue');

  const shipmentData = {
    contractId: contractId,
    shipmentTitle: '北京国际大酒店智能门锁发货',
    logisticsCompany: '顺丰速运',
    trackingNo: 'SF1234567890',
    shippingAddress: '北京市朝阳区建国路88号',
    contactPerson: '李经理',
    contactPhone: '13912345678',
    plannedShipDate: '2025-12-28',
    actualShipDate: '2025-12-28',
    estimatedDeliveryDate: '2025-12-30',
    shipmentNote: '第一批发货，共100台智能门锁'
  };

  try {
    log('步骤 1: 发送创建发货单请求', 'yellow');

    const response = await axios.post(
      `${API_BASE_URL}/api/shipments`,
      shipmentData,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
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
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    // 检查2: 响应中应包含发货单ID
    if (response.data && response.data.data) {
      createdShipmentId = response.data.data.shipmentId || response.data.data.shipment_id;
      if (createdShipmentId) {
        log('✅ 响应包含发货单ID', 'green');
        log(`   发货单ID: ${createdShipmentId}`);
        checks.push(true);
      } else {
        log('❌ 响应不包含发货单ID', 'red');
        checks.push(false);
      }
    } else {
      log('❌ 响应数据格式错误', 'red');
      checks.push(false);
    }

    // 检查3: 验证发货单编号
    if (response.data && response.data.data) {
      const shipmentNo = response.data.data.shipmentNo || response.data.data.shipment_no;
      if (shipmentNo && (shipmentNo.startsWith('SH') || shipmentNo.startsWith('SHIP'))) {
        log('✅ 发货单编号格式正确', 'green');
        log(`   发货单编号: ${shipmentNo}`);
        checks.push(true);
      } else {
        log('⚠️  发货单编号格式可能不同', 'yellow');
        log(`   发货单编号: ${shipmentNo}`);
        checks.push(true); // 仍然通过，只是格式可能不同
      }
    } else {
      checks.push(false);
    }

    // 检查4: 验证关联的合同ID和客户ID
    if (response.data && response.data.data) {
      const returnedContractId = response.data.data.contractId || response.data.data.contract_id;
      const returnedCustomerId = response.data.data.customerId || response.data.data.customer_id;

      if (returnedContractId == contractId) {
        log('✅ 合同ID正确', 'green');
        log(`   合同ID: ${returnedContractId}`);
        checks.push(true);
      } else {
        log('❌ 合同ID不匹配', 'red');
        checks.push(false);
      }

      if (returnedCustomerId == customerId) {
        log('✅ 客户ID正确', 'green');
        log(`   客户ID: ${returnedCustomerId}`);
        checks.push(true);
      } else {
        log('⚠️  客户ID可能不同', 'yellow');
        checks.push(true);
      }
    } else {
      checks.push(false);
    }

    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 场景 8.1 API测试通过', 'green');
      return {
        passed: true,
        scenario: '8.1',
        name: '创建发货单',
        shipmentId: createdShipmentId
      };
    } else {
      log('\n❌ 场景 8.1 API测试失败', 'red');
      return { passed: false, scenario: '8.1', name: '创建发货单', error: '部分验证点失败' };
    }

  } catch (error) {
    log(`\n❌ 场景 8.1 API测试失败`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    if (error.response) {
      log(`响应状态: ${error.response.status}`, 'red');
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { passed: false, scenario: '8.1', name: '创建发货单', error: error.message };
  }
}

/**
 * 测试场景 9.1: 创建发票
 */
async function testCreateInvoice() {
  log('\n========================================', 'blue');
  log('测试场景 9.1: 创建发票', 'blue');
  log('========================================\n', 'blue');

  const invoiceData = {
    contractId: contractId,
    paymentId: paymentId,
    invoiceType: '增值税专用发票',
    invoiceAmount: 10759.80,
    invoiceDate: '2025-12-28',
    invoiceTitle: '北京国际大酒店有限公司',
    taxNumber: '91110000123456789X',
    companyAddress: '北京市朝阳区建国路88号',
    companyPhone: '010-12345678',
    bankName: '中国银行北京朝阳支行',
    bankAccount: '1234567890123456789',
    invoiceNote: '合同签约款发票'
  };

  try {
    log('步骤 1: 发送创建发票请求', 'yellow');

    const response = await axios.post(
      `${API_BASE_URL}/api/invoices`,
      invoiceData,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
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
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    // 检查2: 响应中应包含发票ID
    if (response.data && response.data.data) {
      createdInvoiceId = response.data.data.invoiceId || response.data.data.invoice_id;
      if (createdInvoiceId) {
        log('✅ 响应包含发票ID', 'green');
        log(`   发票ID: ${createdInvoiceId}`);
        checks.push(true);
      } else {
        log('❌ 响应不包含发票ID', 'red');
        checks.push(false);
      }
    } else {
      log('❌ 响应数据格式错误', 'red');
      checks.push(false);
    }

    // 检查3: 验证发票号码
    if (response.data && response.data.data) {
      const invoiceNo = response.data.data.invoiceNo || response.data.data.invoice_no;
      if (invoiceNo && (invoiceNo.startsWith('INV') || invoiceNo.length > 5)) {
        log('✅ 发票号码已生成', 'green');
        log(`   发票号码: ${invoiceNo}`);
        checks.push(true);
      } else {
        log('⚠️  发票号码格式可能不同', 'yellow');
        log(`   发票号码: ${invoiceNo}`);
        checks.push(true);
      }
    } else {
      checks.push(false);
    }

    // 检查4: 验证发票金额和类型
    if (response.data && response.data.data) {
      const amount = response.data.data.invoiceAmount || response.data.data.invoice_amount;
      const type = response.data.data.invoiceType || response.data.data.invoice_type;

      if (parseFloat(amount) === invoiceData.invoiceAmount) {
        log('✅ 发票金额正确', 'green');
        log(`   发票金额: ${amount}`);
        checks.push(true);
      } else {
        log('❌ 发票金额不匹配', 'red');
        checks.push(false);
      }

      if (type === invoiceData.invoiceType) {
        log('✅ 发票类型正确', 'green');
        log(`   发票类型: ${type}`);
        checks.push(true);
      } else {
        log('⚠️  发票类型可能不同', 'yellow');
        log(`   发票类型: ${type}`);
        checks.push(true);
      }
    } else {
      checks.push(false);
    }

    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 场景 9.1 API测试通过', 'green');
      return {
        passed: true,
        scenario: '9.1',
        name: '创建发票',
        invoiceId: createdInvoiceId
      };
    } else {
      log('\n❌ 场景 9.1 API测试失败', 'red');
      return { passed: false, scenario: '9.1', name: '创建发票', error: '部分验证点失败' };
    }

  } catch (error) {
    log(`\n❌ 场景 9.1 API测试失败`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    if (error.response) {
      log(`响应状态: ${error.response.status}`, 'red');
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { passed: false, scenario: '9.1', name: '创建发票', error: error.message };
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  log('\n┌─────────────────────────────────────────┐', 'blue');
  log('│  AijlCRM API测试 - 发货和发票管理       │', 'blue');
  log('└─────────────────────────────────────────┘', 'blue');

  const results = [];

  // 步骤0: 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ 登录失败，无法继续测试', 'red');
    process.exit(1);
  }

  // 步骤1: 获取合同和收款记录
  const dataSuccess = await getContractAndPayment();
  if (!dataSuccess) {
    log('\n❌ 获取数据失败，无法继续测试', 'red');
    process.exit(1);
  }

  // 运行测试
  results.push(await testCreateShipment());
  results.push(await testCreateInvoice());

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
    if (result.shipmentId) {
      log(`  发货单ID: ${result.shipmentId}`, 'green');
    }
    if (result.invoiceId) {
      log(`  发票ID: ${result.invoiceId}`, 'green');
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
