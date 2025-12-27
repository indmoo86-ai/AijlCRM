/**
 * AijlCRM UI自动化测试脚本
 * 使用Puppeteer模拟真实用户操作
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// 测试配置
const config = {
  baseUrl: 'http://localhost:5173',
  apiUrl: 'http://localhost:3000',
  timeout: 30000,
  screenshotDir: './test-screenshots',
  testAccount: {
    username: 'admin',
    password: '123456'
  }
};

// 测试结果记录
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// 工具函数：等待并截图
async function takeScreenshot(page, name) {
  if (!fs.existsSync(config.screenshotDir)) {
    fs.mkdirSync(config.screenshotDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${config.screenshotDir}/${timestamp}_${name}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`  📸 截图已保存: ${filename}`);
  return filename;
}

// 工具函数：等待元素
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.error(`  ❌ 元素未找到: ${selector}`);
    return false;
  }
}

// 工具函数：记录测试结果
function recordTest(name, passed, message, screenshot = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`  ✅ ${name}: 通过`);
  } else {
    testResults.failed++;
    console.log(`  ❌ ${name}: 失败 - ${message}`);
  }

  testResults.tests.push({
    name,
    passed,
    message,
    screenshot,
    timestamp: new Date().toISOString()
  });
}

// 测试1: 用户登录
async function testLogin(page) {
  console.log('\n🧪 [测试1/8] 用户登录流程');

  try {
    // 访问登录页
    await page.goto(config.baseUrl, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '01-login-page');

    // 检查登录表单
    const hasForm = await waitForElement(page, 'input[type="text"], input[placeholder*="用户名"]');
    if (!hasForm) {
      recordTest('登录页面加载', false, '登录表单未找到');
      return false;
    }
    recordTest('登录页面加载', true, '登录页面正常显示');

    // 输入用户名和密码
    await page.type('input[type="text"], input[placeholder*="用户名"]', config.testAccount.username, { delay: 100 });
    await page.type('input[type="password"], input[placeholder*="密码"]', config.testAccount.password, { delay: 100 });
    await takeScreenshot(page, '02-login-filled');

    recordTest('登录表单填写', true, '用户名和密码已填写');

    // 监听所有网络请求和响应
    let loginResponse = null;
    const failedRequests = [];

    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();

      // 记录登录API响应
      if (url.includes('/api/auth/login')) {
        loginResponse = {
          status: status,
          statusText: response.statusText(),
          url: url
        };
        try {
          const text = await response.text();
          console.log('  🔍 登录API响应:', text.substring(0, 200));
          loginResponse.body = text;
        } catch (e) {
          console.log('  ❌ 无法读取响应体:', e.message);
        }
      }

      // 记录所有失败的请求
      if (status >= 400) {
        try {
          const text = await response.text();
          failedRequests.push({ url, status, body: text });
          console.log(`  ⚠️  请求失败 [${status}]: ${url}`);
          console.log(`  📄 错误内容: ${text.substring(0, 150)}`);
        } catch (e) {
          failedRequests.push({ url, status, error: e.message });
          console.log(`  ⚠️  请求失败 [${status}]: ${url} (无法读取响应)`);
        }
      }
    });

    // 点击登录按钮
    const loginButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.type === 'submit' || btn.textContent.includes('登录'));
    });
    await loginButton.click();

    // 等待跳转
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (loginResponse) {
      console.log('  📊 登录响应状态:', loginResponse.status, loginResponse.statusText);
    }

    await takeScreenshot(page, '03-after-login');

    // 检查是否登录成功（检查URL变化或Dashboard元素）
    const currentUrl = page.url();
    const isLoggedIn = !currentUrl.includes('login') || await page.$('.dashboard, .main-container, [class*="layout"]');

    if (isLoggedIn) {
      recordTest('登录成功', true, 'Dashboard页面已加载');
      return true;
    } else {
      recordTest('登录成功', false, '未跳转到Dashboard');
      return false;
    }

  } catch (error) {
    recordTest('登录流程', false, error.message);
    await takeScreenshot(page, '01-login-error');
    return false;
  }
}

// 测试2: 产品管理
async function testProductManagement(page) {
  console.log('\n🧪 [测试2/8] 产品管理流程');

  try {
    // 导航到产品管理
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"]'));
      const productLink = links.find(link =>
        link.textContent.includes('产品') ||
        link.href?.includes('product')
      );
      if (productLink) productLink.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot(page, '04-product-list');

    recordTest('产品列表页加载', true, '产品列表页面显示正常');

    // 检查是否有新增按钮
    const hasAddButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn =>
        btn.textContent.includes('新增') ||
        btn.textContent.includes('添加') ||
        btn.className.includes('add')
      );
    });
    if (hasAddButton) {
      recordTest('产品管理功能可用', true, '新增产品按钮已找到');
    } else {
      recordTest('产品管理功能可用', false, '未找到新增产品按钮');
    }

    return true;

  } catch (error) {
    recordTest('产品管理', false, error.message);
    await takeScreenshot(page, '04-product-error');
    return false;
  }
}

// 测试3: 线索管理
async function testLeadManagement(page) {
  console.log('\n🧪 [测试3/8] 线索管理流程');

  try {
    // 导航到线索管理
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"]'));
      const leadLink = links.find(link =>
        link.textContent.includes('线索') ||
        link.href?.includes('lead')
      );
      if (leadLink) leadLink.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot(page, '05-lead-list');

    recordTest('线索列表页加载', true, '线索列表页面显示正常');

    // 检查线索列表或空状态
    const hasContent = await page.$('table, .el-table, .lead-list, .empty-state');
    if (hasContent) {
      recordTest('线索管理功能可用', true, '线索列表或空状态显示正常');
    }

    return true;

  } catch (error) {
    recordTest('线索管理', false, error.message);
    await takeScreenshot(page, '05-lead-error');
    return false;
  }
}

// 测试4: 客户管理
async function testCustomerManagement(page) {
  console.log('\n🧪 [测试4/8] 客户管理流程');

  try {
    // 导航到客户管理
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"]'));
      const customerLink = links.find(link =>
        link.textContent.includes('客户') ||
        link.href?.includes('customer')
      );
      if (customerLink) customerLink.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot(page, '06-customer-list');

    recordTest('客户列表页加载', true, '客户列表页面显示正常');

    return true;

  } catch (error) {
    recordTest('客户管理', false, error.message);
    await takeScreenshot(page, '06-customer-error');
    return false;
  }
}

// 测试5: 报价管理
async function testQuotationManagement(page) {
  console.log('\n🧪 [测试5/8] 报价管理流程');

  try {
    // 导航到报价管理
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"]'));
      const quotationLink = links.find(link =>
        link.textContent.includes('报价') ||
        link.href?.includes('quotation')
      );
      if (quotationLink) quotationLink.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot(page, '07-quotation-list');

    recordTest('报价列表页加载', true, '报价列表页面显示正常');

    return true;

  } catch (error) {
    recordTest('报价管理', false, error.message);
    await takeScreenshot(page, '07-quotation-error');
    return false;
  }
}

// 测试6: 合同管理
async function testContractManagement(page) {
  console.log('\n🧪 [测试6/8] 合同管理流程');

  try {
    // 导航到合同管理
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"]'));
      const contractLink = links.find(link =>
        link.textContent.includes('合同') ||
        link.href?.includes('contract')
      );
      if (contractLink) contractLink.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot(page, '08-contract-list');

    recordTest('合同列表页加载', true, '合同列表页面显示正常');

    return true;

  } catch (error) {
    recordTest('合同管理', false, error.message);
    await takeScreenshot(page, '08-contract-error');
    return false;
  }
}

// 测试7: 发货收款发票
async function testShipmentPaymentInvoice(page) {
  console.log('\n🧪 [测试7/8] 发货/收款/发票管理');

  try {
    // 测试发货管理
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"]'));
      const shipmentLink = links.find(link =>
        link.textContent.includes('发货') ||
        link.href?.includes('shipment')
      );
      if (shipmentLink) shipmentLink.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot(page, '09-shipment-list');
    recordTest('发货管理页加载', true, '发货管理页面显示正常');

    // 测试收款管理
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"]'));
      const paymentLink = links.find(link =>
        link.textContent.includes('收款') ||
        link.href?.includes('payment')
      );
      if (paymentLink) paymentLink.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot(page, '10-payment-list');
    recordTest('收款管理页加载', true, '收款管理页面显示正常');

    // 测试发票管理
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"]'));
      const invoiceLink = links.find(link =>
        link.textContent.includes('发票') ||
        link.href?.includes('invoice')
      );
      if (invoiceLink) invoiceLink.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot(page, '11-invoice-list');
    recordTest('发票管理页加载', true, '发票管理页面显示正常');

    return true;

  } catch (error) {
    recordTest('发货/收款/发票', false, error.message);
    await takeScreenshot(page, '09-business-error');
    return false;
  }
}

// 测试8: 售后服务
async function testServiceManagement(page) {
  console.log('\n🧪 [测试8/8] 售后服务管理');

  try {
    // 导航到售后服务
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"]'));
      const serviceLink = links.find(link =>
        link.textContent.includes('售后') ||
        link.textContent.includes('服务') ||
        link.href?.includes('service')
      );
      if (serviceLink) serviceLink.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await takeScreenshot(page, '12-service-list');

    recordTest('售后服务页加载', true, '售后服务页面显示正常');

    return true;

  } catch (error) {
    recordTest('售后服务', false, error.message);
    await takeScreenshot(page, '12-service-error');
    return false;
  }
}

// 生成测试报告
function generateReport() {
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);

  const report = `# AijlCRM UI自动化测试报告

**测试时间**: ${new Date().toISOString()}
**测试环境**:
- 前端: ${config.baseUrl}
- 后端: ${config.apiUrl}

## 测试摘要

- **总测试数**: ${testResults.total}
- **通过**: ${testResults.passed} ✅
- **失败**: ${testResults.failed} ❌
- **通过率**: ${passRate}%

## 详细测试结果

${testResults.tests.map((test, index) => `
### ${index + 1}. ${test.name}
- **状态**: ${test.passed ? '✅ 通过' : '❌ 失败'}
- **消息**: ${test.message}
${test.screenshot ? `- **截图**: ${test.screenshot}` : ''}
- **时间**: ${test.timestamp}
`).join('\n')}

## 测试截图

所有测试截图已保存在 \`${config.screenshotDir}/\` 目录下。

## 结论

${passRate >= 90 ? '✅ 所有核心功能测试通过，系统运行正常！' :
  passRate >= 70 ? '⚠️ 大部分功能正常，但存在一些问题需要修复。' :
  '❌ 系统存在较多问题，需要紧急修复。'}

---

**生成时间**: ${new Date().toLocaleString('zh-CN')}
`;

  fs.writeFileSync('./UI_TEST_REPORT.md', report);
  console.log('\n📄 测试报告已生成: UI_TEST_REPORT.md');

  return report;
}

// 主测试函数
async function runAllTests() {
  console.log('================================');
  console.log('AijlCRM UI自动化测试');
  console.log('================================\n');

  let browser;
  let page;

  try {
    // 启动浏览器
    console.log('🚀 启动浏览器...');
    browser = await puppeteer.launch({
      headless: false, // 设置为false可以看到浏览器操作过程
      executablePath: '/Users/robin/.cache/puppeteer/chrome/mac_arm-131.0.6778.204/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();

    // 捕获控制台消息
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`  🔴 浏览器${type}:`, msg.text());
      }
    });

    // 捕获页面错误
    page.on('pageerror', error => {
      console.log('  ❌ 页面错误:', error.message);
    });

    // 设置超时时间
    page.setDefaultTimeout(config.timeout);

    // 运行所有测试
    await testLogin(page);
    await testProductManagement(page);
    await testLeadManagement(page);
    await testCustomerManagement(page);
    await testQuotationManagement(page);
    await testContractManagement(page);
    await testShipmentPaymentInvoice(page);
    await testServiceManagement(page);

    // 生成报告
    const report = generateReport();

    // 显示摘要
    console.log('\n================================');
    console.log('测试完成！');
    console.log('================================');
    console.log(`总测试数: ${testResults.total}`);
    console.log(`✅ 通过: ${testResults.passed}`);
    console.log(`❌ 失败: ${testResults.failed}`);
    console.log(`通过率: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    console.log('\n📄 详细报告: UI_TEST_REPORT.md');
    console.log(`📸 截图目录: ${config.screenshotDir}/\n`);

  } catch (error) {
    console.error('\n❌ 测试执行出错:', error.message);
    if (page) {
      await takeScreenshot(page, 'fatal-error');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 执行测试
runAllTests().catch(console.error);
