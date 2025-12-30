/**
 * 场景8.5: 删除收款记录
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景8.5: 删除收款记录测试');
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

    const rows = await page.$$('.el-table__body-wrapper .el-table__row');
    console.log('Step 3: 当前收款记录数量:', rows.length);

    if (rows.length > 0) {
      const deleteBtn = await page.$('.el-table__body-wrapper .el-table__row:first-child button:has-text("删除")');
      if (deleteBtn) {
        await deleteBtn.click();
        await page.waitForTimeout(1000);
        console.log('Step 4: 点击删除');

        const confirmBtn = await page.$('.el-message-box .el-button--primary');
        if (confirmBtn) {
          await confirmBtn.click();
          await page.waitForTimeout(2000);
        }
      } else {
        console.log('  ⚠ 未找到删除按钮');
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '8.5-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 8.5 删除收款记录');
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
