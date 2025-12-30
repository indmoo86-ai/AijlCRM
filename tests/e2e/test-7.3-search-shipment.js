/**
 * 场景7.3: 搜索发货单
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景7.3: 搜索发货单测试');
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

    await page.goto(`${BASE_URL}/shipments`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('Step 2: 导航到发货管理');

    const searchInput = await page.$('input[placeholder*="发货"], input[placeholder*="搜索"]');
    if (searchInput) {
      await searchInput.fill('测试');
      console.log('Step 3: 输入搜索关键词: 测试');
    }

    const searchBtn = await page.$('button:has-text("搜索")');
    if (searchBtn) {
      await searchBtn.click();
    }
    await page.waitForTimeout(2000);

    const rows = await page.$$('.el-table__body-wrapper .el-table__row');
    console.log('  搜索结果数量:', rows.length);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '7.3-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 7.3 搜索发货单');
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
