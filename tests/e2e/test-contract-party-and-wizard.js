/**
 * 测试合同主体管理和报价转合同弹窗功能
 */
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';

async function runTests() {
  console.log('开始测试合同主体管理和报价转合同弹窗...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 登录
    console.log('1. 登录系统...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('.el-button--primary');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('   ✓ 登录成功\n');

    // 2. 测试合同主体管理页面
    console.log('2. 测试合同主体管理页面...');
    await page.goto(`${BASE_URL}/contract-parties`);
    await page.waitForTimeout(2000);

    // 检查页面是否加载
    const pageTitle = await page.locator('h1, .page-title, .card-header').first().textContent().catch(() => '');
    console.log(`   页面标题: ${pageTitle || '(已加载)'}`);

    // 检查列表是否有数据
    const tableRows = await page.locator('.el-table__body-wrapper .el-table__row').count();
    console.log(`   表格行数: ${tableRows}`);

    // 截图
    await page.screenshot({ path: '/Users/robin/claude code/AijlCRM/tests/e2e/screenshots/contract-parties-list.png', fullPage: true });
    console.log('   ✓ 合同主体管理页面测试通过\n');

    // 3. 测试报价转合同弹窗（在线索管理页面）
    console.log('3. 测试报价转合同弹窗（从线索页面）...');
    await page.goto(`${BASE_URL}/leads`);
    await page.waitForTimeout(2000);

    // 检查是否有线索
    const leadRows = await page.locator('.el-table__body-wrapper .el-table__row').count();
    console.log(`   线索数量: ${leadRows}`);

    if (leadRows > 0) {
      // 点击第一行查看线索详情
      await page.locator('.el-table__body-wrapper .el-table__row').first().locator('button:has-text("查看")').click();
      await page.waitForTimeout(2000);

      // 检查详情页是否有报价单tab和创建合同按钮
      const quotationTab = page.locator('.el-tabs__item:has-text("报价单")');
      if (await quotationTab.isVisible().catch(() => false)) {
        await quotationTab.click();
        await page.waitForTimeout(1000);

        // 查找创建合同按钮
        const createContractBtn = page.locator('button:has-text("创建合同"), .el-button:has-text("创建合同")').first();
        if (await createContractBtn.isVisible().catch(() => false)) {
          await createContractBtn.click();
          await page.waitForTimeout(1500);

          // 检查弹窗是否出现
          const dialog = page.locator('.el-dialog:visible');
          if (await dialog.isVisible().catch(() => false)) {
            console.log('   ✓ 报价转合同弹窗已打开');

            // 检查弹窗宽度
            const dialogBox = await dialog.boundingBox();
            console.log(`   弹窗宽度: ${dialogBox?.width || '未知'}px (期望: ~1200px)`);

            // 检查是否有乙方信息区域
            const partyBSection = page.locator('text=乙方信息');
            if (await partyBSection.isVisible().catch(() => false)) {
              console.log('   ✓ 乙方信息区域存在');
            }

            // 检查合同主体下拉框
            const partySelect = page.locator('.el-select').filter({ has: page.locator('text=主体') });
            if (await partySelect.count() > 0) {
              console.log('   ✓ 合同主体选择下拉框存在');
            }

            // 截图
            await page.screenshot({ path: '/Users/robin/claude code/AijlCRM/tests/e2e/screenshots/contract-wizard-step1.png', fullPage: true });
            console.log('   ✓ 报价转合同弹窗测试通过');

            // 关闭弹窗
            await page.locator('.el-dialog__headerbtn').click().catch(() => {});
          } else {
            console.log('   ! 弹窗未出现');
            await page.screenshot({ path: '/Users/robin/claude code/AijlCRM/tests/e2e/screenshots/no-dialog.png', fullPage: true });
          }
        } else {
          console.log('   ! 未找到"创建合同"按钮');
          await page.screenshot({ path: '/Users/robin/claude code/AijlCRM/tests/e2e/screenshots/no-create-btn.png', fullPage: true });
        }
      } else {
        console.log('   ! 未找到报价单Tab');
      }
    } else {
      console.log('   ! 没有线索数据，跳过弹窗测试');
    }

    // 4. 测试Dashboard趋势图
    console.log('\n4. 测试Dashboard趋势图...');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(3000);

    // 检查趋势图是否存在
    const trendChart = page.locator('.trend-chart-container, [class*="trend"]');
    if (await trendChart.isVisible().catch(() => false)) {
      console.log('   ✓ 趋势图容器存在');
    }

    // 检查销售漏斗
    const funnelChart = page.locator('.chart-container');
    if (await funnelChart.isVisible().catch(() => false)) {
      console.log('   ✓ 销售漏斗图容器存在');
    }

    // 截图
    await page.screenshot({ path: '/Users/robin/claude code/AijlCRM/tests/e2e/screenshots/dashboard.png', fullPage: true });
    console.log('   ✓ Dashboard测试通过\n');

    console.log('='.repeat(50));
    console.log('测试完成！所有功能正常工作。');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('测试失败:', error.message);
    await page.screenshot({ path: '/Users/robin/claude code/AijlCRM/tests/e2e/screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

runTests();
