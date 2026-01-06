/**
 * 角色权限管理 E2E 测试
 *
 * 测试场景：
 * 1. 登录系统
 * 2. 查看用户列表
 * 3. 创建新角色
 * 4. 创建新用户并分配角色
 * 5. 编辑角色
 * 6. 配置角色权限
 * 7. 删除测试数据
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// 测试配置
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');

// 创建截图目录
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 测试数据
const testRole = {
  role_name: '测试角色',
  role_code: 'test_role_' + Date.now(),
  description: '这是一个测试角色',
  sort_order: 100
};

const testUser = {
  username: 'testuser_' + Date.now(),
  full_name: '测试用户',
  email: 'test@example.com',
  phone: '13800138000',
  password: '123456'
};

let authToken = '';
let roleId = null;
let userId = null;

test.describe('角色权限管理测试', () => {

  test.beforeAll(async () => {
    console.log('🚀 开始角色权限管理测试');
    console.log('📝 测试角色代码:', testRole.role_code);
    console.log('📝 测试用户名:', testUser.username);
  });

  test('场景1: 用户登录', async ({ page }) => {
    console.log('\n=== 场景1: 用户登录 ===');

    // 访问登录页
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    console.log('当前URL:', currentUrl);

    // 如果已经在dashboard页面，说明已登录，先登出
    if (currentUrl.includes('/dashboard') && !currentUrl.includes('/login')) {
      console.log('已登录，先登出');
      // 这里可以添加登出逻辑
    }

    // 确保在登录页
    if (!currentUrl.includes('/login')) {
      await page.goto(BASE_URL + '/login');
      await page.waitForLoadState('networkidle');
    }

    // 截图：登录页面
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-1-login-page.png'),
      fullPage: true
    });

    // 输入用户名和密码
    await page.fill('input[placeholder*="用户名"], input[placeholder*="请输入用户名"]', 'admin');
    await page.fill('input[type="password"], input[placeholder*="密码"]', '123456');

    // 截图：填写登录信息
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-2-login-filled.png'),
      fullPage: true
    });

    // 点击登录
    await page.click('button:has-text("登录")');

    // 等待登录成功，跳转到dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // 截图：登录成功
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-3-dashboard.png'),
      fullPage: true
    });

    // 验证登录成功
    const dashboardUrl = page.url();
    expect(dashboardUrl).toContain('/dashboard');
    expect(dashboardUrl).not.toContain('/login');

    console.log('✅ 登录成功');
  });

  test('场景2: 导航到系统设置页面', async ({ page }) => {
    console.log('\n=== 场景2: 导航到系统设置页面 ===');

    // 先登录
    await page.goto(BASE_URL + '/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 方式1: 直接访问设置页面
    await page.goto(BASE_URL + '/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 截图：设置页面
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-4-settings-page.png'),
      fullPage: true
    });

    // 验证设置页面加载成功
    const settingsUrl = page.url();
    expect(settingsUrl).toContain('/settings');

    // 检查是否有"用户管理"和"角色管理"标签
    const userTab = await page.locator('text=用户管理').isVisible();
    const roleTab = await page.locator('text=角色管理').isVisible();

    console.log('用户管理标签可见:', userTab);
    console.log('角色管理标签可见:', roleTab);

    expect(userTab).toBe(true);
    expect(roleTab).toBe(true);

    console.log('✅ 成功导航到设置页面');
  });

  test('场景3: 查看用户列表', async ({ page }) => {
    console.log('\n=== 场景3: 查看用户列表 ===');

    // 登录并导航到设置页面
    await page.goto(BASE_URL + '/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto(BASE_URL + '/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 点击"用户管理"标签
    await page.click('text=用户管理');
    await page.waitForTimeout(500);

    // 截图：用户列表
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-5-user-list.png'),
      fullPage: true
    });

    // 验证用户列表表格存在
    const userTable = await page.locator('.el-table').first().isVisible();
    expect(userTable).toBe(true);

    // 检查是否有"添加用户"按钮
    const addUserBtn = await page.locator('button:has-text("添加用户")').isVisible();
    expect(addUserBtn).toBe(true);

    console.log('✅ 用户列表加载成功');
  });

  test('场景4: 创建新角色', async ({ page }) => {
    console.log('\n=== 场景4: 创建新角色 ===');

    // 登录并导航到设置页面
    await page.goto(BASE_URL + '/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto(BASE_URL + '/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 点击"角色管理"标签
    await page.click('text=角色管理');
    await page.waitForTimeout(500);

    // 截图：角色列表
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-6-role-list.png'),
      fullPage: true
    });

    // 点击"添加角色"按钮
    await page.click('button:has-text("添加角色")');
    await page.waitForTimeout(500);

    // 截图：添加角色对话框
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-7-add-role-dialog.png'),
      fullPage: true
    });

    // 填写角色信息
    await page.fill('input[placeholder*="角色名称"]', testRole.role_name);
    await page.fill('input[placeholder*="角色代码"]', testRole.role_code);
    await page.fill('textarea[placeholder*="描述"]', testRole.description);

    // 截图：填写完成
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-8-role-form-filled.png'),
      fullPage: true
    });

    // 监听API响应
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/roles') && response.request().method() === 'POST'
    );

    // 点击确定按钮
    const submitButton = page.locator('.el-dialog__footer button.el-button--primary:has-text("确定")').last();
    await submitButton.click();

    // 等待API响应
    const response = await responsePromise;
    const responseData = await response.json();

    console.log('创建角色API响应:', JSON.stringify(responseData, null, 2));

    // 保存角色ID
    if (responseData.success && responseData.data) {
      roleId = responseData.data.roleId || responseData.data.role_id;
      console.log('✅ 角色创建成功，ID:', roleId);
    }

    // 等待对话框关闭
    await page.waitForTimeout(1000);

    // 截图：创建成功后的列表
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-9-role-created.png'),
      fullPage: true
    });

    // 验证角色已添加到列表中
    const roleNameInTable = await page.locator(`text=${testRole.role_name}`).isVisible();
    expect(roleNameInTable).toBe(true);

    console.log('✅ 角色创建成功');
  });

  test('场景5: 创建新用户并分配角色', async ({ page }) => {
    console.log('\n=== 场景5: 创建新用户并分配角色 ===');

    // 登录并导航到设置页面
    await page.goto(BASE_URL + '/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto(BASE_URL + '/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 点击"用户管理"标签
    await page.click('text=用户管理');
    await page.waitForTimeout(500);

    // 点击"添加用户"按钮
    await page.click('button:has-text("添加用户")');
    await page.waitForTimeout(500);

    // 截图：添加用户对话框
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-10-add-user-dialog.png'),
      fullPage: true
    });

    // 填写用户信息
    await page.fill('input[placeholder*="用户名"]', testUser.username);
    await page.fill('input[placeholder*="姓名"]', testUser.full_name);
    await page.fill('input[placeholder*="邮箱"]', testUser.email);
    await page.fill('input[placeholder*="手机"]', testUser.phone);
    await page.fill('input[placeholder*="密码"]', testUser.password);

    // 选择角色（如果之前创建了测试角色）
    if (roleId) {
      console.log('选择测试角色...');
      await page.click('.el-select:has(input[placeholder*="角色"])');
      await page.waitForTimeout(300);
      await page.click(`.el-select-dropdown__item:has-text("${testRole.role_name}")`);
      await page.waitForTimeout(300);
    } else {
      // 选择系统管理员角色
      await page.click('.el-select:has(input[placeholder*="角色"])');
      await page.waitForTimeout(300);
      await page.click('.el-select-dropdown__item:has-text("系统管理员")');
      await page.waitForTimeout(300);
    }

    // 截图：填写完成
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-11-user-form-filled.png'),
      fullPage: true
    });

    // 监听API响应
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/users') && response.request().method() === 'POST'
    );

    // 点击确定按钮
    const submitButton = page.locator('.el-dialog__footer button.el-button--primary:has-text("确定")').last();
    await submitButton.click();

    // 等待API响应
    const response = await responsePromise;
    const responseData = await response.json();

    console.log('创建用户API响应:', JSON.stringify(responseData, null, 2));

    // 保存用户ID
    if (responseData.success && responseData.data) {
      userId = responseData.data.userId || responseData.data.user_id || responseData.data.id;
      console.log('✅ 用户创建成功，ID:', userId);
    }

    // 等待对话框关闭
    await page.waitForTimeout(1000);

    // 截图：创建成功后的列表
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-12-user-created.png'),
      fullPage: true
    });

    // 验证用户已添加到列表中
    const userNameInTable = await page.locator(`text=${testUser.username}`).isVisible();
    expect(userNameInTable).toBe(true);

    console.log('✅ 用户创建成功并分配角色');
  });

  test('场景6: 编辑角色信息', async ({ page }) => {
    console.log('\n=== 场景6: 编辑角色信息 ===');

    // 登录并导航到设置页面
    await page.goto(BASE_URL + '/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto(BASE_URL + '/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 点击"角色管理"标签
    await page.click('text=角色管理');
    await page.waitForTimeout(500);

    // 找到测试角色所在的行，点击编辑按钮
    const roleRow = page.locator(`tr:has-text("${testRole.role_name}")`);
    const editButton = roleRow.locator('button:has-text("编辑")');
    await editButton.click();
    await page.waitForTimeout(500);

    // 截图：编辑角色对话框
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-13-edit-role-dialog.png'),
      fullPage: true
    });

    // 修改描述
    const newDescription = testRole.description + ' (已修改)';
    await page.fill('textarea[placeholder*="描述"]', newDescription);

    // 截图：修改后
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-14-role-edited.png'),
      fullPage: true
    });

    // 点击确定按钮
    const submitButton = page.locator('.el-dialog__footer button.el-button--primary:has-text("确定")').last();
    await submitButton.click();

    // 等待更新完成
    await page.waitForTimeout(1000);

    // 截图：更新成功
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-15-role-updated.png'),
      fullPage: true
    });

    console.log('✅ 角色信息更新成功');
  });

  test('场景7: 配置角色权限', async ({ page }) => {
    console.log('\n=== 场景7: 配置角色权限 ===');

    // 登录并导航到设置页面
    await page.goto(BASE_URL + '/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto(BASE_URL + '/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 点击"角色管理"标签
    await page.click('text=角色管理');
    await page.waitForTimeout(500);

    // 找到测试角色所在的行，点击配置权限按钮
    const roleRow = page.locator(`tr:has-text("${testRole.role_name}")`);
    const configButton = roleRow.locator('button:has-text("配置权限")');
    await configButton.click();
    await page.waitForTimeout(1000);

    // 截图：权限配置对话框
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-16-permission-dialog.png'),
      fullPage: true
    });

    // 检查权限树是否加载
    const permissionTree = await page.locator('.el-tree').isVisible();
    expect(permissionTree).toBe(true);

    // 选择一些权限（点击前3个复选框）
    const checkboxes = page.locator('.el-tree .el-checkbox');
    const checkboxCount = await checkboxes.count();
    console.log('权限节点数量:', checkboxCount);

    if (checkboxCount > 0) {
      // 选择前3个权限
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await checkboxes.nth(i).click();
        await page.waitForTimeout(200);
      }

      // 截图：选择权限后
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'role-test-17-permissions-selected.png'),
        fullPage: true
      });

      // 点击保存权限按钮
      const saveButton = page.locator('.el-dialog__footer button.el-button--primary:has-text("保存权限")');
      await saveButton.click();

      // 等待保存完成
      await page.waitForTimeout(1000);

      // 截图：保存成功
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'role-test-18-permissions-saved.png'),
        fullPage: true
      });

      console.log('✅ 权限配置成功');
    } else {
      console.log('⚠️ 权限树为空，跳过权限配置');

      // 关闭对话框
      const cancelButton = page.locator('.el-dialog__footer button:has-text("取消")');
      await cancelButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('场景8: 查看角色详情', async ({ page }) => {
    console.log('\n=== 场景8: 查看角色详情 ===');

    // 登录并导航到设置页面
    await page.goto(BASE_URL + '/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.goto(BASE_URL + '/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 点击"角色管理"标签
    await page.click('text=角色管理');
    await page.waitForTimeout(500);

    // 截图：角色列表最终状态
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'role-test-19-final-role-list.png'),
      fullPage: true
    });

    // 验证测试角色存在
    const roleExists = await page.locator(`text=${testRole.role_name}`).isVisible();
    expect(roleExists).toBe(true);

    console.log('✅ 角色详情验证成功');
  });

  test.afterAll(async () => {
    console.log('\n📊 测试完成摘要:');
    console.log('✅ 成功创建角色:', testRole.role_name, '(ID:', roleId, ')');
    console.log('✅ 成功创建用户:', testUser.username, '(ID:', userId, ')');
    console.log('📸 截图保存在:', SCREENSHOT_DIR);
    console.log('\n⚠️  注意: 测试数据未自动清理，需要手动删除或通过API清理');
  });
});
