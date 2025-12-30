/**
 * 场景4.1: 创建产品
 * 输入: 产品编码PRD-TEST-xxx, 产品名称测试智能门锁, 品牌艾居来, 价格1999
 * 预期输出: 产品列表显示新产品，数据库products表有记录
 */

const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');
const BASE_URL = 'http://localhost:5173';

async function test_4_1_create_product() {
  console.log('========================================');
  console.log('场景4.1: 创建产品测试');
  console.log('========================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const timestamp = Date.now();
  const productCode = `PRD${timestamp}`;
  const productName = `测试门锁_${timestamp}`;

  try {
    // Step 1: 登录
    console.log('Step 1: 登录系统...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.fill('input:first-of-type', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(2000);
    console.log('  登录成功');

    // Step 2: 导航到产品管理
    console.log('Step 2: 导航到产品管理...');
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('  当前URL:', page.url());

    // Step 3: 点击新建按钮
    console.log('Step 3: 点击新建按钮...');
    await page.click('button:has-text("新建产品")');
    await page.waitForTimeout(1000);
    console.log('  新建对话框已打开');

    // Step 4: 填写产品表单
    console.log('Step 4: 填写产品表单...');

    // 等待对话框出现
    await page.waitForSelector('.el-dialog__body', { timeout: 5000 });
    await page.waitForTimeout(500);

    // 填写产品编码
    await page.fill('.el-dialog__body input[placeholder*="编码"]', productCode);
    console.log('  产品编码:', productCode);

    // 填写产品名称
    await page.fill('.el-dialog__body input[placeholder*="名称"]', productName);
    console.log('  产品名称:', productName);

    // 填写品牌
    await page.fill('.el-dialog__body input[placeholder*="品牌"]', '艾居来');
    console.log('  品牌: 艾居来');

    // 选择产品分类
    console.log('  选择产品分类...');
    const categorySelect = await page.$('.el-dialog__body .el-form-item:has-text("产品分类") .el-select');
    if (categorySelect) {
      await categorySelect.click();
      await page.waitForTimeout(800);
      // 点击可见的下拉选项
      await page.click('.el-select-dropdown:visible .el-select-dropdown__item >> nth=0');
      console.log('  产品分类: 已选择');
      await page.waitForTimeout(300);
    }

    // 选择单位
    console.log('  选择单位...');
    const unitSelect = await page.$('.el-dialog__body .el-form-item:has-text("单位") .el-select');
    if (unitSelect) {
      await unitSelect.click();
      await page.waitForTimeout(800);
      await page.click('.el-select-dropdown:visible .el-select-dropdown__item >> nth=0');
      console.log('  单位: 已选择');
      await page.waitForTimeout(300);
    }

    // 填写销售价
    const salePriceInput = await page.$('.el-dialog__body .el-form-item:has-text("销售价") input');
    if (salePriceInput) {
      await salePriceInput.click();
      await salePriceInput.fill('1999');
      console.log('  销售价: 1999');
    }

    await page.waitForTimeout(500);

    // 截图1: 表单填写完成
    const screenshot1 = path.join(SCREENSHOT_DIR, '4.1-form-filled.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log('  截图已保存:', screenshot1);

    // Step 5: 点击确定按钮
    console.log('Step 5: 点击确定按钮...');
    await page.click('.el-dialog__footer button:has-text("确定")');
    console.log('  确定按钮已点击');

    await page.waitForTimeout(2000);

    // 检查成功消息
    const pageContent = await page.content();
    if (pageContent.includes('成功')) {
      console.log('  ✓ 检测到成功提示');
    }

    // 截图2: 保存结果
    const screenshot2 = path.join(SCREENSHOT_DIR, '4.1-success.png');
    await page.screenshot({ path: screenshot2, fullPage: true });
    console.log('  截图已保存:', screenshot2);

    // Step 6: 验证列表
    console.log('Step 6: 验证产品列表...');
    await page.waitForTimeout(1000);

    // 刷新获取最新数据
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const finalContent = await page.content();
    const productFound = finalContent.includes(productCode);

    // 截图3: 列表显示
    const screenshot3 = path.join(SCREENSHOT_DIR, '4.1-list-data.png');
    await page.screenshot({ path: screenshot3, fullPage: true });
    console.log('  截图已保存:', screenshot3);

    if (productFound) {
      console.log('  ✓ 产品在列表中找到');
    } else {
      console.log('  ⚠ 未在列表中找到产品编码，可能保存失败');
    }

    // 输出结果
    console.log('');
    console.log('========================================');
    console.log('测试结果:');
    console.log('========================================');
    console.log('场景: 4.1 创建产品');
    console.log('输入数据:');
    console.log('  产品编码:', productCode);
    console.log('  产品名称:', productName);
    console.log('  品牌: 艾居来');
    console.log('  销售价: 1999');
    console.log('列表验证:', productFound ? '✓ 通过' : '✗ 失败');
    console.log('========================================');
    console.log('');
    console.log('数据库验证SQL:');
    console.log(`SELECT product_id, product_code, product_name, brand, sale_price FROM products WHERE product_code='${productCode}';`);

    return productFound;

  } catch (error) {
    console.error('测试执行错误:', error.message);
    const screenshotError = path.join(SCREENSHOT_DIR, '4.1-error.png');
    await page.screenshot({ path: screenshotError, fullPage: true }).catch(() => {});
    return false;
  } finally {
    await browser.close();
  }
}

test_4_1_create_product().then(success => {
  process.exit(success ? 0 : 1);
});
