/**
 * 完整业务流程端到端测试
 *
 * 测试场景：模拟真实销售业务全流程
 *
 * 业务规则：
 * 1. 创建线索时自动创建对应的客户
 * 2. 所有报价单和合同都必须关联线索
 * 3. 老客户复购也需要先创建新线索
 *
 * 流程1：新客户首次成交流程（小单快速成交）
 * - 线索创建(自动创建客户) -> 跟踪 -> 报价 -> 合同 -> 发货 -> 收款 -> 发票
 *
 * 流程2：大客户多次跟进流程（需要多次跟进）
 * - 线索创建(自动创建客户) -> 多次跟踪 -> 报价 -> 合同 -> 分批发货 -> 分期收款 -> 发票
 *
 * 流程3：老客户复购流程
 * - 创建新线索(关联老客户) -> 报价 -> 合同 -> 发货 -> 收款 -> 发票
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots/full-flow');

// 确保截图目录存在
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 测试数据存储
const testData = {
  token: null,
  user: null,
  // 流程1数据
  flow1: {
    lead: null,
    customer: null,
    product: null,
    quotation: null,
    contract: null,
    shipment: null,
    payment: null,
    invoice: null
  },
  // 流程2数据
  flow2: {
    lead: null,
    customer: null,
    products: [],
    quotation: null,
    contract: null,
    shipments: [],
    payments: [],
    invoices: []
  },
  // 流程3数据
  flow3: {
    lead: null,      // 复购也需要创建新线索
    customer: null,  // 使用流程1的客户
    quotation: null,
    contract: null,
    shipment: null,
    payment: null,
    invoice: null
  }
};

// HTTP请求封装
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 日志输出
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substr(11, 8);
  const prefix = {
    'info': '\x1b[36m[INFO]\x1b[0m',
    'success': '\x1b[32m[SUCCESS]\x1b[0m',
    'error': '\x1b[31m[ERROR]\x1b[0m',
    'warn': '\x1b[33m[WARN]\x1b[0m',
    'step': '\x1b[35m[STEP]\x1b[0m'
  };
  console.log(`${timestamp} ${prefix[type] || '[INFO]'} ${message}`);
}

// 测试步骤封装
async function testStep(stepName, testFn) {
  log(`开始: ${stepName}`, 'step');
  try {
    const result = await testFn();
    log(`完成: ${stepName}`, 'success');
    return result;
  } catch (error) {
    log(`失败: ${stepName} - ${error.message}`, 'error');
    throw error;
  }
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 流程1: 新客户首次成交流程 ====================
async function runFlow1() {
  log('========== 流程1: 新客户首次成交流程（小单快速成交）==========', 'info');
  log('业务流程: 线索创建(自动创建客户) → 跟踪 → 报价 → 合同 → 收款 → 发货 → 发票', 'info');

  const timestamp = Date.now();

  // Step 1: 创建线索（自动创建客户）
  await testStep('1.1 创建销售线索（自动创建客户）', async () => {
    const leadData = {
      customer_name: `杭州西湖酒店_${timestamp}`,
      contact_person: '王经理',
      contact_phone: '13800001001',
      contact_email: 'wang@xihu-hotel.com',
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      address: '西湖大道100号',
      room_count: 120,
      source: 'website',
      priority: 'high',
      notes: '客户通过官网咨询，对智能门锁很感兴趣，预算充足，希望尽快安装'
    };

    const res = await request('POST', '/api/leads', leadData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow1.lead = res.data.data;
    testData.flow1.customer = res.data.data.customer;

    log(`线索创建成功: ${testData.flow1.lead.leadId}, 线索编号: ${testData.flow1.lead.leadNo}`);
    log(`客户自动创建: ${testData.flow1.customer.id}, 客户编号: ${testData.flow1.customer.customerNo}`);
  });

  // Step 2: 首次跟踪 - 电话沟通
  await testStep('1.2 线索跟踪 - 首次电话沟通', async () => {
    const followUpData = {
      follow_type: 'phone',
      content: '首次电话沟通，客户表示酒店正在装修改造，计划为120间客房配备智能门锁。预算约20万，希望能在一个月内完成安装。已发送产品资料。',
      next_follow_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      next_follow_plan: '上门拜访，现场勘察'
    };

    const res = await request('POST', `/api/leads/${testData.flow1.lead.leadId}/follow-up`, followUpData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log('跟踪记录已添加: 首次电话沟通');
  });

  // Step 3: 更新线索状态为"需求确认"
  await testStep('1.3 更新线索状态 - 需求确认', async () => {
    const updateData = {
      status: 2, // 跟进中
      estimatedAmount: 200000,
      expectedSignDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const res = await request('PUT', `/api/leads/${testData.flow1.lead.leadId}`, updateData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log('线索状态已更新为: 跟进中');
  });

  // Step 4: 第二次跟踪 - 上门拜访
  await testStep('1.4 线索跟踪 - 上门拜访确认需求', async () => {
    const followUpData = {
      follow_type: 'visit',
      content: '上门拜访完成。现场勘察120间客房，确认门锁型号适配。客户确认采购120套智能门锁，要求带蓝牙+密码功能。价格基本接受，要求提供正式报价。',
      next_follow_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      next_follow_plan: '发送正式报价单'
    };

    const res = await request('POST', `/api/leads/${testData.flow1.lead.leadId}/follow-up`, followUpData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log('跟踪记录已添加: 上门拜访');
  });

  // Step 5: 获取/创建产品
  await testStep('1.5 确认产品信息', async () => {
    const listRes = await request('GET', '/api/products?pageSize=100', null, testData.token);
    if (listRes.data.success && listRes.data.data.list && listRes.data.data.list.length > 0) {
      testData.flow1.product = listRes.data.data.list[0];
      log(`使用现有产品: ${testData.flow1.product.product_name}`);
    } else {
      const productData = {
        product_code: `LOCK-BT-${timestamp}`,
        product_name: '智能蓝牙密码门锁 Pro',
        category_id: 1,
        unit_price: 1999,
        description: '支持蓝牙、密码、刷卡三种开锁方式，适用于酒店客房'
      };
      const res = await request('POST', '/api/products', productData, testData.token);
      if (!res.data.success) throw new Error(res.data.message);
      testData.flow1.product = res.data.data;
      log(`产品创建成功: ${productData.product_name}`);
    }
  });

  // Step 6: 创建报价单
  await testStep('1.6 创建报价单', async () => {
    const quotationData = {
      customer_id: testData.flow1.customer.id,
      quotation_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '杭州西湖酒店智能门锁采购报价 - 120套',
      items: [
        {
          product_id: testData.flow1.product.product_id,
          quantity: 120,
          unit_price: 1680
        }
      ]
    };

    const res = await request('POST', '/api/quotations', quotationData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow1.quotation = res.data.data;
    log(`报价单创建成功: ${testData.flow1.quotation.quotation_no}, 金额: ¥${120 * 1680}`);
  });

  // Step 7: 创建合同
  await testStep('1.7 创建销售合同', async () => {
    const contractData = {
      contract_title: `杭州西湖酒店智能门锁采购合同`,
      customer_id: testData.flow1.customer.id,
      contract_amount: 120 * 1680,
      signed_date: new Date().toISOString().split('T')[0],
      delivery_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_terms: '首付50%，验收后付清尾款',
      delivery_terms: '送货上门，含安装调试',
      warranty_terms: '整机保修2年',
      source_quotation_id: testData.flow1.quotation.quotationId,
      items: [
        {
          product_id: testData.flow1.product.product_id,
          quantity: 120,
          unit_price: 1680
        }
      ]
    };

    const res = await request('POST', '/api/contracts', contractData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow1.contract = res.data.data;
    log(`合同创建成功: ${testData.flow1.contract.contract_no}, 金额: ¥${contractData.contract_amount}`);
  });

  // Step 8: 收取首付款
  await testStep('1.8 收取首付款（50%）', async () => {
    const paymentData = {
      contract_id: testData.flow1.contract.contractId,
      customer_id: testData.flow1.customer.id,
      payment_amount: 120 * 1680 * 0.5,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      payment_stage: '首付款',
      notes: '合同首付款50%'
    };

    const res = await request('POST', '/api/payments', paymentData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow1.payment = res.data.data;
    log(`首付款收取成功: ${testData.flow1.payment.payment_no}, 金额: ¥${paymentData.payment_amount}`);
  });

  // Step 9: 创建发货单
  await testStep('1.9 创建发货单', async () => {
    const shipmentData = {
      shipment_title: '杭州西湖酒店智能门锁发货',
      contract_id: testData.flow1.contract.contractId,
      shipping_address: '浙江省杭州市西湖区西湖大道100号',
      contact_person: '王经理',
      contact_phone: '13800001001',
      planned_ship_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '请提前联系客户确认收货时间',
      items: [
        {
          product_id: testData.flow1.product.product_id,
          this_shipment_quantity: 120,
          unit_price: 1680
        }
      ]
    };

    const res = await request('POST', '/api/shipments', shipmentData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow1.shipment = res.data.data;
    log(`发货单创建成功: ${testData.flow1.shipment.shipment_no}`);
  });

  // Step 10: 更新发货状态
  await testStep('1.10 更新发货状态 - 已发货', async () => {
    const res = await request('PUT', `/api/shipments/${testData.flow1.shipment.shipmentId}`, {
      status: 'shipped',
      actual_ship_date: new Date().toISOString().split('T')[0],
      tracking_number: `SF${Date.now()}`
    }, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log('发货状态已更新为: shipped');
  });

  // Step 11: 收取尾款
  await testStep('1.11 收取尾款（50%）', async () => {
    const paymentData = {
      contract_id: testData.flow1.contract.contractId,
      customer_id: testData.flow1.customer.id,
      payment_amount: 120 * 1680 * 0.5,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      payment_stage: '尾款',
      notes: '验收完成，收取尾款'
    };

    const res = await request('POST', '/api/payments', paymentData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log(`尾款收取成功: 金额: ¥${paymentData.payment_amount}`);
  });

  // Step 12: 开具发票
  await testStep('1.12 开具增值税发票', async () => {
    const invoiceData = {
      contract_id: testData.flow1.contract.contractId,
      customer_id: testData.flow1.customer.id,
      invoice_type: 'vat_special',
      invoice_amount: 120 * 1680,
      invoice_date: new Date().toISOString().split('T')[0],
      invoice_title: '杭州西湖酒店管理有限公司',
      tax_number: '91330106MA2EXAMPLE',
      notes: '全额开票'
    };

    const res = await request('POST', '/api/invoices', invoiceData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow1.invoice = res.data.data;
    log(`发票开具成功: ${testData.flow1.invoice.invoice_no}, 金额: ¥${invoiceData.invoice_amount}`);
  });

  // Step 13: 更新线索状态为已转化
  await testStep('1.13 更新线索状态 - 已转化', async () => {
    const res = await request('PUT', `/api/leads/${testData.flow1.lead.leadId}`, {
      status: 3 // 已转化
    }, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log('线索状态已更新为: 已转化');
  });

  log('========== 流程1完成: 新客户首次成交流程 ==========', 'success');
  return true;
}

// ==================== 流程2: 大客户多次跟进流程 ====================
async function runFlow2() {
  log('========== 流程2: 大客户多次跟进流程（需要多轮谈判）==========', 'info');
  log('业务流程: 线索创建(自动创建客户) → 4次跟进 → 报价 → 合同 → 分批发货 → 分期收款 → 发票', 'info');

  const timestamp = Date.now();

  // Step 1: 创建线索（自动创建客户）
  await testStep('2.1 创建销售线索 - 大客户（自动创建客户）', async () => {
    const leadData = {
      customer_name: `万豪国际酒店集团_${timestamp}`,
      contact_person: '李总监',
      contact_phone: '13900002001',
      contact_email: 'li@marriott-demo.com',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      address: '陆家嘴金融中心888号',
      room_count: 500,
      source: 'referral',
      priority: 'urgent',
      notes: '连锁酒店集团，计划为旗下3家酒店共500间客房更换智能门锁系统，预算约100万'
    };

    const res = await request('POST', '/api/leads', leadData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow2.lead = res.data.data;
    testData.flow2.customer = res.data.data.customer;

    log(`线索创建成功: ${testData.flow2.lead.leadId}, 线索编号: ${testData.flow2.lead.leadNo}`);
    log(`客户自动创建: ${testData.flow2.customer.id}, 客户编号: ${testData.flow2.customer.customerNo}`);
  });

  // Step 2-5: 多次跟进
  const followUps = [
    {
      follow_type: 'phone',
      content: '首次电话，了解到客户是万豪集团区域采购负责人，负责华东区3家酒店的设备采购。对智能门锁有明确需求，但需要总部审批。',
    },
    {
      follow_type: 'meeting',
      content: '总部会议演示，展示了产品功能和案例。客户对蓝牙功能很满意，但对价格有顾虑，要求提供批量采购优惠方案。',
    },
    {
      follow_type: 'visit',
      content: '现场勘察3家酒店，确认500间客房门锁规格。客户提出需要定制化软件对接需求，需额外开发费用。',
    },
    {
      follow_type: 'phone',
      content: '价格谈判，最终确定单价1500元/套，总金额75万。客户要求付款方式为3-3-4（30%预付、30%发货、40%验收）',
    }
  ];

  for (let i = 0; i < followUps.length; i++) {
    await testStep(`2.${i + 2} 线索跟踪 - 第${i + 1}次跟进`, async () => {
      const res = await request('POST', `/api/leads/${testData.flow2.lead.leadId}/follow-up`, followUps[i], testData.token);
      if (!res.data.success) throw new Error(res.data.message);
      log(`跟踪记录已添加: ${followUps[i].follow_type}`);
      await delay(100);
    });
  }

  // Step 6: 更新预计金额
  await testStep('2.6 更新线索预计金额', async () => {
    const res = await request('PUT', `/api/leads/${testData.flow2.lead.leadId}`, {
      status: 2,
      estimatedAmount: 750000,
      expectedSignDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log('线索金额更新为: ¥750,000');
  });

  // Step 7: 获取产品
  await testStep('2.7 确认产品信息', async () => {
    const productRes = await request('GET', '/api/products?pageSize=100', null, testData.token);
    if (productRes.data.success && productRes.data.data.list.length > 0) {
      testData.flow2.products = productRes.data.data.list.slice(0, 1);
      log(`使用现有产品: ${testData.flow2.products[0].product_name}`);
    }
  });

  // Step 8: 创建报价单
  await testStep('2.8 创建批量采购报价单', async () => {
    const quotationData = {
      customer_id: testData.flow2.customer.id,
      quotation_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '万豪集团华东区3家酒店智能门锁批量采购报价 - 500套',
      items: [
        {
          product_id: testData.flow2.products[0].product_id,
          quantity: 500,
          unit_price: 1500
        }
      ]
    };

    const res = await request('POST', '/api/quotations', quotationData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow2.quotation = res.data.data;
    log(`报价单创建成功: ${testData.flow2.quotation.quotation_no}, 金额: ¥750,000`);
  });

  // Step 9: 创建合同
  await testStep('2.9 创建批量采购合同', async () => {
    const contractData = {
      contract_title: '万豪集团华东区智能门锁采购合同',
      customer_id: testData.flow2.customer.id,
      contract_amount: 750000,
      signed_date: new Date().toISOString().split('T')[0],
      delivery_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_terms: '30%预付、30%发货、40%验收',
      delivery_terms: '分三批发货至三家酒店，含安装调试',
      warranty_terms: '整机保修3年，终身维护',
      items: [
        {
          product_id: testData.flow2.products[0].product_id,
          quantity: 500,
          unit_price: 1500
        }
      ]
    };

    const res = await request('POST', '/api/contracts', contractData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow2.contract = res.data.data;
    log(`合同创建成功: ${testData.flow2.contract.contract_no}, 金额: ¥750,000`);
  });

  // Step 10: 收取预付款30%
  await testStep('2.10 收取预付款（30%）', async () => {
    const paymentData = {
      contract_id: testData.flow2.contract.contractId,
      customer_id: testData.flow2.customer.id,
      payment_amount: 225000,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      payment_stage: '预付款',
      notes: '合同预付款30%'
    };

    const res = await request('POST', '/api/payments', paymentData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    testData.flow2.payments.push(res.data.data);
    log(`预付款收取成功: ¥225,000`);
  });

  // Step 11-13: 分三批发货
  const shipmentPlans = [
    { hotel: '上海浦东万豪', quantity: 200, address: '上海市浦东新区陆家嘴888号' },
    { hotel: '杭州西湖万豪', quantity: 150, address: '浙江省杭州市西湖区湖滨路100号' },
    { hotel: '南京新街口万豪', quantity: 150, address: '江苏省南京市秦淮区新街口88号' }
  ];

  for (let i = 0; i < shipmentPlans.length; i++) {
    await testStep(`2.${11 + i} 创建发货单 - ${shipmentPlans[i].hotel}`, async () => {
      const shipmentData = {
        shipment_title: `${shipmentPlans[i].hotel}智能门锁发货`,
        contract_id: testData.flow2.contract.contractId,
        shipping_address: shipmentPlans[i].address,
        contact_person: '李总监',
        contact_phone: '13900002001',
        planned_ship_date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [
          {
            product_id: testData.flow2.products[0].product_id,
            this_shipment_quantity: shipmentPlans[i].quantity,
            unit_price: 1500
          }
        ]
      };

      const res = await request('POST', '/api/shipments', shipmentData, testData.token);
      if (!res.data.success) throw new Error(res.data.message);
      testData.flow2.shipments.push(res.data.data);
      log(`发货单创建成功: ${res.data.data.shipment_no}, 数量: ${shipmentPlans[i].quantity}套`);
      await delay(100);
    });
  }

  // Step 14: 收取发货款30%
  await testStep('2.14 收取发货款（30%）', async () => {
    const paymentData = {
      contract_id: testData.flow2.contract.contractId,
      customer_id: testData.flow2.customer.id,
      payment_amount: 225000,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      payment_stage: '发货款',
      notes: '全部发货完成，收取发货款30%'
    };

    const res = await request('POST', '/api/payments', paymentData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    testData.flow2.payments.push(res.data.data);
    log(`发货款收取成功: ¥225,000`);
  });

  // Step 15: 收取验收款40%
  await testStep('2.15 收取验收款（40%）', async () => {
    const paymentData = {
      contract_id: testData.flow2.contract.contractId,
      customer_id: testData.flow2.customer.id,
      payment_amount: 300000,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      payment_stage: '验收款',
      notes: '全部安装验收完成，收取尾款40%'
    };

    const res = await request('POST', '/api/payments', paymentData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    testData.flow2.payments.push(res.data.data);
    log(`验收款收取成功: ¥300,000`);
  });

  // Step 16-17: 开具发票
  await testStep('2.16 开具发票 - 第一批', async () => {
    const invoiceData = {
      contract_id: testData.flow2.contract.contractId,
      customer_id: testData.flow2.customer.id,
      invoice_type: 'vat_special',
      invoice_amount: 450000,
      invoice_date: new Date().toISOString().split('T')[0],
      invoice_title: '万豪国际酒店管理（上海）有限公司',
      tax_number: '91310115MA1EXAMPLE',
      notes: '第一批开票'
    };

    const res = await request('POST', '/api/invoices', invoiceData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    testData.flow2.invoices.push(res.data.data);
    log(`发票开具成功: ¥450,000`);
  });

  await testStep('2.17 开具发票 - 第二批', async () => {
    const invoiceData = {
      contract_id: testData.flow2.contract.contractId,
      customer_id: testData.flow2.customer.id,
      invoice_type: 'vat_special',
      invoice_amount: 300000,
      invoice_date: new Date().toISOString().split('T')[0],
      invoice_title: '万豪国际酒店管理（上海）有限公司',
      tax_number: '91310115MA1EXAMPLE',
      notes: '第二批开票（尾款）'
    };

    const res = await request('POST', '/api/invoices', invoiceData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    testData.flow2.invoices.push(res.data.data);
    log(`发票开具成功: ¥300,000`);
  });

  // Step 18: 更新线索状态为已转化
  await testStep('2.18 更新线索状态 - 已转化', async () => {
    const res = await request('PUT', `/api/leads/${testData.flow2.lead.leadId}`, {
      status: 3 // 已转化
    }, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log('线索状态已更新为: 已转化');
  });

  log('========== 流程2完成: 大客户多次跟进流程 ==========', 'success');
  return true;
}

// ==================== 流程3: 老客户复购流程 ====================
async function runFlow3() {
  log('========== 流程3: 老客户复购流程（基于老客户创建新线索）==========', 'info');
  log('业务流程: 创建复购线索(关联老客户) → 报价 → 合同 → 收款 → 发货 → 发票', 'info');

  const timestamp = Date.now();

  // 使用流程1的客户进行复购
  if (!testData.flow1.customer) {
    log('流程3需要流程1的客户数据，跳过', 'warn');
    return false;
  }

  // Step 1: 为老客户创建新的复购线索
  await testStep('3.1 创建复购线索（关联老客户）', async () => {
    const leadData = {
      customer_name: testData.flow1.customer.customerName,  // 使用老客户名称
      contact_person: '王经理',
      contact_phone: '13800001001',
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      address: '西湖大道100号',
      room_count: 30,
      source: 'existing_customer',  // 来源：老客户复购
      priority: 'high',
      notes: `老客户复购 - 新增楼层30间客房需要配备智能门锁（原客户ID: ${testData.flow1.customer.id}）`
    };

    const res = await request('POST', '/api/leads', leadData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow3.lead = res.data.data;
    testData.flow3.customer = res.data.data.customer;  // 复购会创建新客户记录，或可以复用

    log(`复购线索创建成功: ${testData.flow3.lead.leadId}, 线索编号: ${testData.flow3.lead.leadNo}`);
    log(`关联客户: ${testData.flow3.customer.customerNo}`);
  });

  // Step 2: 添加跟踪记录
  await testStep('3.2 线索跟踪 - 复购需求确认', async () => {
    const followUpData = {
      follow_type: 'phone',
      content: '老客户来电，新增楼层装修完成，需要采购30套同款智能门锁。客户对之前的产品和服务非常满意，希望尽快安排。给予老客户优惠价1580元/套。',
    };

    const res = await request('POST', `/api/leads/${testData.flow3.lead.leadId}/follow-up`, followUpData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log('跟踪记录已添加: 复购需求确认');
  });

  // Step 3: 获取产品
  await testStep('3.3 确认产品信息', async () => {
    const productRes = await request('GET', '/api/products?pageSize=100', null, testData.token);
    if (productRes.data.success && productRes.data.data.list.length > 0) {
      testData.flow3.product = productRes.data.data.list[0];
      log(`使用现有产品: ${testData.flow3.product.product_name}`);
    }
  });

  // Step 4: 创建报价单
  await testStep('3.4 创建复购报价单', async () => {
    const quotationData = {
      customer_id: testData.flow3.customer.id,
      quotation_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '老客户复购 - 新增楼层30间客房',
      items: [
        {
          product_id: testData.flow3.product.product_id,
          quantity: 30,
          unit_price: 1580  // 老客户优惠价
        }
      ]
    };

    const res = await request('POST', '/api/quotations', quotationData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow3.quotation = res.data.data;
    log(`复购报价单创建成功: ${testData.flow3.quotation.quotation_no}, 金额: ¥${30 * 1580}`);
  });

  // Step 5: 创建合同
  await testStep('3.5 创建复购合同', async () => {
    const contractData = {
      contract_title: '杭州西湖酒店智能门锁复购合同',
      customer_id: testData.flow3.customer.id,
      contract_amount: 30 * 1580,
      signed_date: new Date().toISOString().split('T')[0],
      delivery_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_terms: '全款预付',
      delivery_terms: '送货上门，含安装',
      warranty_terms: '整机保修2年',
      items: [
        {
          product_id: testData.flow3.product.product_id,
          quantity: 30,
          unit_price: 1580
        }
      ]
    };

    const res = await request('POST', '/api/contracts', contractData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow3.contract = res.data.data;
    log(`复购合同创建成功: ${testData.flow3.contract.contract_no}, 金额: ¥${30 * 1580}`);
  });

  // Step 6: 收取全款
  await testStep('3.6 收取全款', async () => {
    const paymentData = {
      contract_id: testData.flow3.contract.contractId,
      customer_id: testData.flow3.customer.id,
      payment_amount: 30 * 1580,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      payment_stage: '全款',
      notes: '老客户复购全款支付'
    };

    const res = await request('POST', '/api/payments', paymentData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow3.payment = res.data.data;
    log(`全款收取成功: ¥${30 * 1580}`);
  });

  // Step 7: 创建发货单
  await testStep('3.7 创建发货单', async () => {
    const shipmentData = {
      shipment_title: '杭州西湖酒店复购发货',
      contract_id: testData.flow3.contract.contractId,
      shipping_address: '浙江省杭州市西湖区西湖大道100号',
      contact_person: '王经理',
      contact_phone: '13800001001',
      planned_ship_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          product_id: testData.flow3.product.product_id,
          this_shipment_quantity: 30,
          unit_price: 1580
        }
      ]
    };

    const res = await request('POST', '/api/shipments', shipmentData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow3.shipment = res.data.data;
    log(`发货单创建成功: ${testData.flow3.shipment.shipment_no}`);
  });

  // Step 8: 开具发票
  await testStep('3.8 开具发票', async () => {
    const invoiceData = {
      contract_id: testData.flow3.contract.contractId,
      customer_id: testData.flow3.customer.id,
      invoice_type: 'vat_special',
      invoice_amount: 30 * 1580,
      invoice_date: new Date().toISOString().split('T')[0],
      invoice_title: '杭州西湖酒店管理有限公司',
      tax_number: '91330106MA2EXAMPLE',
      notes: '复购发票'
    };

    const res = await request('POST', '/api/invoices', invoiceData, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    testData.flow3.invoice = res.data.data;
    log(`发票开具成功: ${testData.flow3.invoice.invoice_no}`);
  });

  // Step 9: 更新线索状态为已转化
  await testStep('3.9 更新线索状态 - 已转化', async () => {
    const res = await request('PUT', `/api/leads/${testData.flow3.lead.leadId}`, {
      status: 3 // 已转化
    }, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log('线索状态已更新为: 已转化');
  });

  log('========== 流程3完成: 老客户复购流程 ==========', 'success');
  return true;
}

// ==================== 统计报表验证 ====================
async function verifyReports() {
  log('========== 验证统计报表数据 ==========', 'info');

  await testStep('报表验证 - 线索列表', async () => {
    const res = await request('GET', '/api/leads?pageSize=100', null, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log(`线索总数: ${res.data.data.total}`);
  });

  await testStep('报表验证 - 客户列表', async () => {
    const res = await request('GET', '/api/customers?pageSize=100', null, testData.token);
    if (!res.data.success) throw new Error(res.data.message);
    log(`客户总数: ${res.data.data.pagination.total}`);
  });

  await testStep('报表验证 - 合同列表', async () => {
    const res = await request('GET', '/api/contracts?pageSize=100', null, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    const contracts = res.data.data.list;
    const totalAmount = contracts.reduce((sum, c) => sum + parseFloat(c.contract_amount || 0), 0);
    log(`合同总数: ${res.data.data.pagination.total}, 合同总金额: ¥${totalAmount.toLocaleString()}`);
  });

  await testStep('报表验证 - 收款列表', async () => {
    const res = await request('GET', '/api/payments?pageSize=100', null, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    const payments = res.data.data.list;
    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.payment_amount || 0), 0);
    log(`收款记录数: ${res.data.data.pagination.total}, 收款总金额: ¥${totalAmount.toLocaleString()}`);
  });

  await testStep('报表验证 - 发票列表', async () => {
    const res = await request('GET', '/api/invoices?pageSize=100', null, testData.token);
    if (!res.data.success) throw new Error(res.data.message);

    const invoices = res.data.data.list;
    const totalAmount = invoices.reduce((sum, i) => sum + parseFloat(i.invoice_amount || 0), 0);
    log(`发票总数: ${res.data.data.pagination.total}, 开票总金额: ¥${totalAmount.toLocaleString()}`);
  });

  log('========== 报表验证完成 ==========', 'success');
}

// ==================== 主测试入口 ====================
async function runAllFlows() {
  console.log('\n');
  log('╔══════════════════════════════════════════════════════════════╗', 'info');
  log('║     艾居来CRM 完整业务流程端到端测试                          ║', 'info');
  log('║                                                              ║', 'info');
  log('║  业务规则:                                                    ║', 'info');
  log('║  1. 创建线索时自动创建对应的客户                              ║', 'info');
  log('║  2. 老客户复购也需要先创建新线索                              ║', 'info');
  log('╚══════════════════════════════════════════════════════════════╝', 'info');
  console.log('\n');

  const startTime = Date.now();
  const results = {
    login: false,
    flow1: false,
    flow2: false,
    flow3: false,
    reports: false
  };

  try {
    // 登录
    await testStep('系统登录', async () => {
      const res = await request('POST', '/api/auth/login', {
        username: 'admin',
        password: '123456'
      });

      if (!res.data.success) throw new Error(res.data.message);

      testData.token = res.data.data.token;
      testData.user = res.data.data.user;
      log(`登录成功: ${testData.user.username} (${testData.user.name})`);
      results.login = true;
    });

    // 运行流程1
    try {
      results.flow1 = await runFlow1();
    } catch (error) {
      log(`流程1执行失败: ${error.message}`, 'error');
      console.error(error);
    }

    console.log('\n');

    // 运行流程2
    try {
      results.flow2 = await runFlow2();
    } catch (error) {
      log(`流程2执行失败: ${error.message}`, 'error');
      console.error(error);
    }

    console.log('\n');

    // 运行流程3
    try {
      results.flow3 = await runFlow3();
    } catch (error) {
      log(`流程3执行失败: ${error.message}`, 'error');
      console.error(error);
    }

    console.log('\n');

    // 验证报表
    try {
      await verifyReports();
      results.reports = true;
    } catch (error) {
      log(`报表验证失败: ${error.message}`, 'error');
    }

  } catch (error) {
    log(`测试执行失败: ${error.message}`, 'error');
    console.error(error);
  }

  // 输出测试结果汇总
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n');
  log('╔══════════════════════════════════════════════════════════════╗', 'info');
  log('║                      测试结果汇总                             ║', 'info');
  log('╠══════════════════════════════════════════════════════════════╣', 'info');
  log(`║  系统登录:          ${results.login ? '✓ 通过' : '✗ 失败'}                                  ║`, results.login ? 'success' : 'error');
  log(`║  流程1(新客户成交): ${results.flow1 ? '✓ 通过' : '✗ 失败'}                                  ║`, results.flow1 ? 'success' : 'error');
  log(`║  流程2(大客户跟进): ${results.flow2 ? '✓ 通过' : '✗ 失败'}                                  ║`, results.flow2 ? 'success' : 'error');
  log(`║  流程3(老客户复购): ${results.flow3 ? '✓ 通过' : '✗ 失败'}                                  ║`, results.flow3 ? 'success' : 'error');
  log(`║  统计报表验证:      ${results.reports ? '✓ 通过' : '✗ 失败'}                                  ║`, results.reports ? 'success' : 'error');
  log('╠══════════════════════════════════════════════════════════════╣', 'info');

  const passCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  const passRate = ((passCount / totalCount) * 100).toFixed(1);

  log(`║  通过率: ${passCount}/${totalCount} (${passRate}%)      执行时间: ${duration}秒               ║`, passRate === '100.0' ? 'success' : 'warn');
  log('╚══════════════════════════════════════════════════════════════╝', 'info');

  // 保存测试数据供调试
  const reportPath = path.join(__dirname, '../../FULL_FLOW_TEST_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    duration: `${duration}s`,
    results,
    businessRules: [
      '线索创建时自动创建对应客户',
      '老客户复购也需要先创建新线索',
      '所有业务单据都可以追溯到线索'
    ],
    testData: {
      flow1: {
        lead: testData.flow1.lead,
        customer: testData.flow1.customer,
        quotation: testData.flow1.quotation,
        contract: testData.flow1.contract,
        shipment: testData.flow1.shipment,
        invoice: testData.flow1.invoice
      },
      flow2: {
        lead: testData.flow2.lead,
        customer: testData.flow2.customer,
        quotation: testData.flow2.quotation,
        contract: testData.flow2.contract,
        shipmentsCount: testData.flow2.shipments.length,
        paymentsCount: testData.flow2.payments.length,
        invoicesCount: testData.flow2.invoices.length
      },
      flow3: {
        lead: testData.flow3.lead,
        customer: testData.flow3.customer,
        quotation: testData.flow3.quotation,
        contract: testData.flow3.contract,
        shipment: testData.flow3.shipment,
        invoice: testData.flow3.invoice
      }
    }
  }, null, 2));

  log(`\n测试报告已保存至: ${reportPath}`, 'info');

  process.exit(passRate === '100.0' ? 0 : 1);
}

// 执行测试
runAllFlows();
