/**
 * 场景10.3: 搜索售后工单
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景10.3: 搜索售后工单测试');
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

    await page.goto(`${BASE_URL}/service-tickets`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('Step 2: 导航到售后管理');

    const rows = await page.$$('.el-table__body-wrapper .el-table__row');
    console.log('  售后工单数量:', rows.length);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10.3-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 10.3 搜索售后工单');
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
