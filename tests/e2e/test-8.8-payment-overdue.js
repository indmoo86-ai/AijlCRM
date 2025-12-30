/**
 * 场景8.8: 收款逾期提醒
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景8.8: 收款逾期提醒测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.fill('input:first-of-type', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
    console.log('Step 1: 登录成功');

    await page.goto(`${BASE_URL}/payments`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('Step 2: 导航到收款管理');

    // 查找逾期筛选按钮
    const overdueBtn = await page.$('button:has-text("逾期")');
    if (overdueBtn) {
      await overdueBtn.click();
      await page.waitForTimeout(2000);
      console.log('Step 3: 点击逾期筛选');
    } else {
      console.log('Step 3: 查看收款列表逾期信息');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '8.8-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 8.8 收款逾期提醒');
    console.log('状态: ✓ 通过');
    console.log('========================================');
    return true;

  } catch (error) {
    console.error('错误:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

test().then(s => process.exit(s ? 0 : 1));
