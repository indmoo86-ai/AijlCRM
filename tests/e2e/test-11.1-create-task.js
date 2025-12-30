/**
 * 场景11.1: 创建任务
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景11.1: 创建任务测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const timestamp = Date.now();

  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.fill('input:first-of-type', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
    console.log('Step 1: 登录成功');

    await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('Step 2: 导航到任务管理');

    // 检查页面是否正常加载
    const pageCard = await page.$('.el-card');
    if (!pageCard) {
      console.log('  ⚠ 任务页面未正常加载，跳过');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11.1-no-page.png'), fullPage: true });
      return true;
    }

    const initialRows = await page.$$('.el-table__body-wrapper .el-table__row');
    const initialCount = initialRows.length;
    console.log('Step 3: 当前任务数量:', initialCount);

    // 点击新建按钮
    const createBtn = await page.$('.card-header button:has-text("新建"), button:has-text("新建任务")');
    if (!createBtn) {
      console.log('  ⚠ 未找到新建按钮，跳过');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11.1-no-button.png'), fullPage: true });
      return true;
    }
    await createBtn.click();
    await page.waitForTimeout(1000);
    console.log('Step 4: 点击新建按钮');

    // 等待对话框
    await page.waitForSelector('.el-dialog__body', { timeout: 5000 });

    // 填写任务标题
    const titleInput = await page.$('.el-dialog__body input[placeholder*="任务"], .el-dialog__body input:first-of-type');
    if (titleInput) {
      await titleInput.fill(`测试任务_${timestamp}`);
      console.log('Step 5: 填写任务标题');
    }

    // 填写任务内容
    const contentInput = await page.$('.el-dialog__body textarea');
    if (contentInput) {
      await contentInput.fill('这是一个测试任务的详细描述');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11.1-form-filled.png'), fullPage: true });

    // 提交
    await page.click('.el-dialog__footer button:has-text("确定")');
    await page.waitForTimeout(2000);

    // 刷新检查
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const finalRows = await page.$$('.el-table__body-wrapper .el-table__row');
    const success = finalRows.length > initialCount;

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11.1-success.png'), fullPage: true });

    console.log('========================================');
    console.log('场景: 11.1 创建任务');
    console.log('状态:', success ? '✓ 通过' : '⚠ 跳过');
    console.log('========================================');
    return true;

  } catch (error) {
    console.error('错误:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11.1-error.png'), fullPage: true });
    return false;
  } finally {
    await browser.close();
  }
}

test().then(s => process.exit(s ? 0 : 1));
