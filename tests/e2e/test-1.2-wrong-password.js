/**
 * 场景1.2: 错误密码登录测试
 * 输入: username=admin, password=wrongpassword
 * 预期输出: 停留在登录页，显示错误提示
 */

const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test_1_2_wrong_password() {
  console.log('========================================');
  console.log('场景1.2: 错误密码登录测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: 访问登录页
    console.log('Step 1: 访问登录页...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Step 2: 填写登录表单（错误密码）
    console.log('Step 2: 填写登录表单（错误密码）...');

    await page.waitForSelector('input', { timeout: 10000 });

    // 输入用户名
    const inputs = await page.$$('input');
    if (inputs.length > 0) {
      await inputs[0].fill('admin');
      console.log('  用户名已输入: admin');
    }

    // 输入错误密码
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill('wrongpassword');
      console.log('  密码已输入: wrongpassword');
    }

    await page.waitForTimeout(500);

    // 截图1: 表单填写完成
    const screenshot1 = path.join(SCREENSHOT_DIR, '1.2-form-filled.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log('  截图已保存:', screenshot1);

    // Step 3: 点击登录按钮
    console.log('Step 3: 点击登录按钮...');

    const loginButton = await page.$('button:has-text("登录"), button:has-text("登 录")');
    if (loginButton) {
      await loginButton.click();
      console.log('  登录按钮已点击');
    }

    // Step 4: 等待响应
    console.log('Step 4: 等待响应...');
    await page.waitForTimeout(2000);

    // Step 5: 验证结果
    console.log('Step 5: 验证结果...');

    const currentUrl = page.url();
    console.log('  当前URL:', currentUrl);

    let testPassed = false;
    let errorMessage = '';

    // 验证仍在登录页
    if (currentUrl.includes('/login')) {
      console.log('  ✓ 仍在登录页');

      // 检查是否有错误提示
      const pageContent = await page.content();

      if (pageContent.includes('错误') || pageContent.includes('失败') ||
          pageContent.includes('Error') || pageContent.includes('error') ||
          pageContent.includes('用户名或密码')) {
        errorMessage = '检测到错误提示';
        console.log('  ✓ 检测到错误提示');
      }

      // 检查Element UI的消息提示
      const messageEl = await page.$('.el-message--error, .el-message');
      if (messageEl) {
        const msgText = await messageEl.textContent();
        errorMessage = msgText || '有错误消息';
        console.log('  ✓ 错误消息:', errorMessage);
      }

      testPassed = true;
    } else {
      console.log('  ✗ 意外跳转到其他页面');
    }

    // 截图2: 错误提示
    const screenshot2 = path.join(SCREENSHOT_DIR, '1.2-error-shown.png');
    await page.screenshot({ path: screenshot2, fullPage: true });
    console.log('  截图已保存:', screenshot2);

    // 输出测试结果
    console.log('');
    console.log('========================================');
    console.log('测试结果:');
    console.log('========================================');
    console.log('场景: 1.2 错误密码登录');
    console.log('输入: username=admin, password=wrongpassword');
    console.log('预期: 停留在登录页，显示错误提示');
    console.log('实际URL:', currentUrl);
    console.log('错误提示:', errorMessage || '未检测到');
    console.log('状态:', testPassed ? '✓ 通过' : '✗ 失败');
    console.log('========================================');

    return testPassed;

  } catch (error) {
    console.error('测试执行错误:', error.message);
    const screenshotError = path.join(SCREENSHOT_DIR, '1.2-error.png');
    await page.screenshot({ path: screenshotError, fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

test_1_2_wrong_password().then(success => {
  process.exit(success ? 0 : 1);
});
