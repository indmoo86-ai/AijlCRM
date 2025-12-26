/**
 * API 自动化测试脚本
 * 测试核心业务流程和主要接口
 *
 * 使用前提：
 * 1. 确保后端服务已启动 (npm start)
 * 2. 确保已运行种子数据脚本
 *
 * 运行: node backend/scripts/test-api.js
 */

const axios = require('axios');

// 配置
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`)
};

// 测试上下文（存储测试过程中创建的数据）
const context = {
  tokens: {},
  users: {},
  products: [],
  leads: [],
  customers: [],
  quotations: [],
  contracts: [],
  shipments: [],
  payments: [],
  invoices: []
};

// HTTP 请求封装
const request = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

/**
 * 测试套件：认证模块
 */
const testAuth = async () => {
  log.section('测试模块 1: 用户认证');

  // 1.1 管理员登录
  log.info('1.1 测试管理员登录...');
  const adminLogin = await request('POST', '/auth/login', {
    username: 'admin',
    password: 'admin123'
  });

  if (adminLogin.success && adminLogin.data.data.token) {
    context.tokens.admin = adminLogin.data.data.token;
    context.users.admin = adminLogin.data.data.user;
    log.success(`管理员登录成功 - Token: ${context.tokens.admin.substring(0, 20)}...`);
  } else {
    log.error(`管理员登录失败: ${JSON.stringify(adminLogin.error)}`);
    return false;
  }

  // 1.2 销售人员登录
  log.info('1.2 测试销售人员登录...');
  const salesLogin = await request('POST', '/auth/login', {
    username: 'sales001',
    password: 'sales123'
  });

  if (salesLogin.success && salesLogin.data.data.token) {
    context.tokens.sales = salesLogin.data.data.token;
    context.users.sales = salesLogin.data.data.user;
    log.success(`销售人员登录成功 - 用户: ${context.users.sales.name}`);
  } else {
    log.error(`销售人员登录失败: ${JSON.stringify(salesLogin.error)}`);
  }

  // 1.3 错误密码登录（应该失败）
  log.info('1.3 测试错误密码登录...');
  const wrongLogin = await request('POST', '/auth/login', {
    username: 'admin',
    password: 'wrongpassword'
  });

  if (!wrongLogin.success) {
    log.success('错误密码登录被正确拒绝');
  } else {
    log.error('错误密码登录应该失败但成功了！');
  }

  return true;
};

/**
 * 测试套件：产品管理
 */
const testProducts = async () => {
  log.section('测试模块 2: 产品管理');

  // 2.1 查询产品列表
  log.info('2.1 查询产品列表...');
  const productList = await request('GET', '/products?page=1&pageSize=10', null, context.tokens.admin);

  if (productList.success) {
    context.products = productList.data.data.rows || [];
    log.success(`查询到 ${context.products.length} 个产品`);
    if (context.products.length > 0) {
      log.info(`  第一个产品: ${context.products[0].product_name} (¥${context.products[0].sale_price})`);
    }
  } else {
    log.error(`查询产品失败: ${JSON.stringify(productList.error)}`);
    return false;
  }

  // 2.2 创建新产品
  log.info('2.2 创建新产品...');
  const newProduct = await request('POST', '/products', {
    productCode: `TEST-${Date.now()}`,
    productName: '测试产品-智能温控器',
    brand: '艾居来',
    categoryId: 2,
    costPrice: 150.00,
    salePrice: 280.00,
    unit: '台',
    description: '自动化测试创建的产品',
    status: 'active'
  }, context.tokens.admin);

  if (newProduct.success && newProduct.data.data) {
    context.products.push(newProduct.data.data);
    log.success(`创建产品成功 - ID: ${newProduct.data.data.product_id}`);
  } else {
    log.error(`创建产品失败: ${JSON.stringify(newProduct.error)}`);
  }

  // 2.3 查询产品详情
  if (context.products.length > 0) {
    const productId = context.products[0].product_id;
    log.info(`2.3 查询产品详情 (ID: ${productId})...`);

    const productDetail = await request('GET', `/products/${productId}`, null, context.tokens.admin);

    if (productDetail.success) {
      log.success(`查询产品详情成功 - ${productDetail.data.data.product_name}`);
    } else {
      log.error(`查询产品详情失败: ${JSON.stringify(productDetail.error)}`);
    }
  }

  return true;
};

/**
 * 测试套件：线索管理
 */
const testLeads = async () => {
  log.section('测试模块 3: 线索管理');

  // 3.1 创建线索
  log.info('3.1 创建销售线索...');
  const newLead = await request('POST', '/leads', {
    customerName: '测试酒店集团',
    hotelName: '测试豪华酒店',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    roomCount: 200,
    phone: '13800138000',
    wechat: 'testhotel',
    channelSource: 'website',
    intentionLevel: 'high',
    requirement: '需要全套智能客房解决方案',
    estimatedAmount: 500000
  }, context.tokens.sales);

  if (newLead.success && newLead.data.data) {
    context.leads.push(newLead.data.data);
    log.success(`创建线索成功 - 线索编号: ${newLead.data.data.leadNo}`);
  } else {
    log.error(`创建线索失败: ${JSON.stringify(newLead.error)}`);
    return false;
  }

  // 3.2 添加跟进记录
  if (context.leads.length > 0) {
    const leadId = context.leads[0].id;
    log.info(`3.2 添加跟进记录 (线索ID: ${leadId})...`);

    const followUp = await request('POST', `/leads/${leadId}/follow-up`, {
      followType: 'phone',
      content: '电话沟通，客户对智能门锁很感兴趣',
      intentionLevel: 'high',
      nextPlan: '下周安排现场演示',
      nextFollowDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }, context.tokens.sales);

    if (followUp.success) {
      log.success('添加跟进记录成功');
    } else {
      log.error(`添加跟进记录失败: ${JSON.stringify(followUp.error)}`);
    }
  }

  // 3.3 查询线索列表
  log.info('3.3 查询线索列表...');
  const leadList = await request('GET', '/leads?page=1&pageSize=10', null, context.tokens.sales);

  if (leadList.success) {
    log.success(`查询到 ${leadList.data.data.total} 条线索`);
  } else {
    log.error(`查询线索失败: ${JSON.stringify(leadList.error)}`);
  }

  return true;
};

/**
 * 测试套件：客户管理
 */
const testCustomers = async () => {
  log.section('测试模块 4: 客户管理');

  // 4.1 线索转客户
  if (context.leads.length > 0) {
    const leadId = context.leads[0].id;
    log.info(`4.1 线索转客户 (线索ID: ${leadId})...`);

    const convertResult = await request('POST', `/leads/${leadId}/convert`, {
      customerType: 'chain_hotel',
      customerLevel: 'A'
    }, context.tokens.sales);

    if (convertResult.success && convertResult.data.data) {
      context.customers.push(convertResult.data.data);
      log.success(`线索转客户成功 - 客户编号: ${convertResult.data.data.customerNo}`);
    } else {
      log.error(`线索转客户失败: ${JSON.stringify(convertResult.error)}`);
    }
  }

  // 4.2 添加客户联系人
  if (context.customers.length > 0) {
    const customerId = context.customers[0].id;
    log.info(`4.2 添加客户联系人 (客户ID: ${customerId})...`);

    const addContact = await request('POST', `/customers/${customerId}/contacts`, {
      contactName: '王经理',
      position: '采购经理',
      mobile: '13900139000',
      wechat: 'wangjl',
      email: 'wangjl@testhotel.com',
      isPrimary: 1,
      description: '主要采购决策人'
    }, context.tokens.sales);

    if (addContact.success) {
      log.success('添加客户联系人成功');
    } else {
      log.error(`添加客户联系人失败: ${JSON.stringify(addContact.error)}`);
    }
  }

  // 4.3 查询客户列表
  log.info('4.3 查询客户列表...');
  const customerList = await request('GET', '/customers?page=1&pageSize=10', null, context.tokens.sales);

  if (customerList.success) {
    log.success(`查询到 ${customerList.data.data.total} 个客户`);
  } else {
    log.error(`查询客户失败: ${JSON.stringify(customerList.error)}`);
  }

  return true;
};

/**
 * 测试套件：报价管理
 */
const testQuotations = async () => {
  log.section('测试模块 5: 报价管理');

  if (context.customers.length === 0 || context.products.length === 0) {
    log.warn('跳过报价测试（缺少客户或产品数据）');
    return true;
  }

  // 5.1 创建报价单
  log.info('5.1 创建报价单...');
  const customerId = context.customers[0].id;
  const productItems = context.products.slice(0, 2).map((p, idx) => ({
    productId: p.product_id,
    productName: p.product_name,
    quantity: (idx + 1) * 10,
    unitPrice: p.sale_price,
    discount: 0.95,
    totalPrice: (idx + 1) * 10 * p.sale_price * 0.95,
    remark: `测试明细 ${idx + 1}`
  }));

  const totalAmount = productItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const newQuotation = await request('POST', '/quotations', {
    customerId,
    quotationTitle: '智能客房改造方案报价',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalAmount,
    items: productItems,
    remark: '自动化测试创建的报价单'
  }, context.tokens.sales);

  if (newQuotation.success && newQuotation.data.data) {
    context.quotations.push(newQuotation.data.data);
    log.success(`创建报价单成功 - 报价编号: ${newQuotation.data.data.quotationNo}, 金额: ¥${totalAmount}`);
  } else {
    log.error(`创建报价单失败: ${JSON.stringify(newQuotation.error)}`);
    return false;
  }

  // 5.2 提交报价单
  if (context.quotations.length > 0) {
    const quotationId = context.quotations[0].quotationId;
    log.info(`5.2 提交报价单 (ID: ${quotationId})...`);

    const submitQuotation = await request('PUT', `/quotations/${quotationId}/submit`, {}, context.tokens.sales);

    if (submitQuotation.success) {
      log.success('提交报价单成功');
    } else {
      log.error(`提交报价单失败: ${JSON.stringify(submitQuotation.error)}`);
    }
  }

  return true;
};

/**
 * 测试套件：合同管理
 */
const testContracts = async () => {
  log.section('测试模块 6: 合同管理');

  if (context.quotations.length === 0) {
    log.warn('跳过合同测试（缺少报价数据）');
    return true;
  }

  // 6.1 创建合同
  log.info('6.1 创建合同...');
  const quotation = context.quotations[0];

  const newContract = await request('POST', '/contracts', {
    contractTitle: '智能客房改造项目合同',
    customerId: quotation.customerId,
    sourceQuotationId: quotation.quotationId,
    contractAmount: quotation.totalAmount,
    signDate: new Date().toISOString().split('T')[0],
    paymentTerms: { stages: [{ stage: '签约款', ratio: 0.3 }, { stage: '发货款', ratio: 0.4 }, { stage: '验收款', ratio: 0.3 }] },
    deliveryTerms: { deliveryDays: 30, location: '项目现场' },
    warrantyTerms: { warrantyYears: 2, terms: '提供2年质保服务' }
  }, context.tokens.sales);

  if (newContract.success && newContract.data.data) {
    context.contracts.push(newContract.data.data);
    log.success(`创建合同成功 - 合同编号: ${newContract.data.data.contractNo}`);
  } else {
    log.error(`创建合同失败: ${JSON.stringify(newContract.error)}`);
    return false;
  }

  // 6.2 签署合同
  if (context.contracts.length > 0) {
    const contractId = context.contracts[0].contractId;
    log.info(`6.2 签署合同 (ID: ${contractId})...`);

    const signContract = await request('PUT', `/contracts/${contractId}/sign`, {
      customerSignDate: new Date().toISOString().split('T')[0],
      companySignDate: new Date().toISOString().split('T')[0]
    }, context.tokens.sales);

    if (signContract.success) {
      log.success('签署合同成功');
    } else {
      log.error(`签署合同失败: ${JSON.stringify(signContract.error)}`);
    }
  }

  return true;
};

/**
 * 测试套件：收款管理
 */
const testPayments = async () => {
  log.section('测试模块 7: 收款管理');

  if (context.contracts.length === 0) {
    log.warn('跳过收款测试（缺少合同数据）');
    return true;
  }

  // 7.1 创建收款记录
  log.info('7.1 创建收款记录...');
  const contract = context.contracts[0];
  const paidAmount = contract.contractAmount * 0.3; // 30%签约款

  const newPayment = await request('POST', '/payments', {
    contractId: contract.contractId,
    customerId: contract.customerId,
    paymentStage: '签约款',
    paidAmount,
    paymentMethod: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    bankAccount: '6222021234567890',
    paymentNote: '首期签约款'
  }, context.tokens.sales);

  if (newPayment.success && newPayment.data.data) {
    context.payments.push(newPayment.data.data);
    log.success(`创建收款记录成功 - 收款编号: ${newPayment.data.data.paymentNo}, 金额: ¥${paidAmount}`);
  } else {
    log.error(`创建收款记录失败: ${JSON.stringify(newPayment.error)}`);
    return false;
  }

  // 7.2 确认收款
  if (context.payments.length > 0) {
    const paymentId = context.payments[0].paymentId;
    log.info(`7.2 确认收款 (ID: ${paymentId})...`);

    const confirmPayment = await request('PUT', `/payments/${paymentId}/confirm`, {
      confirmNote: '已核实到账'
    }, context.tokens.admin);

    if (confirmPayment.success) {
      log.success('确认收款成功（合同received_amount已自动更新）');
    } else {
      log.error(`确认收款失败: ${JSON.stringify(confirmPayment.error)}`);
    }
  }

  return true;
};

/**
 * 测试套件：发货管理
 */
const testShipments = async () => {
  log.section('测试模块 8: 发货管理');

  if (context.contracts.length === 0) {
    log.warn('跳过发货测试（缺少合同数据）');
    return true;
  }

  // 8.1 创建发货单
  log.info('8.1 创建发货单...');
  const contract = context.contracts[0];

  const newShipment = await request('POST', '/shipments', {
    contractId: contract.contractId,
    shipmentTitle: '第一批货物发货',
    shippingAddress: '深圳市南山区科技园',
    contactPerson: '王经理',
    contactPhone: '13900139000',
    shipmentAmount: contract.contractAmount * 0.5,
    plannedShipDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remark: '首批发货，包含智能门锁'
  }, context.tokens.admin);

  if (newShipment.success && newShipment.data.data) {
    context.shipments.push(newShipment.data.data);
    log.success(`创建发货单成功 - 发货编号: ${newShipment.data.data.shipmentNo}`);
  } else {
    log.error(`创建发货单失败: ${JSON.stringify(newShipment.error)}`);
    return false;
  }

  // 8.2 确认发货
  if (context.shipments.length > 0) {
    const shipmentId = context.shipments[0].shipmentId;
    log.info(`8.2 确认发货 (ID: ${shipmentId})...`);

    const confirmShipment = await request('PUT', `/shipments/${shipmentId}/confirm`, {
      logisticsCompany: '顺丰速运',
      trackingNo: 'SF' + Date.now(),
      actualShipDate: new Date().toISOString().split('T')[0]
    }, context.tokens.admin);

    if (confirmShipment.success) {
      log.success('确认发货成功（合同shipped_amount已自动更新）');
    } else {
      log.error(`确认发货失败: ${JSON.stringify(confirmShipment.error)}`);
    }
  }

  return true;
};

/**
 * 测试套件：发票管理
 */
const testInvoices = async () => {
  log.section('测试模块 9: 发票管理');

  if (context.contracts.length === 0 || context.payments.length === 0) {
    log.warn('跳过发票测试（缺少合同或收款数据）');
    return true;
  }

  // 9.1 创建发票
  log.info('9.1 创建发票...');
  const contract = context.contracts[0];
  const payment = context.payments[0];

  const newInvoice = await request('POST', '/invoices', {
    contractId: contract.contractId,
    customerId: contract.customerId,
    paymentId: payment.paymentId,
    invoiceType: 'vat_special',
    invoiceAmount: payment.paidAmount,
    taxNumber: '91440300000000000X',
    bankName: '中国工商银行深圳分行',
    bankAccount: '4000123456789012',
    companyAddress: '深圳市南山区科技园',
    companyPhone: '0755-12345678',
    remark: '签约款发票'
  }, context.tokens.admin);

  if (newInvoice.success && newInvoice.data.data) {
    context.invoices.push(newInvoice.data.data);
    log.success(`创建发票成功 - 发票ID: ${newInvoice.data.data.invoiceId}`);
  } else {
    log.error(`创建发票失败: ${JSON.stringify(newInvoice.error)}`);
    return false;
  }

  // 9.2 确认开票
  if (context.invoices.length > 0) {
    const invoiceId = context.invoices[0].invoiceId;
    log.info(`9.2 确认开票 (ID: ${invoiceId})...`);

    const confirmInvoice = await request('PUT', `/invoices/${invoiceId}/confirm`, {
      invoiceNo: 'INV' + Date.now(),
      invoiceDate: new Date().toISOString().split('T')[0]
    }, context.tokens.admin);

    if (confirmInvoice.success) {
      log.success('确认开票成功（合同invoiced_amount已自动更新）');
    } else {
      log.error(`确认开票失败: ${JSON.stringify(confirmInvoice.error)}`);
    }
  }

  return true;
};

/**
 * 测试套件：合同执行进度查询
 */
const testContractProgress = async () => {
  log.section('测试模块 10: 合同执行进度');

  if (context.contracts.length === 0) {
    log.warn('跳过合同进度测试（缺少合同数据）');
    return true;
  }

  const contractId = context.contracts[0].contractId;
  log.info(`查询合同执行进度 (合同ID: ${contractId})...`);

  const progress = await request('GET', `/contracts/${contractId}/progress`, null, context.tokens.admin);

  if (progress.success) {
    const data = progress.data.data;
    log.success('查询合同执行进度成功:');
    console.log(`  合同金额: ¥${data.contractAmount}`);
    console.log(`  已发货: ¥${data.shippedAmount} (${data.shippedProgress}%)`);
    console.log(`  已收款: ¥${data.receivedAmount} (${data.receivedProgress}%)`);
    console.log(`  已开票: ¥${data.invoicedAmount} (${data.invoicedProgress}%)`);
    console.log(`  发货单数量: ${data.shipments.length}`);
    console.log(`  收款记录数量: ${data.payments.length}`);
  } else {
    log.error(`查询合同进度失败: ${JSON.stringify(progress.error)}`);
  }

  return true;
};

/**
 * 主测试函数
 */
const runAllTests = async () => {
  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log(`  艾居来 CRM - API 自动化测试`);
  console.log(`  测试目标: ${BASE_URL}`);
  console.log(`  开始时间: ${new Date().toLocaleString()}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: '认证模块', fn: testAuth },
    { name: '产品管理', fn: testProducts },
    { name: '线索管理', fn: testLeads },
    { name: '客户管理', fn: testCustomers },
    { name: '报价管理', fn: testQuotations },
    { name: '合同管理', fn: testContracts },
    { name: '收款管理', fn: testPayments },
    { name: '发货管理', fn: testShipments },
    { name: '发票管理', fn: testInvoices },
    { name: '合同进度查询', fn: testContractProgress }
  ];

  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed !== false) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      log.error(`${test.name} 测试异常: ${error.message}`);
    }
  }

  // 输出测试摘要
  log.section('测试摘要');
  console.log(`总测试套件: ${results.total}`);
  console.log(`${colors.green}通过: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}失败: ${results.failed}${colors.reset}`);
  console.log(`成功率: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  console.log(`\n${colors.cyan}${'='.repeat(60)}`);
  console.log(`  测试完成时间: ${new Date().toLocaleString()}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  process.exit(results.failed > 0 ? 1 : 0);
};

// 执行测试
runAllTests().catch(error => {
  log.error(`测试执行失败: ${error.message}`);
  console.error(error);
  process.exit(1);
});
