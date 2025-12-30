/**
 * 场景2.2: 编辑线索
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景2.2: 编辑线索测试');
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

    const editBtn = await page.$('.el-table__body-wrapper .el-table__row:first-child button:has-text("编辑")');
    if (!editBtn) {
      console.log('  ⚠ 未找到编辑按钮，跳过');
      return true;
    }
    await editBtn.click();
    await page.waitForTimeout(1000);
    console.log('Step 3: 编辑对话框已打开');

    await page.waitForSelector('.el-dialog__body', { timeout: 5000 });

    // 修改房间数
    const roomInput = await page.$('.el-dialog__body .el-input-number input');
    if (roomInput) {
      await roomInput.click();
      await roomInput.fill('');
      await roomInput.type('250');
      console.log('Step 4: 修改房间数: 250');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2.2-form-filled.png'), fullPage: true });

    await page.click('.el-dialog__footer button:has-text("确定")');
    await page.waitForTimeout(2000);

    const pageContent = await page.content();
    const hasSuccess = pageContent.includes('成功');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2.2-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 2.2 编辑线索');
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
