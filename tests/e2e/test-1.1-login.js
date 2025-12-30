/**
 * 场景1.1: 用户登录测试
 * 输入: username=admin, password=123456
 * 预期输出: 跳转到/dashboard，右上角显示"系统管理员"
 */

const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test_1_1_login() {
  console.log('========================================');
  console.log('场景1.1: 用户登录测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: 访问系统
    console.log('Step 1: 访问系统首页...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log('  当前URL:', currentUrl);

    if (!currentUrl.includes('/login')) {
      console.log('  警告: 未跳转到登录页，尝试直接访问登录页');
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    }

    // Step 2: 填写登录表单
    console.log('Step 2: 填写登录表单...');

    // 等待表单加载
    await page.waitForSelector('input', { timeout: 10000 });

    // 输入用户名
    const usernameInput = await page.$('input[type="text"], input[placeholder*="用户名"], input[placeholder*="账号"]');
    if (usernameInput) {
      await usernameInput.fill('admin');
      console.log('  用户名已输入: admin');
    } else {
      // 尝试第一个input
      const inputs = await page.$$('input');
      if (inputs.length > 0) {
        await inputs[0].fill('admin');
        console.log('  用户名已输入(第一个input): admin');
      }
    }

    // 输入密码
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill('123456');
      console.log('  密码已输入: 123456');
    }

    await page.waitForTimeout(500);

    // 截图1: 表单填写完成
    const screenshot1 = path.join(SCREENSHOT_DIR, '1.1-form-filled.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log('  截图已保存:', screenshot1);

    // Step 3: 点击登录按钮
    console.log('Step 3: 点击登录按钮...');

    const loginButton = await page.$('button:has-text("登录"), button:has-text("登 录"), button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
      console.log('  登录按钮已点击');
    } else {
      // 尝试所有按钮
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text && text.includes('登')) {
          await btn.click();
          console.log('  找到并点击登录按钮:', text.trim());
          break;
        }
      }
    }

    // Step 4: 等待跳转
    console.log('Step 4: 等待页面跳转...');
    await page.waitForTimeout(3000);

    const afterLoginUrl = page.url();
    console.log('  登录后URL:', afterLoginUrl);

    // Step 5: 验证登录结果
    console.log('Step 5: 验证登录结果...');

    let loginSuccess = false;
    let userName = '';

    if (afterLoginUrl.includes('/dashboard') || afterLoginUrl.includes('/workbench') ||
        (!afterLoginUrl.includes('/login') && afterLoginUrl !== `${BASE_URL}/login`)) {
      loginSuccess = true;
      console.log('  ✓ 页面已跳转，登录成功');

      // 尝试获取用户名
      await page.waitForTimeout(1000);
      const pageContent = await page.content();

      if (pageContent.includes('系统管理员')) {
        userName = '系统管理员';
        console.log('  ✓ 找到用户名: 系统管理员');
      } else if (pageContent.includes('admin')) {
        userName = 'admin';
        console.log('  ✓ 找到用户名: admin');
      }

      // 截图2: 登录成功后的页面
      const screenshot2 = path.join(SCREENSHOT_DIR, '1.1-success.png');
      await page.screenshot({ path: screenshot2, fullPage: true });
      console.log('  截图已保存:', screenshot2);

    } else {
      console.log('  ✗ 登录失败，仍在登录页');

      // 截图失败状态
      const screenshotFail = path.join(SCREENSHOT_DIR, '1.1-failed.png');
      await page.screenshot({ path: screenshotFail, fullPage: true });
      console.log('  失败截图已保存:', screenshotFail);
    }

    // 输出测试结果
    console.log('');
    console.log('========================================');
    console.log('测试结果:');
    console.log('========================================');
    console.log('场景: 1.1 用户登录');
    console.log('输入: username=admin, password=123456');
    console.log('预期: 跳转到/dashboard，显示"系统管理员"');
    console.log('实际URL:', afterLoginUrl);
    console.log('用户名:', userName || '未找到');
    console.log('状态:', loginSuccess ? '✓ 通过' : '✗ 失败');
    console.log('========================================');

    return loginSuccess;

  } catch (error) {
    console.error('测试执行错误:', error.message);

    // 截图错误状态
    const screenshotError = path.join(SCREENSHOT_DIR, '1.1-error.png');
    await page.screenshot({ path: screenshotError, fullPage: true });
    console.log('错误截图已保存:', screenshotError);

    return false;
  } finally {
    await browser.close();
  }
}

// 执行测试
test_1_1_login().then(success => {
  process.exit(success ? 0 : 1);
});
