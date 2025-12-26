#!/usr/bin/env node

/**
 * CRM系统完整用户旅程测试 - 模拟真实操作
 * 使用更智能的元素定位策略
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const TEST_USER = { username: 'admin', password: '123456' };
const issues = [];
const testData = {};

// 工具函数
function log(message) {
  console.log(`   ${message}`);
}

function addIssue(story, severity, description) {
  issues.push({ story, severity, description, timestamp: new Date().toISOString() });
  log(`⚠️  [${severity.toUpperCase()}] ${description}`);
}

async function takeScreenshot(page, name) {
  const dir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

async function waitAndClick(page, text, options = {}) {
  try {
    const selector = options.exact
      ? `text="${text}"`
      : `text=${text}`;
    await page.click(selector, { timeout: 5000 });
    log(`✓ 点击: ${text}`);
    await page.waitForTimeout(500);
    return true;
  } catch (error) {
    addIssue(options.story || '通用', 'high', `无法点击"${text}": ${error.message}`);
    await takeScreenshot(page, `error-click-${text.replace(/[^a-zA-Z0-9]/g, '')}`);
    return false;
  }
}

async function fillField(page, placeholder, value, options = {}) {
  try {
    await page.fill(`input[placeholder*="${placeholder}"]`, value);
    log(`✓ 填写${placeholder}: ${value}`);
    await page.waitForTimeout(300);
    return true;
  } catch (error) {
    addIssue(options.story || '通用', 'medium', `无法填写"${placeholder}": ${error.message}`);
    return false;
  }
}

// 测试1: 登录系统
async function test01_Login(page) {
  console.log('\n📋 测试1: 用户登录');
  console.log('=' .repeat(50));

  try {
    await page.goto(BASE_URL);
    log('✓ 访问系统');
    await page.waitForLoadState('networkidle');

    // 检查是否已登录
    if (page.url().includes('/dashboard') || page.url().includes('/')) {
      // 尝试查找登录表单
      const hasLoginForm = await page.locator('input[type="password"]').count() > 0;
      if (!hasLoginForm) {
        log('✓ 已登录，跳过登录步骤');
        return true;
      }
    }

    // 填写登录表单
    await page.fill('input[type="text"]', TEST_USER.username);
    log(`✓ 输入用户名: ${TEST_USER.username}`);

    await page.fill('input[type="password"]', TEST_USER.password);
    log('✓ 输入密码');

    await takeScreenshot(page, 'login-form');

    // 点击登录按钮
    await page.click('button[type="submit"]');
    log('✓ 点击登录');

    // 等待跳转
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes('/dashboard') || url.endsWith('/')) {
      log('✅ 登录成功');
      await takeScreenshot(page, 'login-success');
      return true;
    } else {
      addIssue('登录', 'high', `登录失败，未跳转到工作台: ${url}`);
      await takeScreenshot(page, 'login-failed');
      return false;
    }
  } catch (error) {
    addIssue('登录', 'high', `登录异常: ${error.message}`);
    await takeScreenshot(page, 'login-error');
    return false;
  }
}

// 测试2: 创建线索
async function test02_CreateLead(page) {
  console.log('\n📋 测试2: 创建线索');
  console.log('='.repeat(50));

  try {
    // 方法1: 使用路由导航
    await page.goto(`${BASE_URL}/leads`);
    log('✓ 导航到线索管理页面');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 点击新建按钮
    const hasNewButton = await waitAndClick(page, '新建', { story: '创建线索' });
    if (!hasNewButton) {
      // 尝试其他可能的按钮文本
      await waitAndClick(page, '添加线索', { story: '创建线索' }) ||
      await waitAndClick(page, '创建', { story: '创建线索' });
    }

    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'lead-form');

    // 填写线索信息
    const companyName = `测试酒店_${Date.now()}`;
    testData.leadCompany = companyName;

    await fillField(page, '公司', companyName, { story: '创建线索' });
    await fillField(page, '联系人', '张经理', { story: '创建线索' });
    await fillField(page, '电话', '13800138000', { story: '创建线索' });

    await takeScreenshot(page, 'lead-filled');

    // 保存
    const saved = await waitAndClick(page, '确定', { story: '创建线索' }) ||
                   await waitAndClick(page, '保存', { story: '创建线索' });

    if (!saved) {
      addIssue('创建线索', 'high', '找不到保存按钮');
      return false;
    }

    await page.waitForTimeout(2000);

    // 验证创建成功
    const created = await page.locator(`text=${companyName}`).count() > 0;
    if (created) {
      log('✅ 线索创建成功');
      await takeScreenshot(page, 'lead-created');
      return true;
    } else {
      addIssue('创建线索', 'high', '线索创建后未在列表显示');
      await takeScreenshot(page, 'lead-not-found');
      return false;
    }
  } catch (error) {
    addIssue('创建线索', 'high', `创建线索异常: ${error.message}`);
    await takeScreenshot(page, 'lead-error');
    return false;
  }
}

// 测试3: 线索转客户
async function test03_ConvertToCustomer(page) {
  console.log('\n📋 测试3: 线索转客户');
  console.log('='.repeat(50));

  try {
    // 确保在线索列表页
    await page.goto(`${BASE_URL}/leads`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 找到刚创建的线索并点击
    const companyName = testData.leadCompany;
    if (!companyName) {
      addIssue('线索转客户', 'high', '未找到之前创建的线索');
      return false;
    }

    const leadClicked = await waitAndClick(page, companyName, { story: '线索转客户' });
    if (!leadClicked) {
      addIssue('线索转客户', 'high', '无法点击线索进入详情');
      return false;
    }

    await page.waitForTimeout(1500);
    await takeScreenshot(page, 'lead-detail');

    // 查找并点击"转为客户"按钮
    const converted = await waitAndClick(page, '转为客户', { story: '线索转客户' }) ||
                      await waitAndClick(page, '转客户', { story: '线索转客户' });

    if (!converted) {
      addIssue('线索转客户', 'high', '找不到转客户按钮');
      return false;
    }

    await page.waitForTimeout(1000);

    // 确认转换
    await waitAndClick(page, '确定', { story: '线索转客户' });

    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'lead-converted');

    log('✅ 线索转客户完成');
    return true;
  } catch (error) {
    addIssue('线索转客户', 'high', `线索转客户异常: ${error.message}`);
    await takeScreenshot(page, 'convert-error');
    return false;
  }
}

// 测试4: 创建产品
async function test04_CreateProduct(page) {
  console.log('\n📋 测试4: 创建产品');
  console.log('='.repeat(50));

  try {
    await page.goto(`${BASE_URL}/products`);
    log('✓ 导航到产品管理');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await waitAndClick(page, '新建', { story: '创建产品' });
    await page.waitForTimeout(1000);

    const productName = `智能门锁_${Date.now()}`;
    testData.productName = productName;

    await fillField(page, '产品名称', productName, { story: '创建产品' });
    await fillField(page, '产品编码', `PRD${Date.now()}`, { story: '创建产品' });
    await fillField(page, '销售价', '299', { story: '创建产品' });

    await takeScreenshot(page, 'product-filled');

    await waitAndClick(page, '确定', { story: '创建产品' }) ||
    await waitAndClick(page, '保存', { story: '创建产品' });

    await page.waitForTimeout(2000);

    const created = await page.locator(`text=${productName}`).count() > 0;
    if (created) {
      log('✅ 产品创建成功');
      return true;
    } else {
      addIssue('创建产品', 'high', '产品创建后未显示');
      return false;
    }
  } catch (error) {
    addIssue('创建产品', 'high', `创建产品异常: ${error.message}`);
    return false;
  }
}

// 主测试流程
async function runAllTests() {
  console.log('\n🚀 CRM系统完整用户旅程测试');
  console.log('='.repeat(70));
  console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`前端地址: ${BASE_URL}`);
  console.log('='.repeat(70));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const tests = [
    { name: '用户登录', fn: test01_Login },
    { name: '创建线索', fn: test02_CreateLead },
    { name: '线索转客户', fn: test03_ConvertToCustomer },
    { name: '创建产品', fn: test04_CreateProduct },
  ];

  const results = { total: 0, passed: 0, failed: 0 };

  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn(page);
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      addIssue(test.name, 'high', `测试执行异常: ${error.message}`);
    }
    await page.waitForTimeout(1500);
  }

  // 生成报告
  console.log('\n' + '='.repeat(70));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(70));
  console.log(`总测试: ${results.total}`);
  console.log(`通过: ${results.passed} ✅`);
  console.log(`失败: ${results.failed} ❌`);
  console.log(`通过率: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

  if (issues.length > 0) {
    console.log('⚠️  发现的问题:');
    console.log('='.repeat(70));
    issues.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.severity.toUpperCase()}] ${issue.story}`);
      console.log(`   ${issue.description}`);
    });

    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      results,
      issues,
      testData
    };

    fs.writeFileSync(
      path.join(__dirname, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log('\n📝 详细报告: test-report.json');
  } else {
    console.log('✅ 所有测试通过！');
  }

  console.log('\n💡 提示: 浏览器将在5秒后关闭...');
  await page.waitForTimeout(5000);
  await browser.close();
}

runAllTests().catch(error => {
  console.error('\n❌ 测试执行失败:', error);
  process.exit(1);
});
