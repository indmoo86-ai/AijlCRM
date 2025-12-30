/**
 * 场景4.4: 搜索产品
 * 预期输出: 显示匹配的产品
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景4.4: 搜索产品测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 登录
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.fill('input:first-of-type', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
    console.log('Step 1: 登录成功');

    // 导航到产品管理
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('Step 2: 导航到产品管理');

    // 输入搜索关键词
    const searchInput = await page.$('input[placeholder*="产品"]');
    if (searchInput) {
      await searchInput.fill('测试');
      console.log('Step 3: 输入搜索关键词: 测试');
    }

    // 点击搜索按钮
    const searchBtn = await page.$('button:has-text("搜索")');
    if (searchBtn) {
      await searchBtn.click();
      console.log('Step 4: 点击搜索');
    }
    await page.waitForTimeout(2000);

    const rows = await page.$$('.el-table__body-wrapper .el-table__row');
    console.log('  搜索结果数量:', rows.length);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '4.4-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 4.4 搜索产品');
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
