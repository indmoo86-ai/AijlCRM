#!/usr/bin/env node

/**
 * CRM系统完整用户故事测试
 * 模拟真实用户操作流程
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试配置
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'admin',
  password: '123456'
};

// 测试问题记录
const issues = [];

// 添加问题
function addIssue(story, severity, description, screenshot = null) {
  issues.push({
    story,
    severity, // 'high', 'medium', 'low'
    description,
    screenshot,
    timestamp: new Date().toISOString()
  });
  console.log(`   ⚠️  发现问题 [${severity}]: ${description}`);
}

// 等待并点击元素
async function clickElement(page, selector, description) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    console.log(`   ✓ ${description}`);
    await page.waitForTimeout(500);
    return true;
  } catch (error) {
    addIssue('通用', 'high', `无法点击: ${description} (选择器: ${selector})`);
    return false;
  }
}

// 填写输入框
async function fillInput(page, selector, value, description) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.fill(selector, value);
    console.log(`   ✓ ${description}: ${value}`);
    await page.waitForTimeout(300);
    return true;
  } catch (error) {
    addIssue('通用', 'high', `无法填写: ${description} (选择器: ${selector})`);
    return false;
  }
}

// 截图
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(__dirname, 'screenshots', `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

// 用户故事1: 登录
async function testLogin(page) {
  console.log('\n📋 用户故事1: 用户登录');
  console.log('场景: 销售人员打开系统并登录\n');

  try {
    // 访问登录页
    await page.goto(BASE_URL);
    console.log('   ✓ 访问登录页面');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 检查是否已经登录（可能在工作台）
    const url = page.url();
    if (url.includes('/dashboard')) {
      console.log('   ✓ 已登录，跳过登录测试');
      return true;
    }

    // 查找登录表单
    const usernameInput = await page.locator('input[placeholder*="用户名"], input[type="text"]').first();
    const passwordInput = await page.locator('input[placeholder*="密码"], input[type="password"]').first();
    const loginButton = await page.locator('button:has-text("登录"), button[type="submit"]').first();

    // 填写用户名
    await usernameInput.fill(TEST_USER.username);
    console.log(`   ✓ 输入用户名: ${TEST_USER.username}`);

    // 填写密码
    await passwordInput.fill(TEST_USER.password);
    console.log('   ✓ 输入密码');

    // 截图
    await takeScreenshot(page, 'login-before-submit');

    // 点击登录
    await loginButton.click();
    console.log('   ✓ 点击登录按钮');

    // 等待跳转
    await page.waitForTimeout(2000);

    // 验证登录成功
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/workbench')) {
      console.log('   ✅ 登录成功，进入工作台');
      await takeScreenshot(page, 'login-success');
      return true;
    } else {
      addIssue('登录', 'high', `登录后未跳转到工作台，当前URL: ${currentUrl}`);
      await takeScreenshot(page, 'login-failed');
      return false;
    }

  } catch (error) {
    addIssue('登录', 'high', `登录测试失败: ${error.message}`);
    await takeScreenshot(page, 'login-error');
    return false;
  }
}

// 用户故事2: 创建线索
async function testCreateLead(page) {
  console.log('\n📋 用户故事2: 创建线索');
  console.log('场景: 销售人员录入新的潜在客户线索\n');

  try {
    // 点击线索管理菜单
    const leadMenuClicked = await clickElement(
      page,
      'a:has-text("线索管理"), .el-menu-item:has-text("线索")',
      '点击线索管理菜单'
    );
    if (!leadMenuClicked) return false;

    await page.waitForTimeout(1000);

    // 点击新建按钮
    const createButtonClicked = await clickElement(
      page,
      'button:has-text("新建"), button:has-text("添加")',
      '点击新建线索按钮'
    );
    if (!createButtonClicked) return false;

    await page.waitForTimeout(500);

    // 填写线索信息
    const companyName = `测试酒店_${Date.now()}`;
    await fillInput(
      page,
      'input[placeholder*="公司"], input[placeholder*="企业"]',
      companyName,
      '填写公司名称'
    );

    await fillInput(
      page,
      'input[placeholder*="联系人"], input[placeholder*="姓名"]',
      '张经理',
      '填写联系人'
    );

    await fillInput(
      page,
      'input[placeholder*="手机"], input[placeholder*="电话"]',
      '13800138000',
      '填写联系电话'
    );

    // 截图
    await takeScreenshot(page, 'lead-form-filled');

    // 保存
    const saveClicked = await clickElement(
      page,
      'button:has-text("保存"), button:has-text("确定")',
      '点击保存按钮'
    );
    if (!saveClicked) return false;

    await page.waitForTimeout(2000);

    // 验证列表中是否出现
    const leadExists = await page.locator(`text=${companyName}`).count() > 0;
    if (leadExists) {
      console.log('   ✅ 线索创建成功');
      await takeScreenshot(page, 'lead-created');
      return true;
    } else {
      addIssue('线索创建', 'high', '线索创建后未在列表中显示');
      return false;
    }

  } catch (error) {
    addIssue('线索创建', 'high', `线索创建测试失败: ${error.message}`);
    await takeScreenshot(page, 'lead-create-error');
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始CRM系统用户故事测试');
  console.log('=================================\n');

  const browser = await chromium.launch({
    headless: false, // 显示浏览器以便观察
    slowMo: 500 // 放慢操作速度
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 创建截图目录
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // 执行测试
  const tests = [
    { name: '用户登录', fn: testLogin },
    { name: '创建线索', fn: testCreateLead },
    // 更多测试将逐步添加
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn(page);
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    await page.waitForTimeout(1000);
  }

  // 生成测试报告
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(50));
  console.log(`总测试数: ${results.total}`);
  console.log(`通过: ${results.passed} ✅`);
  console.log(`失败: ${results.failed} ❌`);
  console.log(`通过率: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (issues.length > 0) {
    console.log('\n⚠️  发现的问题:');
    issues.forEach((issue, index) => {
      console.log(`\n${index + 1}. [${issue.severity.toUpperCase()}] ${issue.story}`);
      console.log(`   ${issue.description}`);
      if (issue.screenshot) {
        console.log(`   截图: ${issue.screenshot}`);
      }
    });

    // 保存问题到文件
    const issuesReport = {
      timestamp: new Date().toISOString(),
      results,
      issues
    };
    fs.writeFileSync(
      path.join(__dirname, 'test-issues.json'),
      JSON.stringify(issuesReport, null, 2)
    );
    console.log('\n📝 问题报告已保存到: test-issues.json');
  } else {
    console.log('\n✅ 所有测试通过，未发现问题！');
  }

  await browser.close();
}

// 运行测试
runTests().catch(error => {
  console.error('测试执行出错:', error);
  process.exit(1);
});
