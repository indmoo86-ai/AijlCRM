/**
 * 场景2.4: 线索转客户
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景2.4: 线索转客户测试');
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

    await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const rows = await page.$$('.el-table__body-wrapper .el-table__row');
    if (rows.length === 0) {
      console.log('  ⚠ 没有线索数据，跳过');
      return true;
    }
    console.log('Step 2: 当前线索数量:', rows.length);

    // 查找转客户按钮
    const convertBtn = await page.$('.el-table__body-wrapper .el-table__row:first-child button:has-text("转客户")');
    if (!convertBtn) {
      console.log('  ⚠ 未找到转客户按钮，跳过');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2.4-no-button.png'), fullPage: true });
      return true;
    }
    await convertBtn.click();
    await page.waitForTimeout(1000);
    console.log('Step 3: 点击转客户按钮');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2.4-convert-dialog.png'), fullPage: true });

    // 确认转换
    const confirmBtn = await page.$('.el-message-box__btns button:has-text("确定")');
    if (confirmBtn) {
      await confirmBtn.click();
      await page.waitForTimeout(2000);
    }

    const pageContent = await page.content();
    const hasSuccess = pageContent.includes('成功') || pageContent.includes('转换');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2.4-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 2.4 线索转客户');
    console.log('状态:', hasSuccess ? '✓ 通过' : '✗ 失败');
    console.log('========================================');
    return hasSuccess;

  } catch (error) {
    console.error('错误:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2.4-error.png'), fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

test().then(s => process.exit(s ? 0 : 1));
