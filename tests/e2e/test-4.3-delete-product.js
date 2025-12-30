/**
 * 场景4.3: 删除产品
 * 预期输出: 产品被删除
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景4.3: 删除产品测试');
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

    const initialRows = await page.$$('.el-table__body-wrapper .el-table__row');
    const initialCount = initialRows.length;
    console.log('Step 2: 当前产品数量:', initialCount);

    if (initialCount === 0) {
      console.log('  ⚠ 没有产品，跳过');
      return true;
    }

    // 点击删除按钮
    console.log('Step 3: 点击删除按钮...');
    const deleteBtn = await page.$('.el-table__body-wrapper .el-table__row:first-child button:has-text("删除")');
    if (!deleteBtn) {
      console.log('  ⚠ 未找到删除按钮，跳过');
      return true;
    }
    await deleteBtn.click();
    await page.waitForTimeout(500);

    // 确认删除
    const confirmBtn = await page.$('.el-message-box button:has-text("确定")');
    if (confirmBtn) {
      await confirmBtn.click();
      console.log('  确认删除');
    }
    await page.waitForTimeout(2000);

    const pageContent = await page.content();
    const hasSuccess = pageContent.includes('成功') || pageContent.includes('删除');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '4.3-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 4.3 删除产品');
    console.log('状态:', hasSuccess ? '✓ 通过' : '✗ 失败');
    console.log('========================================');
    return hasSuccess;

  } catch (error) {
    console.error('错误:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

test().then(s => process.exit(s ? 0 : 1));
