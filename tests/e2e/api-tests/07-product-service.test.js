/**
 * API测试 - 产品管理和售后服务
 * 测试场景: 产品分类、产品创建、售后工单创建
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
let categoryId = null;
let productId = null;
let customerId = null;
let contractId = null;
let ticketId = null;

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
 * 步骤1: 获取已存在的客户和合同（用于售后服务测试）
 */
async function getCustomerAndContract() {
  log('\n========================================', 'blue');
  log('步骤 1: 获取已存在的客户和合同', 'blue');
  log('========================================\n', 'blue');

  try {
    // 获取客户
    const customerResponse = await axios.get(
      `${API_BASE_URL}/api/customers`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    let customers = null;
    if (customerResponse.data && customerResponse.data.data) {
      if (Array.isArray(customerResponse.data.data)) {
        customers = customerResponse.data.data;
      } else if (customerResponse.data.data.list) {
        customers = customerResponse.data.data.list;
      } else if (customerResponse.data.data.rows) {
        customers = customerResponse.data.data.rows;
      }
    }

    if (customers && customers.length > 0) {
      const customer = customers[0];
      customerId = customer.customer_id || customer.customerId;
      log('✅ 找到客户', 'green');
      log(`   客户ID: ${customerId}`);
    } else {
      log('⚠️  未找到客户', 'yellow');
      customerId = null;
    }

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
      log('✅ 找到合同', 'green');
      log(`   合同ID: ${contractId}`);
    } else {
      log('⚠️  未找到合同', 'yellow');
      contractId = null;
    }

    return true;
  } catch (error) {
    log('❌ 获取数据失败', 'red');
    log(`错误: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 测试1: 创建产品分类
 */
async function testCreateProductCategory() {
  log('\n========================================', 'blue');
  log('测试1: 创建产品分类', 'blue');
  log('========================================\n', 'blue');

  const categoryData = {
    category_name: '智能门锁',
    category_code: 'SMART_LOCK',
    sort_order: 1,
    description: '酒店智能门锁产品分类'
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/products/categories`,
      categoryData,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    log(`响应状态: ${response.status}`);
    log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);

    const checks = [];

    if (response.status === 200 || response.status === 201) {
      log('✅ HTTP状态码正确', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    if (response.data && response.data.data) {
      categoryId = response.data.data.categoryId || response.data.data.category_id;
      if (categoryId) {
        log('✅ 响应包含分类ID', 'green');
        log(`   分类ID: ${categoryId}`);
        checks.push(true);
      } else {
        log('❌ 响应不包含分类ID', 'red');
        checks.push(false);
      }
    }

    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 测试1通过: 创建产品分类', 'green');
      return { passed: true, name: '创建产品分类', categoryId };
    } else {
      log('\n❌ 测试1失败', 'red');
      return { passed: false, name: '创建产品分类' };
    }

  } catch (error) {
    log(`\n❌ 测试1失败`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    if (error.response) {
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { passed: false, name: '创建产品分类', error: error.message };
  }
}

/**
 * 测试2: 创建产品
 */
async function testCreateProduct() {
  log('\n========================================', 'blue');
  log('测试2: 创建产品', 'blue');
  log('========================================\n', 'blue');

  const productData = {
    product_code: 'SL-A1-001',
    product_name: '智能门锁A1型',
    category_id: categoryId,
    brand: '艾居来',
    model: 'A1-PRO',
    specifications: '支持指纹、密码、卡片、钥匙开锁',
    unit: '台',
    cost_price: 299.00,
    sales_price: 499.00,
    stock_quantity: 1000,
    status: 'active',
    product_description: '高端酒店智能门锁，支持多种开锁方式'
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/products`,
      productData,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    log(`响应状态: ${response.status}`);
    log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);

    const checks = [];

    if (response.status === 200 || response.status === 201) {
      log('✅ HTTP状态码正确', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    if (response.data && response.data.data) {
      productId = response.data.data.productId || response.data.data.product_id;
      if (productId) {
        log('✅ 响应包含产品ID', 'green');
        log(`   产品ID: ${productId}`);
        checks.push(true);
      } else {
        log('❌ 响应不包含产品ID', 'red');
        checks.push(false);
      }
    }

    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 测试2通过: 创建产品', 'green');
      return { passed: true, name: '创建产品', productId };
    } else {
      log('\n❌ 测试2失败', 'red');
      return { passed: false, name: '创建产品' };
    }

  } catch (error) {
    log(`\n❌ 测试2失败`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    if (error.response) {
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { passed: false, name: '创建产品', error: error.message };
  }
}

/**
 * 测试3: 查询产品列表
 */
async function testGetProductList() {
  log('\n========================================', 'blue');
  log('测试3: 查询产品列表', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/products`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const checks = [];

    if (response.status === 200) {
      log('✅ HTTP状态码正确', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    if (response.data && response.data.data) {
      log('✅ 响应包含数据对象', 'green');
      checks.push(true);

      let products = null;
      if (Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (response.data.data.list) {
        products = response.data.data.list;
      } else if (response.data.data.rows) {
        products = response.data.data.rows;
      }

      if (products && products.length > 0) {
        log(`✅ 找到 ${products.length} 个产品`, 'green');
        const firstProduct = products[0];
        const productName = firstProduct.product_name || firstProduct.productName;
        log(`   第一个产品: ${productName}`, 'green');
        checks.push(true);
      } else {
        log('⚠️  产品列表为空', 'yellow');
        checks.push(true);
      }
    }

    const allPassed = checks.every(check => check);
    return { passed: allPassed, name: '查询产品列表' };

  } catch (error) {
    log(`❌ 查询产品列表失败: ${error.message}`, 'red');
    return { passed: false, name: '查询产品列表', error: error.message };
  }
}

/**
 * 测试4: 创建售后工单
 */
async function testCreateServiceTicket() {
  log('\n========================================', 'blue');
  log('测试4: 创建售后工单', 'blue');
  log('========================================\n', 'blue');

  const ticketData = {
    customerId: customerId,
    contractId: contractId,
    productId: productId,
    ticketType: '故障维修',
    ticketTitle: '智能门锁无法正常开锁',
    priority: 'high',
    problemDescription: '301房间智能门锁无法使用密码和指纹开锁，只能用钥匙开锁',
    expectedResolveDate: '2025-12-30'
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/service-tickets`,
      ticketData,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    log(`响应状态: ${response.status}`);
    log(`响应数据: ${JSON.stringify(response.data, null, 2)}`);

    const checks = [];

    if (response.status === 200 || response.status === 201) {
      log('✅ HTTP状态码正确', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    if (response.data && response.data.data) {
      ticketId = response.data.data.ticketId || response.data.data.ticket_id;
      if (ticketId) {
        log('✅ 响应包含工单ID', 'green');
        log(`   工单ID: ${ticketId}`);
        checks.push(true);
      } else {
        log('❌ 响应不包含工单ID', 'red');
        checks.push(false);
      }
    }

    if (response.data && response.data.data) {
      const ticketNo = response.data.data.ticketNo || response.data.data.ticket_no;
      if (ticketNo && ticketNo.startsWith('TICKET')) {
        log('✅ 工单编号格式正确', 'green');
        log(`   工单编号: ${ticketNo}`);
        checks.push(true);
      } else {
        log('⚠️  工单编号格式可能不同', 'yellow');
        checks.push(true);
      }
    }

    const allPassed = checks.every(check => check);
    if (allPassed) {
      log('\n✅ 测试4通过: 创建售后工单', 'green');
      return { passed: true, name: '创建售后工单', ticketId };
    } else {
      log('\n❌ 测试4失败', 'red');
      return { passed: false, name: '创建售后工单' };
    }

  } catch (error) {
    log(`\n❌ 测试4失败`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    if (error.response) {
      log(`响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { passed: false, name: '创建售后工单', error: error.message };
  }
}

/**
 * 测试5: 查询售后工单列表
 */
async function testGetServiceTicketList() {
  log('\n========================================', 'blue');
  log('测试5: 查询售后工单列表', 'blue');
  log('========================================\n', 'blue');

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/service-tickets`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const checks = [];

    if (response.status === 200) {
      log('✅ HTTP状态码正确', 'green');
      checks.push(true);
    } else {
      log(`❌ HTTP状态码错误: ${response.status}`, 'red');
      checks.push(false);
    }

    if (response.data && response.data.data) {
      log('✅ 响应包含数据对象', 'green');
      checks.push(true);

      let tickets = null;
      if (Array.isArray(response.data.data)) {
        tickets = response.data.data;
      } else if (response.data.data.list) {
        tickets = response.data.data.list;
      } else if (response.data.data.rows) {
        tickets = response.data.data.rows;
      }

      if (tickets && tickets.length > 0) {
        log(`✅ 找到 ${tickets.length} 个工单`, 'green');
        const firstTicket = tickets[0];
        const ticketNo = firstTicket.ticket_no || firstTicket.ticketNo;
        log(`   第一个工单: ${ticketNo}`, 'green');
        checks.push(true);
      } else {
        log('⚠️  工单列表为空', 'yellow');
        checks.push(true);
      }
    }

    const allPassed = checks.every(check => check);
    return { passed: allPassed, name: '查询售后工单列表' };

  } catch (error) {
    log(`❌ 查询工单列表失败: ${error.message}`, 'red');
    return { passed: false, name: '查询售后工单列表', error: error.message };
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  log('\n┌─────────────────────────────────────────┐', 'blue');
  log('│  AijlCRM API测试 - 产品和售后服务       │', 'blue');
  log('└─────────────────────────────────────────┘', 'blue');

  const results = [];

  // 步骤0: 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ 登录失败，无法继续测试', 'red');
    process.exit(1);
  }

  // 步骤1: 获取客户和合同
  await getCustomerAndContract();

  // 运行测试
  results.push(await testCreateProductCategory());
  results.push(await testCreateProduct());
  results.push(await testGetProductList());
  results.push(await testCreateServiceTicket());
  results.push(await testGetServiceTicketList());

  // 总结
  log('\n========================================', 'blue');
  log('测试总结', 'blue');
  log('========================================\n', 'blue');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach(result => {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    const color = result.passed ? 'green' : 'red';
    log(`${status} - ${result.name}`, color);
    if (result.error) {
      log(`  错误: ${result.error}`, 'red');
    }
  });

  log(`\n总计: ${results.length} 个测试, ${passed} 个通过, ${failed} 个失败\n`);

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
