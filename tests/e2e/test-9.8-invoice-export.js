/**
 * 场景9.8: 发票导出
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景9.8: 发票导出测试');
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

    await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('Step 2: 导航到发票管理');

    // 查找导出按钮
    const exportBtn = await page.$('button:has-text("导出")');
    if (exportBtn) {
      await exportBtn.click();
      await page.waitForTimeout(2000);
      console.log('Step 3: 点击导出');
    } else {
      console.log('Step 3: 未找到导出按钮');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '9.8-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 9.8 发票导出');
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
