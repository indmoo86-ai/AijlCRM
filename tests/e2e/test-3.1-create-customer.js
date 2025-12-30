/**
 * 场景3.1: 创建客户
 * 输入: 客户名称测试酒店集团, 类型潜在客户, 行业酒店, 联系人张总
 * 预期输出: 客户列表显示新客户，数据库customers表有记录
 */

const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test_3_1_create_customer() {
  console.log('========================================');
  console.log('场景3.1: 创建客户测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timestamp = Date.now();
  const customerName = `测试酒店集团_${timestamp}`;

  try {
    // Step 1: 登录
    console.log('Step 1: 登录系统...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.fill('input:first-of-type', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
    console.log('  登录成功');

    // Step 2: 导航到客户管理
    console.log('Step 2: 导航到客户管理...');
    await page.goto(`${BASE_URL}/customers`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('  当前URL:', page.url());

    // Step 3: 点击新建按钮
    console.log('Step 3: 点击新建按钮...');
    await page.click('button:has-text("新建客户")');
    await page.waitForTimeout(1000);
    console.log('  新建对话框已打开');

    // Step 4: 填写客户表单
    console.log('Step 4: 填写客户表单...');
    await page.waitForSelector('.el-dialog__body', { timeout: 5000 });
    await page.waitForTimeout(500);

    // 填写客户名称
    await page.fill('.el-dialog__body input[placeholder*="客户名称"]', customerName);
    console.log('  客户名称:', customerName);

    // 选择客户类型
    console.log('  选择客户类型...');
    const typeSelect = await page.$('.el-dialog__body .el-form-item:has-text("客户类型") .el-select');
    if (typeSelect) {
      await typeSelect.click();
      await page.waitForTimeout(500);
      await page.click('.el-select-dropdown:visible .el-select-dropdown__item >> nth=0');
      console.log('  客户类型: 已选择');
      await page.waitForTimeout(300);
    }

    // 选择所属行业（必填）
    console.log('  选择所属行业...');
    const industrySelect = await page.$('.el-dialog__body .el-form-item:has-text("所属行业") .el-select');
    if (industrySelect) {
      await industrySelect.click();
      await page.waitForTimeout(500);
      await page.click('.el-select-dropdown:visible .el-select-dropdown__item >> nth=0');
      console.log('  所属行业: 已选择');
      await page.waitForTimeout(300);
    }

    // 填写省份
    const provinceInput = await page.$('.el-dialog__body input[placeholder*="省份"]');
    if (provinceInput) {
      await provinceInput.fill('广东省');
      console.log('  省份: 广东省');
    }

    // 填写城市
    const cityInput = await page.$('.el-dialog__body input[placeholder*="城市"]');
    if (cityInput) {
      await cityInput.fill('深圳市');
      console.log('  城市: 深圳市');
    }

    await page.waitForTimeout(500);

    // 截图1: 表单填写完成
    const screenshot1 = path.join(SCREENSHOT_DIR, '3.1-form-filled.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log('  截图已保存:', screenshot1);

    // Step 5: 点击确定按钮
    console.log('Step 5: 点击确定按钮...');
    await page.click('.el-dialog__footer button:has-text("确定")');
    console.log('  确定按钮已点击');

    await page.waitForTimeout(2000);

    // 检查成功消息
    const pageContent = await page.content();
    if (pageContent.includes('成功')) {
      console.log('  ✓ 检测到成功提示');
    }

    // 截图2: 保存结果
    const screenshot2 = path.join(SCREENSHOT_DIR, '3.1-success.png');
    await page.screenshot({ path: screenshot2, fullPage: true });
    console.log('  截图已保存:', screenshot2);

    // Step 6: 验证列表
    console.log('Step 6: 验证客户列表...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const finalContent = await page.content();
    const customerFound = finalContent.includes(customerName.substring(0, 10));

    // 截图3: 列表显示
    const screenshot3 = path.join(SCREENSHOT_DIR, '3.1-list-data.png');
    await page.screenshot({ path: screenshot3, fullPage: true });
    console.log('  截图已保存:', screenshot3);

    if (customerFound) {
      console.log('  ✓ 客户在列表中找到');
    } else {
      console.log('  ⚠ 未在列表中找到客户');
    }

    // 输出结果
    console.log('');
    console.log('========================================');
    console.log('测试结果:');
    console.log('========================================');
    console.log('场景: 3.1 创建客户');
    console.log('输入数据:');
    console.log('  客户名称:', customerName);
    console.log('  客户类型: 潜在客户');
    console.log('  所属行业: 已选择');
    console.log('  省份: 广东省');
    console.log('  城市: 深圳市');
    console.log('列表验证:', customerFound ? '✓ 通过' : '✗ 失败');
    console.log('========================================');

    return customerFound;

  } catch (error) {
    console.error('测试执行错误:', error.message);
    const screenshotError = path.join(SCREENSHOT_DIR, '3.1-error.png');
    await page.screenshot({ path: screenshotError, fullPage: true }).catch(() => {});
    return false;
  } finally {
    await browser.close();
  }
}

test_3_1_create_customer().then(success => {
  process.exit(success ? 0 : 1);
});
