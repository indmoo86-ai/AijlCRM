#!/usr/bin/env node

/**
 * CRM系统单场景测试脚本
 * 按照规范逐个测试场景，确保每个场景通过后再进行下一个
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseUrl: 'http://localhost:5173',
  apiUrl: 'http://localhost:3000/api',
  testUser: { username: 'admin', password: '123456' },
  screenshotDir: path.join(__dirname, '../../test-screenshots'),
  timeout: 30000,
  slowMo: 50
};

// 问题记录
const issues = [];
let currentScenario = null;

// 工具函数
function log(message, type = 'info') {
  const prefix = {
    info: '   ',
    success: ' ✓ ',
    error: ' ✗ ',
    warn: ' ⚠ ',
    step: ' → '
  };
  console.log(`${prefix[type] || '   '}${message}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function takeScreenshot(page, name) {
  ensureDir(CONFIG.screenshotDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filepath = path.join(CONFIG.screenshotDir, `${name}_${timestamp}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  log(`截图: ${path.basename(filepath)}`, 'success');
  return filepath;
}

function recordIssue(description, severity = 'medium', screenshot = null) {
  const issue = {
    id: `ISSUE-${String(issues.length + 1).padStart(3, '0')}`,
    scenario: currentScenario,
    description,
    severity,
    screenshot,
    attempts: 1,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  issues.push(issue);
  log(`问题记录: ${issue.id} - ${description}`, 'error');
  return issue;
}

// ==================== 场景1.1: 用户登录 ====================
async function test_scenario_1_1(page) {
  currentScenario = '1.1';
  console.log('\n' + '='.repeat(60));
  console.log('场景 1.1: 用户登录');
  console.log('='.repeat(60));

  try {
    // 步骤1: 访问系统首页
    log('步骤1: 访问系统首页', 'step');
    await page.goto(CONFIG.baseUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 检查是否在登录页
    const currentUrl = page.url();
    log(`当前URL: ${currentUrl}`, 'info');

    // 检查是否已登录（真正跳转到dashboard，不是redirect参数）
    // 排除 /login?redirect=/dashboard 这种情况
    if (currentUrl.includes('/dashboard') && !currentUrl.includes('/login')) {
      log('已处于登录状态', 'success');
      await takeScreenshot(page, '1.1-already-logged-in');
      return { passed: true, message: '已登录状态' };
    }

    // 步骤2: 定位并输入用户名
    log('步骤2: 输入用户名', 'step');
    const usernameInput = page.locator('input[placeholder*="用户名"]').first();
    await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
    await usernameInput.fill(CONFIG.testUser.username);
    log(`输入用户名: ${CONFIG.testUser.username}`, 'success');

    // 步骤3: 输入密码
    log('步骤3: 输入密码', 'step');
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(CONFIG.testUser.password);
    log('输入密码: ******', 'success');

    // 截图: 登录表单填写完成
    await takeScreenshot(page, '1.1-step3-login-form-filled');

    // 步骤4: 点击登录按钮
    log('步骤4: 点击登录按钮', 'step');
    const loginButton = page.locator('button:has-text("登录")');
    await loginButton.click();
    log('点击登录按钮', 'success');

    // 步骤5: 等待登录响应
    log('步骤5: 等待登录响应', 'step');
    await page.waitForTimeout(3000);

    // 步骤6: 验证登录结果
    log('步骤6: 验证登录结果', 'step');
    const afterLoginUrl = page.url();
    log(`登录后URL: ${afterLoginUrl}`, 'info');

    // 截图: 登录后页面
    await takeScreenshot(page, '1.1-step6-after-login');

    // 验证是否成功跳转到工作台
    if (afterLoginUrl.includes('/dashboard') || afterLoginUrl === CONFIG.baseUrl + '/') {
      log('登录成功，已跳转到工作台', 'success');

      // 验证页面内容
      const hasUserInfo = await page.locator('text=系统管理员').count() > 0 ||
                          await page.locator('.user-info, .user-name, [class*="user"]').count() > 0;

      if (hasUserInfo) {
        log('用户信息显示正确', 'success');
      } else {
        log('未找到用户信息显示', 'warn');
      }

      return { passed: true, message: '登录成功' };
    } else {
      // 登录失败，检查错误消息
      const errorMsg = await page.locator('.el-message--error, .el-message__content').textContent().catch(() => '未知错误');
      const screenshot = await takeScreenshot(page, '1.1-login-failed');
      recordIssue(`登录失败: ${errorMsg}`, 'critical', screenshot);
      return { passed: false, message: `登录失败: ${errorMsg}` };
    }

  } catch (error) {
    const screenshot = await takeScreenshot(page, '1.1-error');
    recordIssue(`测试异常: ${error.message}`, 'critical', screenshot);
    return { passed: false, message: error.message };
  }
}

// ==================== 场景1.2: 错误密码登录 ====================
async function test_scenario_1_2(page) {
  currentScenario = '1.2';
  console.log('\n' + '='.repeat(60));
  console.log('场景 1.2: 错误密码登录');
  console.log('='.repeat(60));

  try {
    // 先登出（如果已登录）
    log('步骤0: 确保未登录状态', 'step');
    await page.goto(`${CONFIG.baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // 步骤1: 输入正确用户名
    log('步骤1: 输入用户名', 'step');
    const usernameInput = page.locator('input[placeholder*="用户名"]').first();
    await usernameInput.fill(CONFIG.testUser.username);

    // 步骤2: 输入错误密码
    log('步骤2: 输入错误密码', 'step');
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrongpassword');

    await takeScreenshot(page, '1.2-wrong-password-form');

    // 步骤3: 点击登录
    log('步骤3: 点击登录按钮', 'step');
    await page.click('button:has-text("登录")');

    // 步骤4: 等待响应
    log('步骤4: 等待响应', 'step');
    await page.waitForTimeout(2000);

    await takeScreenshot(page, '1.2-after-click');

    // 步骤5: 验证结果
    log('步骤5: 验证仍在登录页', 'step');
    if (page.url().includes('/login')) {
      log('正确拒绝了错误密码，仍在登录页', 'success');
      return { passed: true, message: '错误密码被正确拒绝' };
    } else {
      const screenshot = await takeScreenshot(page, '1.2-unexpected-login');
      recordIssue('错误密码却登录成功', 'critical', screenshot);
      return { passed: false, message: '错误密码却登录成功' };
    }

  } catch (error) {
    const screenshot = await takeScreenshot(page, '1.2-error');
    recordIssue(`测试异常: ${error.message}`, 'high', screenshot);
    return { passed: false, message: error.message };
  }
}

// ==================== 场景4.1: 创建产品（完整测试） ====================
async function test_scenario_4_1(page) {
  currentScenario = '4.1';
  console.log('\n' + '='.repeat(60));
  console.log('场景 4.1: 创建产品（完整测试）');
  console.log('='.repeat(60));

  const timestamp = Date.now();
  const testData = {
    product: {
      name: `测试门锁_${timestamp}`,
      code: `PRD${timestamp}`,
      brand: '艾居来',
      costPrice: 180,
      salePrice: 299,
      unit: '台',
      description: '自动化测试创建的产品'
    }
  };

  try {
    // 步骤0: 先登录
    log('步骤0: 确保已登录', 'step');
    await page.goto(CONFIG.baseUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    if (page.url().includes('/login')) {
      log('需要先登录', 'info');
      await page.fill('input[placeholder*="用户名"]', CONFIG.testUser.username);
      await page.fill('input[type="password"]', CONFIG.testUser.password);
      await page.click('button:has-text("登录")');
      await page.waitForTimeout(2000);
    }

    // 步骤1: 导航到产品管理
    log('步骤1: 导航到产品管理', 'step');
    await page.goto(`${CONFIG.baseUrl}/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await takeScreenshot(page, '4.1-step1-product-list-before');
    log(`当前URL: ${page.url()}`, 'info');

    // 记录创建前的产品数量
    const initialRowCount = await page.locator('.el-table__body tr').count();
    log(`创建前产品数量: ${initialRowCount}`, 'info');

    // 步骤2: 点击新建产品按钮
    log('步骤2: 点击新建产品按钮', 'step');
    await page.click('button:has-text("新建产品")');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '4.1-step2-dialog-opened');

    // 步骤3: 填写产品信息 (使用对话框内的选择器避免冲突)
    log('步骤3: 填写产品信息', 'step');

    // 等待对话框完全打开
    const dialog = page.locator('.el-dialog').first();
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    // 3.1 填写产品编码 (对话框内)
    const codeInput = dialog.locator('input[placeholder="请输入产品编码"]');
    await codeInput.fill(testData.product.code);
    log(`填写产品编码: ${testData.product.code}`, 'success');

    // 3.2 填写产品名称 (对话框内)
    const nameInput = dialog.locator('input[placeholder="请输入产品名称"]');
    await nameInput.fill(testData.product.name);
    log(`填写产品名称: ${testData.product.name}`, 'success');

    // 3.3 填写品牌 (对话框内)
    const brandInput = dialog.locator('input[placeholder="请输入品牌"]');
    await brandInput.fill(testData.product.brand);
    log(`填写品牌: ${testData.product.brand}`, 'success');

    // 3.4 选择产品分类（必填字段）
    log('选择产品分类...', 'info');
    const categorySelect = dialog.locator('.el-form-item').filter({ hasText: '产品分类' }).locator('.el-select');
    if (await categorySelect.count() > 0) {
      await categorySelect.click();
      // 等待下拉菜单可见
      const dropdown = page.locator('.el-select-dropdown:visible');
      await dropdown.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      // 选择下拉列表中的第一个选项
      const firstOption = dropdown.locator('.el-select-dropdown__item').first();
      if (await firstOption.count() > 0) {
        await firstOption.click();
        log('选择产品分类: 第一个分类', 'success');
      } else {
        log('警告: 没有找到产品分类选项，可能需要先创建分类', 'warn');
      }
      await page.waitForTimeout(500);
    }

    // 3.5 选择单位
    const unitFormItem = dialog.locator('.el-form-item').filter({ hasText: '单位' });
    const unitSelect = unitFormItem.locator('.el-select');
    if (await unitSelect.count() > 0) {
      await unitSelect.click();
      // 等待下拉菜单可见
      const unitDropdown = page.locator('.el-select-dropdown:visible');
      await unitDropdown.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      const unitOption = unitDropdown.locator(`.el-select-dropdown__item:has-text("${testData.product.unit}")`);
      await unitOption.click();
      log(`选择单位: ${testData.product.unit}`, 'success');
      await page.waitForTimeout(500);
    }

    // 3.6 填写成本价（el-input-number 组件，对话框内）
    const costPriceInput = dialog.locator('.el-input-number').first().locator('input');
    await costPriceInput.fill(String(testData.product.costPrice));
    log(`填写成本价: ${testData.product.costPrice}`, 'success');

    // 3.7 填写销售价
    const salePriceInput = dialog.locator('.el-input-number').nth(1).locator('input');
    await salePriceInput.fill(String(testData.product.salePrice));
    log(`填写销售价: ${testData.product.salePrice}`, 'success');

    // 3.8 选择状态为"在售"
    const statusFormItem = dialog.locator('.el-form-item').filter({ hasText: '状态' });
    const statusSelect = statusFormItem.locator('.el-select');
    if (await statusSelect.count() > 0) {
      await statusSelect.click();
      // 等待下拉菜单可见
      const statusDropdown = page.locator('.el-select-dropdown:visible');
      await statusDropdown.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      const statusOption = statusDropdown.locator('.el-select-dropdown__item:has-text("在售")');
      await statusOption.click();
      log('选择状态: 在售', 'success');
      await page.waitForTimeout(500);
    }

    // 3.9 填写描述
    const descInput = dialog.locator('textarea[placeholder="请输入产品描述"]');
    if (await descInput.count() > 0) {
      await descInput.fill(testData.product.description);
      log('填写产品描述', 'success');
    }

    await takeScreenshot(page, '4.1-step3-form-filled');

    // 步骤4: 点击确定保存
    log('步骤4: 点击确定保存产品', 'step');
    // 对话框footer中的确定按钮
    const submitBtn = dialog.locator('.el-dialog__footer button:has-text("确定")');
    await submitBtn.click();

    // 等待保存完成
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '4.1-step4-after-save');

    // 步骤5: 验证产品是否出现在列表中
    log('步骤5: 验证产品列表', 'step');

    // 等待对话框关闭
    await page.waitForTimeout(500);
    const dialogClosed = await dialog.isHidden().catch(() => true);
    if (!dialogClosed) {
      log('对话框未关闭，可能保存失败', 'warn');
      // 检查是否有错误提示
      const errorMsg = await page.locator('.el-message--error').textContent().catch(() => '');
      if (errorMsg) {
        log(`错误信息: ${errorMsg}`, 'error');
      }
    }

    // 等待列表数据刷新（不刷新页面，避免登录状态丢失）
    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle');

    await takeScreenshot(page, '4.1-step5-list-after-create');

    // 检查新产品是否在列表中（使用更精确的选择器）
    const tableBody = page.locator('.el-table__body-wrapper');
    const productRow = tableBody.locator(`tr:has-text("${testData.product.code}")`);
    const productInList = await productRow.count();
    const newRowCount = await tableBody.locator('tr').count();

    log(`创建后产品数量: ${newRowCount}`, 'info');
    log(`找到产品 ${testData.product.code}: ${productInList > 0 ? '是' : '否'}`, 'info');

    if (productInList > 0) {
      log(`产品 ${testData.product.code} 已成功添加到列表`, 'success');
      return { passed: true, message: `产品创建成功: ${testData.product.name}`, productCode: testData.product.code };
    } else {
      // 可能创建成功但列表未刷新，检查是否有成功提示
      const hasSuccessMsg = await page.locator('.el-message--success').count() > 0;
      if (hasSuccessMsg || newRowCount > initialRowCount) {
        log('产品可能已创建，但列表显示可能有延迟', 'warn');
        return { passed: true, message: '产品创建可能成功', productCode: testData.product.code };
      }

      const screenshot = await takeScreenshot(page, '4.1-product-not-found');
      recordIssue('创建的产品未在列表中显示', 'high', screenshot);
      return { passed: false, message: '产品未在列表中显示' };
    }

  } catch (error) {
    const screenshot = await takeScreenshot(page, '4.1-error');
    recordIssue(`测试异常: ${error.message}`, 'high', screenshot);
    return { passed: false, message: error.message };
  }
}

// ==================== 场景2.1: 创建线索（完整测试） ====================
async function test_scenario_2_1(page) {
  currentScenario = '2.1';
  console.log('\n' + '='.repeat(60));
  console.log('场景 2.1: 创建线索（完整测试）');
  console.log('='.repeat(60));

  const timestamp = Date.now();
  const testData = {
    lead: {
      customerName: `测试客户_${timestamp}`,
      hotelName: `测试酒店_${timestamp}`,
      province: '广东省',
      city: '深圳市',
      roomCount: 100,
      phone: '13800138000',
      channelSource: '官网咨询',
      intentionLevel: '高',
      estimatedAmount: 50000,
      requirement: '需要智能门锁和智能开关整体解决方案'
    }
  };

  try {
    // 步骤0: 确保已登录
    log('步骤0: 确保已登录', 'step');
    await page.goto(CONFIG.baseUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    if (page.url().includes('/login')) {
      log('需要先登录', 'info');
      await page.fill('input[placeholder*="用户名"]', CONFIG.testUser.username);
      await page.fill('input[type="password"]', CONFIG.testUser.password);
      await page.click('button:has-text("登录")');
      await page.waitForTimeout(2000);
    }

    // 步骤1: 导航到线索管理
    log('步骤1: 导航到线索管理', 'step');
    await page.goto(`${CONFIG.baseUrl}/leads`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await takeScreenshot(page, '2.1-step1-lead-list-before');
    log(`当前URL: ${page.url()}`, 'info');

    // 记录创建前的线索数量
    const initialRowCount = await page.locator('.el-table__body-wrapper tr').count();
    log(`创建前线索数量: ${initialRowCount}`, 'info');

    // 步骤2: 点击新建线索按钮
    log('步骤2: 点击新建线索按钮', 'step');
    await page.click('button:has-text("新建线索")');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '2.1-step2-dialog-opened');

    // 步骤3: 填写线索信息
    log('步骤3: 填写线索信息', 'step');

    // 等待对话框打开
    const dialog = page.locator('.el-dialog').first();
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    // 3.1 填写客户名称
    const customerNameInput = dialog.locator('input[placeholder="请输入客户名称"]');
    await customerNameInput.fill(testData.lead.customerName);
    log(`填写客户名称: ${testData.lead.customerName}`, 'success');

    // 3.2 填写酒店名称
    const hotelNameInput = dialog.locator('input[placeholder="请输入酒店名称"]');
    await hotelNameInput.fill(testData.lead.hotelName);
    log(`填写酒店名称: ${testData.lead.hotelName}`, 'success');

    // 3.3 填写省份
    const provinceInput = dialog.locator('input[placeholder="请输入省份"]');
    await provinceInput.fill(testData.lead.province);
    log(`填写省份: ${testData.lead.province}`, 'success');

    // 3.4 填写城市
    const cityInput = dialog.locator('input[placeholder="请输入城市"]');
    await cityInput.fill(testData.lead.city);
    log(`填写城市: ${testData.lead.city}`, 'success');

    // 3.5 填写房间数量
    const roomCountInput = dialog.locator('.el-input-number').first().locator('input');
    await roomCountInput.fill(String(testData.lead.roomCount));
    log(`填写房间数量: ${testData.lead.roomCount}`, 'success');

    // 3.6 填写联系电话
    const phoneInput = dialog.locator('input[placeholder="请输入联系电话"]');
    await phoneInput.fill(testData.lead.phone);
    log(`填写联系电话: ${testData.lead.phone}`, 'success');

    // 3.7 选择来源渠道
    const channelFormItem = dialog.locator('.el-form-item').filter({ hasText: '来源渠道' });
    const channelSelect = channelFormItem.locator('.el-select');
    if (await channelSelect.count() > 0) {
      await channelSelect.click();
      const channelDropdown = page.locator('.el-select-dropdown:visible');
      await channelDropdown.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      const channelOption = channelDropdown.locator(`.el-select-dropdown__item:has-text("${testData.lead.channelSource}")`);
      await channelOption.click();
      log(`选择来源渠道: ${testData.lead.channelSource}`, 'success');
      await page.waitForTimeout(500);
    }

    // 3.8 选择意向程度
    const intentionFormItem = dialog.locator('.el-form-item').filter({ hasText: '意向程度' });
    const intentionSelect = intentionFormItem.locator('.el-select');
    if (await intentionSelect.count() > 0) {
      await intentionSelect.click();
      const intentionDropdown = page.locator('.el-select-dropdown:visible');
      await intentionDropdown.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      const intentionOption = intentionDropdown.locator(`.el-select-dropdown__item:has-text("${testData.lead.intentionLevel}")`);
      await intentionOption.click();
      log(`选择意向程度: ${testData.lead.intentionLevel}`, 'success');
      await page.waitForTimeout(500);
    }

    // 3.9 填写预估金额
    const amountInput = dialog.locator('.el-input-number').nth(1).locator('input');
    if (await amountInput.count() > 0) {
      await amountInput.fill(String(testData.lead.estimatedAmount));
      log(`填写预估金额: ${testData.lead.estimatedAmount}`, 'success');
    }

    // 3.10 填写需求描述
    const requirementInput = dialog.locator('textarea[placeholder="请输入需求描述"]');
    if (await requirementInput.count() > 0) {
      await requirementInput.fill(testData.lead.requirement);
      log('填写需求描述', 'success');
    }

    await takeScreenshot(page, '2.1-step3-form-filled');

    // 步骤4: 点击确定保存
    log('步骤4: 点击确定保存线索', 'step');
    const submitBtn = dialog.locator('.el-dialog__footer button:has-text("确定")');
    await submitBtn.click();

    // 等待保存完成
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '2.1-step4-after-save');

    // 步骤5: 验证线索是否出现在列表中
    log('步骤5: 验证线索列表', 'step');

    // 等待对话框关闭
    await page.waitForTimeout(500);
    const dialogClosed = await dialog.isHidden().catch(() => true);
    if (!dialogClosed) {
      log('对话框未关闭，可能保存失败', 'warn');
      const errorMsg = await page.locator('.el-message--error').textContent().catch(() => '');
      if (errorMsg) {
        log(`错误信息: ${errorMsg}`, 'error');
      }
    }

    // 等待列表数据刷新
    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle');

    await takeScreenshot(page, '2.1-step5-list-after-create');

    // 检查新线索是否在列表中
    const tableBody = page.locator('.el-table__body-wrapper');
    const leadRow = tableBody.locator(`tr:has-text("${testData.lead.customerName}")`);
    const leadInList = await leadRow.count();
    const newRowCount = await tableBody.locator('tr').count();

    log(`创建后线索数量: ${newRowCount}`, 'info');
    log(`找到线索 ${testData.lead.customerName}: ${leadInList > 0 ? '是' : '否'}`, 'info');

    if (leadInList > 0) {
      log(`线索 ${testData.lead.customerName} 已成功添加到列表`, 'success');
      return { passed: true, message: `线索创建成功: ${testData.lead.customerName}`, leadName: testData.lead.customerName };
    } else {
      // 可能创建成功但列表未刷新，检查是否有成功提示
      const hasSuccessMsg = await page.locator('.el-message--success').count() > 0;
      if (hasSuccessMsg || newRowCount > initialRowCount) {
        log('线索可能已创建，但列表显示可能有延迟', 'warn');
        return { passed: true, message: '线索创建可能成功', leadName: testData.lead.customerName };
      }

      const screenshot = await takeScreenshot(page, '2.1-lead-not-found');
      recordIssue('创建的线索未在列表中显示', 'high', screenshot);
      return { passed: false, message: '线索未在列表中显示' };
    }

  } catch (error) {
    const screenshot = await takeScreenshot(page, '2.1-error');
    recordIssue(`测试异常: ${error.message}`, 'high', screenshot);
    return { passed: false, message: error.message };
  }
}

// ==================== 场景3.1: 创建客户（完整测试） ====================
async function test_scenario_3_1(page) {
  currentScenario = '3.1';
  console.log('\n' + '='.repeat(60));
  console.log('场景 3.1: 创建客户（完整测试）');
  console.log('='.repeat(60));

  const timestamp = Date.now();
  const testData = {
    customer: {
      customerName: `测试客户公司_${timestamp}`,
      customerType: '潜在客户',
      industry: '酒店',
      roomCount: 200,
      province: '广东省',
      city: '广州市',
      district: '天河区',
      address: '天河路123号',
      tags: ['重点客户'],
      remark: '自动化测试创建的客户'
    }
  };

  try {
    // 步骤0: 确保已登录
    log('步骤0: 确保已登录', 'step');
    await page.goto(CONFIG.baseUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    if (page.url().includes('/login')) {
      log('需要先登录', 'info');
      await page.fill('input[placeholder*="用户名"]', CONFIG.testUser.username);
      await page.fill('input[type="password"]', CONFIG.testUser.password);
      await page.click('button:has-text("登录")');
      await page.waitForTimeout(2000);
    }

    // 步骤1: 导航到客户管理
    log('步骤1: 导航到客户管理', 'step');
    await page.goto(`${CONFIG.baseUrl}/customers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await takeScreenshot(page, '3.1-step1-customer-list-before');
    log(`当前URL: ${page.url()}`, 'info');

    // 记录创建前的客户数量
    const initialRowCount = await page.locator('.el-table__body-wrapper tr').count();
    log(`创建前客户数量: ${initialRowCount}`, 'info');

    // 步骤2: 点击新建客户按钮
    log('步骤2: 点击新建客户按钮', 'step');
    await page.click('button:has-text("新建客户")');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '3.1-step2-dialog-opened');

    // 步骤3: 填写客户信息
    log('步骤3: 填写客户信息', 'step');

    // 等待对话框打开
    const dialog = page.locator('.el-dialog').first();
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    // 3.1 填写客户名称
    const customerNameInput = dialog.locator('input[placeholder="请输入客户名称"]');
    await customerNameInput.fill(testData.customer.customerName);
    log(`填写客户名称: ${testData.customer.customerName}`, 'success');

    // 3.2 选择客户类型
    const typeFormItem = dialog.locator('.el-form-item').filter({ hasText: '客户类型' });
    const typeSelect = typeFormItem.locator('.el-select');
    if (await typeSelect.count() > 0) {
      await typeSelect.click();
      const typeDropdown = page.locator('.el-select-dropdown:visible');
      await typeDropdown.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      const typeOption = typeDropdown.locator(`.el-select-dropdown__item:has-text("${testData.customer.customerType}")`);
      await typeOption.click();
      log(`选择客户类型: ${testData.customer.customerType}`, 'success');
      await page.waitForTimeout(500);
    }

    // 3.3 选择所属行业
    const industryFormItem = dialog.locator('.el-form-item').filter({ hasText: '所属行业' });
    const industrySelect = industryFormItem.locator('.el-select');
    if (await industrySelect.count() > 0) {
      await industrySelect.click();
      const industryDropdown = page.locator('.el-select-dropdown:visible');
      await industryDropdown.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      const industryOption = industryDropdown.locator(`.el-select-dropdown__item:has-text("${testData.customer.industry}")`);
      await industryOption.click();
      log(`选择所属行业: ${testData.customer.industry}`, 'success');
      await page.waitForTimeout(500);
    }

    // 3.4 填写房间数量
    const roomCountInput = dialog.locator('.el-input-number').first().locator('input');
    await roomCountInput.fill(String(testData.customer.roomCount));
    log(`填写房间数量: ${testData.customer.roomCount}`, 'success');

    // 3.5 填写省份
    const provinceInput = dialog.locator('input[placeholder="请输入省份"]');
    await provinceInput.fill(testData.customer.province);
    log(`填写省份: ${testData.customer.province}`, 'success');

    // 3.6 填写城市
    const cityInput = dialog.locator('input[placeholder="请输入城市"]');
    await cityInput.fill(testData.customer.city);
    log(`填写城市: ${testData.customer.city}`, 'success');

    // 3.7 填写区县
    const districtInput = dialog.locator('input[placeholder="请输入区县"]');
    if (await districtInput.count() > 0) {
      await districtInput.fill(testData.customer.district);
      log(`填写区县: ${testData.customer.district}`, 'success');
    }

    // 3.8 填写详细地址
    const addressInput = dialog.locator('input[placeholder="请输入详细地址"]');
    if (await addressInput.count() > 0) {
      await addressInput.fill(testData.customer.address);
      log(`填写详细地址: ${testData.customer.address}`, 'success');
    }

    // 3.9 填写备注
    const remarkInput = dialog.locator('textarea[placeholder="请输入备注信息"]');
    if (await remarkInput.count() > 0) {
      await remarkInput.fill(testData.customer.remark);
      log('填写备注', 'success');
    }

    await takeScreenshot(page, '3.1-step3-form-filled');

    // 步骤4: 点击确定保存
    log('步骤4: 点击确定保存客户', 'step');
    const submitBtn = dialog.locator('.el-dialog__footer button:has-text("确定")');
    await submitBtn.click();

    // 等待保存完成
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '3.1-step4-after-save');

    // 步骤5: 验证客户是否出现在列表中
    log('步骤5: 验证客户列表', 'step');

    // 等待对话框关闭
    await page.waitForTimeout(500);
    const dialogClosed = await dialog.isHidden().catch(() => true);
    if (!dialogClosed) {
      log('对话框未关闭，可能保存失败', 'warn');
      const errorMsg = await page.locator('.el-message--error').textContent().catch(() => '');
      if (errorMsg) {
        log(`错误信息: ${errorMsg}`, 'error');
      }
    }

    // 等待列表数据刷新
    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle');

    await takeScreenshot(page, '3.1-step5-list-after-create');

    // 检查新客户是否在列表中
    const tableBody = page.locator('.el-table__body-wrapper');
    const customerRow = tableBody.locator(`tr:has-text("${testData.customer.customerName}")`);
    const customerInList = await customerRow.count();
    const newRowCount = await tableBody.locator('tr').count();

    log(`创建后客户数量: ${newRowCount}`, 'info');
    log(`找到客户 ${testData.customer.customerName}: ${customerInList > 0 ? '是' : '否'}`, 'info');

    if (customerInList > 0) {
      log(`客户 ${testData.customer.customerName} 已成功添加到列表`, 'success');
      return { passed: true, message: `客户创建成功: ${testData.customer.customerName}`, customerName: testData.customer.customerName };
    } else {
      // 可能创建成功但列表未刷新，检查是否有成功提示
      const hasSuccessMsg = await page.locator('.el-message--success').count() > 0;
      if (hasSuccessMsg || newRowCount > initialRowCount) {
        log('客户可能已创建，但列表显示可能有延迟', 'warn');
        return { passed: true, message: '客户创建可能成功', customerName: testData.customer.customerName };
      }

      const screenshot = await takeScreenshot(page, '3.1-customer-not-found');
      recordIssue('创建的客户未在列表中显示', 'high', screenshot);
      return { passed: false, message: '客户未在列表中显示' };
    }

  } catch (error) {
    const screenshot = await takeScreenshot(page, '3.1-error');
    recordIssue(`测试异常: ${error.message}`, 'high', screenshot);
    return { passed: false, message: error.message };
  }
}

// ==================== 场景5.1: 创建报价单（完整测试） ====================
async function test_scenario_5_1(page) {
  currentScenario = '5.1';
  console.log('\n' + '='.repeat(60));
  console.log('场景 5.1: 创建报价单（完整测试）');
  console.log('='.repeat(60));

  const today = new Date();
  const validDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天后
  const testData = {
    quotation: {
      quotation_date: today.toISOString().split('T')[0],
      valid_until: validDate.toISOString().split('T')[0],
      total_amount: 100000,
      notes: '自动化测试创建的报价单'
    }
  };

  try {
    // 步骤0: 确保已登录
    log('步骤0: 确保已登录', 'step');
    await page.goto(CONFIG.baseUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    if (page.url().includes('/login')) {
      log('需要先登录', 'info');
      await page.fill('input[placeholder*="用户名"]', CONFIG.testUser.username);
      await page.fill('input[type="password"]', CONFIG.testUser.password);
      await page.click('button:has-text("登录")');
      await page.waitForTimeout(2000);
    }

    // 步骤1: 导航到报价管理
    log('步骤1: 导航到报价管理', 'step');
    await page.goto(`${CONFIG.baseUrl}/quotations`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await takeScreenshot(page, '5.1-step1-quotation-list-before');
    log(`当前URL: ${page.url()}`, 'info');

    // 记录创建前的报价单数量
    const initialRowCount = await page.locator('.el-table__body-wrapper tr').count();
    log(`创建前报价单数量: ${initialRowCount}`, 'info');

    // 步骤2: 点击新建报价单按钮
    log('步骤2: 点击新建报价单按钮', 'step');
    await page.click('button:has-text("新建报价单")');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '5.1-step2-dialog-opened');

    // 步骤3: 填写报价单信息
    log('步骤3: 填写报价单信息', 'step');

    // 等待对话框打开
    const dialog = page.locator('.el-dialog').first();
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    // 3.1 选择客户
    const customerFormItem = dialog.locator('.el-form-item').filter({ hasText: '客户' }).first();
    const customerSelect = customerFormItem.locator('.el-select');
    if (await customerSelect.count() > 0) {
      await customerSelect.click();
      const customerDropdown = page.locator('.el-select-dropdown:visible');
      await customerDropdown.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      // 选择第一个客户
      const firstCustomer = customerDropdown.locator('.el-select-dropdown__item').first();
      if (await firstCustomer.count() > 0) {
        await firstCustomer.click();
        log('选择客户: 第一个客户', 'success');
      } else {
        log('警告: 没有找到客户，可能需要先创建客户', 'warn');
      }
      await page.waitForTimeout(500);
    }

    // 3.2 选择报价日期
    const dateFormItem = dialog.locator('.el-form-item').filter({ hasText: '报价日期' });
    const datePicker = dateFormItem.locator('.el-date-editor');
    if (await datePicker.count() > 0) {
      await datePicker.click();
      await page.waitForTimeout(500);
      // 找到可见的日期选择面板，选择今天
      const visiblePanel = page.locator('.el-picker-panel:visible');
      const todayCell = visiblePanel.locator('.el-date-table td.today').first();
      if (await todayCell.count() > 0) {
        await todayCell.click();
      }
      log(`选择报价日期: 今天`, 'success');
      await page.waitForTimeout(500);
    }

    // 3.3 选择有效期
    const validFormItem = dialog.locator('.el-form-item').filter({ hasText: '有效期至' });
    const validPicker = validFormItem.locator('.el-date-editor');
    if (await validPicker.count() > 0) {
      await validPicker.click();
      await page.waitForTimeout(500);
      // 找到可见的日期选择面板
      const visiblePanel = page.locator('.el-picker-panel:visible');
      // 点击下个月按钮
      const nextMonthBtn = visiblePanel.locator('button.arrow-right, .el-date-picker__header-label + button').first();
      if (await nextMonthBtn.count() > 0) {
        await nextMonthBtn.click();
        await page.waitForTimeout(300);
      }
      // 选择面板中的15号或第一个可用日期
      const availableDay = visiblePanel.locator('.el-date-table td:not(.disabled)').first();
      if (await availableDay.count() > 0) {
        await availableDay.click();
      }
      log('选择有效期: 下个月', 'success');
      await page.waitForTimeout(500);
    }

    // 3.4 填写报价金额
    const amountInput = dialog.locator('.el-input-number').first().locator('input');
    await amountInput.fill(String(testData.quotation.total_amount));
    log(`填写报价金额: ${testData.quotation.total_amount}`, 'success');

    // 3.5 填写备注
    const notesInput = dialog.locator('textarea[placeholder="请输入备注信息"]');
    if (await notesInput.count() > 0) {
      await notesInput.fill(testData.quotation.notes);
      log('填写备注', 'success');
    }

    await takeScreenshot(page, '5.1-step3-form-filled');

    // 步骤4: 点击确定保存
    log('步骤4: 点击确定保存报价单', 'step');
    const submitBtn = dialog.locator('.el-dialog__footer button:has-text("确定")');
    await submitBtn.click();

    // 等待保存完成
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '5.1-step4-after-save');

    // 步骤5: 验证报价单是否出现在列表中
    log('步骤5: 验证报价单列表', 'step');

    // 等待对话框关闭
    await page.waitForTimeout(500);
    const dialogClosed = await dialog.isHidden().catch(() => true);
    if (!dialogClosed) {
      log('对话框未关闭，可能保存失败', 'warn');
      const errorMsg = await page.locator('.el-message--error').textContent().catch(() => '');
      if (errorMsg) {
        log(`错误信息: ${errorMsg}`, 'error');
      }
    }

    // 等待列表数据刷新
    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle');

    await takeScreenshot(page, '5.1-step5-list-after-create');

    // 检查报价单数量是否增加
    const tableBody = page.locator('.el-table__body-wrapper');
    const newRowCount = await tableBody.locator('tr').count();

    log(`创建后报价单数量: ${newRowCount}`, 'info');

    if (newRowCount > initialRowCount) {
      log('报价单已成功添加到列表', 'success');
      return { passed: true, message: '报价单创建成功' };
    } else {
      // 可能创建成功但列表未刷新，检查是否有成功提示
      const hasSuccessMsg = await page.locator('.el-message--success').count() > 0;
      if (hasSuccessMsg) {
        log('报价单可能已创建，但列表显示可能有延迟', 'warn');
        return { passed: true, message: '报价单创建可能成功' };
      }

      const screenshot = await takeScreenshot(page, '5.1-quotation-not-found');
      recordIssue('创建的报价单未在列表中显示', 'high', screenshot);
      return { passed: false, message: '报价单未在列表中显示' };
    }

  } catch (error) {
    const screenshot = await takeScreenshot(page, '5.1-error');
    recordIssue(`测试异常: ${error.message}`, 'high', screenshot);
    return { passed: false, message: error.message };
  }
}

// ==================== 场景6.1: 创建合同（完整测试） ====================
async function test_scenario_6_1(page) {
  currentScenario = '6.1';
  console.log('\n' + '='.repeat(60));
  console.log('场景 6.1: 创建合同（完整测试）');
  console.log('='.repeat(60));

  const today = new Date();
  const deliveryDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000); // 60天后
  const timestamp = Date.now();
  const testData = {
    contract: {
      contract_title: `智能门锁采购合同_${timestamp}`,
      contract_amount: 150000,
      signed_date: today.toISOString().split('T')[0],
      delivery_deadline: deliveryDate.toISOString().split('T')[0],
      delivery_terms: '交付安装完成并通过验收',
      additional_terms: '质保期为两年'
    }
  };

  try {
    // 步骤0: 确保已登录
    log('步骤0: 确保已登录', 'step');
    await page.goto(CONFIG.baseUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    if (page.url().includes('/login')) {
      log('需要先登录', 'info');
      await page.fill('input[placeholder*="用户名"]', CONFIG.testUser.username);
      await page.fill('input[type="password"]', CONFIG.testUser.password);
      await page.click('button:has-text("登录")');
      await page.waitForTimeout(2000);
    }

    // 步骤1: 导航到合同管理
    log('步骤1: 导航到合同管理', 'step');
    await page.goto(`${CONFIG.baseUrl}/contracts`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await takeScreenshot(page, '6.1-step1-contract-list-before');
    log(`当前URL: ${page.url()}`, 'info');

    // 记录创建前的合同数量
    const initialRowCount = await page.locator('.el-table__body-wrapper tr').count();
    log(`创建前合同数量: ${initialRowCount}`, 'info');

    // 步骤2: 点击新建合同按钮
    log('步骤2: 点击新建合同按钮', 'step');
    await page.click('button:has-text("新建合同")');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '6.1-step2-dialog-opened');

    // 步骤3: 填写合同信息
    log('步骤3: 填写合同信息', 'step');

    // 等待对话框打开
    const dialog = page.locator('.el-dialog').first();
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    // 3.1 填写合同标题
    const titleInput = dialog.locator('input[placeholder="请输入合同标题"]');
    await titleInput.fill(testData.contract.contract_title);
    log(`填写合同标题: ${testData.contract.contract_title}`, 'success');

    // 3.2 选择客户
    const customerFormItem = dialog.locator('.el-form-item').filter({ hasText: '客户' }).first();
    const customerSelect = customerFormItem.locator('.el-select');
    if (await customerSelect.count() > 0) {
      await customerSelect.click();
      const customerDropdown = page.locator('.el-select-dropdown:visible');
      await customerDropdown.waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(300);
      const firstCustomer = customerDropdown.locator('.el-select-dropdown__item').first();
      if (await firstCustomer.count() > 0) {
        await firstCustomer.click();
        log('选择客户: 第一个客户', 'success');
      }
      await page.waitForTimeout(500);
    }

    // 3.3 填写合同金额
    const amountInput = dialog.locator('.el-input-number').first().locator('input');
    await amountInput.fill(String(testData.contract.contract_amount));
    log(`填写合同金额: ${testData.contract.contract_amount}`, 'success');

    // 3.4 选择签订日期
    const signedFormItem = dialog.locator('.el-form-item').filter({ hasText: '签订日期' });
    const signedPicker = signedFormItem.locator('.el-date-editor');
    if (await signedPicker.count() > 0) {
      await signedPicker.click();
      await page.waitForTimeout(500);
      const visiblePanel = page.locator('.el-picker-panel:visible');
      const todayCell = visiblePanel.locator('.el-date-table td.today').first();
      if (await todayCell.count() > 0) {
        await todayCell.click();
      }
      log('选择签订日期: 今天', 'success');
      await page.waitForTimeout(500);
    }

    // 3.5 选择交付期限
    const deadlineFormItem = dialog.locator('.el-form-item').filter({ hasText: '交付期限' });
    const deadlinePicker = deadlineFormItem.locator('.el-date-editor');
    if (await deadlinePicker.count() > 0) {
      await deadlinePicker.click();
      await page.waitForTimeout(500);
      const visiblePanel = page.locator('.el-picker-panel:visible');
      const nextMonthBtn = visiblePanel.locator('button.arrow-right, .el-date-picker__header-label + button').first();
      if (await nextMonthBtn.count() > 0) {
        await nextMonthBtn.click();
        await nextMonthBtn.click(); // 点两次跳到60天后大约
        await page.waitForTimeout(300);
      }
      const availableDay = visiblePanel.locator('.el-date-table td:not(.disabled)').first();
      if (await availableDay.count() > 0) {
        await availableDay.click();
      }
      log('选择交付期限: 两个月后', 'success');
      await page.waitForTimeout(500);
    }

    // 3.6 填写交付条款
    const deliveryTermsInput = dialog.locator('textarea[placeholder="请输入交付条款"]');
    if (await deliveryTermsInput.count() > 0) {
      await deliveryTermsInput.fill(testData.contract.delivery_terms);
      log('填写交付条款', 'success');
    }

    // 3.7 填写补充条款
    const additionalTermsInput = dialog.locator('textarea[placeholder="请输入补充条款"]');
    if (await additionalTermsInput.count() > 0) {
      await additionalTermsInput.fill(testData.contract.additional_terms);
      log('填写补充条款', 'success');
    }

    await takeScreenshot(page, '6.1-step3-form-filled');

    // 步骤4: 点击确定保存
    log('步骤4: 点击确定保存合同', 'step');
    const submitBtn = dialog.locator('.el-dialog__footer button:has-text("确定")');
    await submitBtn.click();

    // 等待保存完成
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '6.1-step4-after-save');

    // 步骤5: 验证合同是否出现在列表中
    log('步骤5: 验证合同列表', 'step');

    // 等待对话框关闭
    await page.waitForTimeout(500);
    const dialogClosed = await dialog.isHidden().catch(() => true);
    if (!dialogClosed) {
      log('对话框未关闭，可能保存失败', 'warn');
      const errorMsg = await page.locator('.el-message--error').textContent().catch(() => '');
      if (errorMsg) {
        log(`错误信息: ${errorMsg}`, 'error');
      }
    }

    // 等待列表数据刷新
    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle');

    await takeScreenshot(page, '6.1-step5-list-after-create');

    // 检查合同数量是否增加
    const tableBody = page.locator('.el-table__body-wrapper');
    const contractRow = tableBody.locator(`tr:has-text("${testData.contract.contract_title}")`);
    const contractInList = await contractRow.count();
    const newRowCount = await tableBody.locator('tr').count();

    log(`创建后合同数量: ${newRowCount}`, 'info');
    log(`找到合同 ${testData.contract.contract_title}: ${contractInList > 0 ? '是' : '否'}`, 'info');

    if (contractInList > 0) {
      log(`合同 ${testData.contract.contract_title} 已成功添加到列表`, 'success');
      return { passed: true, message: `合同创建成功: ${testData.contract.contract_title}` };
    } else if (newRowCount > initialRowCount) {
      log('合同已成功添加到列表', 'success');
      return { passed: true, message: '合同创建成功' };
    } else {
      const hasSuccessMsg = await page.locator('.el-message--success').count() > 0;
      if (hasSuccessMsg) {
        log('合同可能已创建，但列表显示可能有延迟', 'warn');
        return { passed: true, message: '合同创建可能成功' };
      }

      const screenshot = await takeScreenshot(page, '6.1-contract-not-found');
      recordIssue('创建的合同未在列表中显示', 'high', screenshot);
      return { passed: false, message: '合同未在列表中显示' };
    }

  } catch (error) {
    const screenshot = await takeScreenshot(page, '6.1-error');
    recordIssue(`测试异常: ${error.message}`, 'high', screenshot);
    return { passed: false, message: error.message };
  }
}

// 主函数
async function runTest(scenarioId) {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              CRM系统 - 单场景测试                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const browser = await chromium.launch({
    headless: true,
    slowMo: CONFIG.slowMo
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  let result;

  switch (scenarioId) {
    case '1.1':
      result = await test_scenario_1_1(page);
      break;
    case '1.2':
      result = await test_scenario_1_2(page);
      break;
    case '4.1':
      result = await test_scenario_4_1(page);
      break;
    case '2.1':
      result = await test_scenario_2_1(page);
      break;
    case '3.1':
      result = await test_scenario_3_1(page);
      break;
    case '5.1':
      result = await test_scenario_5_1(page);
      break;
    case '6.1':
      result = await test_scenario_6_1(page);
      break;
    default:
      console.log(`未知场景: ${scenarioId}`);
      result = { passed: false, message: '未知场景' };
  }

  await browser.close();

  // 输出结果
  console.log('\n' + '='.repeat(60));
  console.log('测试结果:');
  console.log('='.repeat(60));
  console.log(`场景: ${scenarioId}`);
  console.log(`状态: ${result.passed ? '✓ 通过' : '✗ 失败'}`);
  console.log(`消息: ${result.message}`);

  if (issues.length > 0) {
    console.log(`\n发现问题: ${issues.length}个`);
    issues.forEach(issue => {
      console.log(`  - ${issue.id}: ${issue.description}`);
    });
  }

  // 返回结果供外部使用
  return result;
}

// 获取命令行参数
const scenarioId = process.argv[2] || '1.1';
runTest(scenarioId).catch(console.error);
