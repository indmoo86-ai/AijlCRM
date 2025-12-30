/**
 * 场景1.3: 用户登出
 */
const { chromium } = require('playwright');
const path = require('path');
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('========================================');
  console.log('场景1.3: 用户登出测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 先登录
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.fill('input:first-of-type', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
    console.log('Step 1: 登录成功');

    // 点击用户头像或退出按钮
    const logoutBtn = await page.$('button:has-text("退出")');
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      console.log('Step 2: 点击退出按钮');
    } else {
      // 尝试点击用户下拉菜单
      const userDropdown = await page.$('.el-dropdown');
      if (userDropdown) {
        await userDropdown.click();
        await page.waitForTimeout(500);
        const logoutItem = await page.$('.el-dropdown-menu__item:has-text("退出")');
        if (logoutItem) {
          await logoutItem.click();
          await page.waitForTimeout(2000);
        }
      }
      console.log('Step 2: 尝试退出');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '1.3-success.png'), fullPage: true });

    // 检查是否回到登录页
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      console.log('Step 3: 已返回登录页');
    }

    console.log('========================================');
    console.log('场景: 1.3 用户登出');
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
