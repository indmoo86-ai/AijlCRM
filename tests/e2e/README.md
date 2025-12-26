# 艾居来CRM系统 E2E自动化测试

## 简介

本目录包含基于Playwright的端到端自动化测试脚本，用于测试CRM系统的完整业务流程。

## 安装

```bash
cd tests/e2e
npm install
npm run install  # 安装Playwright浏览器
```

## 运行测试

### 前置条件

确保以下服务已启动：
- 前端服务：http://localhost:5173
- 后端服务：http://localhost:3000
- 数据库服务已启动

### 执行测试

```bash
# 运行所有测试（无头模式）
npm test

# 运行所有测试（有头模式，可以看到浏览器）
npm run test:headed

# 调试模式（逐步执行）
npm run test:debug

# 运行特定测试文件
npx playwright test specs/01-login.spec.js

# 查看测试报告
npm run test:report
```

## 测试覆盖

### ✅ 已实现的测试场景

1. **01-login.spec.js** - 用户登录流程
   - 成功登录
   - 登录失败验证

2. **02-lead-to-customer.spec.js** - 线索管理完整流程
   - 创建线索
   - 跟进线索
   - 转为客户

3. **03-quotation-contract.spec.js** - 报价单和合同管理流程
   - 创建产品
   - 创建报价单
   - 添加产品明细
   - 提交报价单
   - 创建合同
   - 添加合同明细
   - 签署合同
   - 查看执行进度

### 🚧 待实现的测试场景

4. **04-attachment.spec.js** - 附件管理流程
   - 上传附件
   - 下载附件
   - 删除附件

5. **05-task.spec.js** - 任务管理流程
   - 创建任务
   - 开始任务
   - 完成任务

6. **06-profile.spec.js** - 个人中心功能
   - 修改个人信息
   - 查看账户统计

7. **07-settings.spec.js** - 系统设置功能
   - 创建用户
   - 修改系统参数

8. **08-dashboard.spec.js** - 工作台数据可视化
   - 验证统计卡片
   - 验证图表显示

## 测试结果

测试结果会保存在以下位置：

- **HTML报告**: `test-results/html-report/`
- **JSON结果**: `test-results/results.json`
- **截图**: `test-results/screenshots/`
- **视频**: `test-results/videos/`（失败的测试）

## 配置文件

- **playwright.config.js**: Playwright配置
- **package.json**: 项目依赖和脚本

## 注意事项

1. **元素选择器**：测试脚本使用的选择器可能需要根据实际前端实现调整
2. **等待时间**：某些操作使用了固定等待时间(`waitForTimeout`)，生产环境建议使用更智能的等待策略
3. **测试数据**：测试会创建测试数据，建议在测试数据库环境运行
4. **并发执行**：当前配置为单worker执行，避免数据冲突

## 调试技巧

### 使用调试模式

```bash
npm run test:debug
```

会打开Playwright Inspector，可以：
- 逐步执行测试
- 检查元素
- 查看网络请求
- 修改并重新执行步骤

### 使用Codegen生成测试

```bash
npx playwright codegen http://localhost:5173
```

会打开浏览器录制操作，自动生成测试代码。

### 查看追踪

失败的测试会生成trace文件，可以用以下命令查看：

```bash
npx playwright show-trace test-results/.../trace.zip
```

## 扩展测试

### 添加新测试

1. 在`specs/`目录下创建新的`.spec.js`文件
2. 使用以下模板：

```javascript
const { test, expect } = require('@playwright/test');

async function login(page) {
  await page.goto('/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

test.describe('测试场景名称', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('测试用例名称', async ({ page }) => {
    // 测试步骤
  });
});
```

3. 运行测试验证

## CI/CD集成

可以在CI/CD流程中运行测试：

```yaml
# GitHub Actions示例
- name: Install dependencies
  run: |
    cd tests/e2e
    npm install
    npm run install

- name: Run E2E tests
  run: |
    cd tests/e2e
    npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: tests/e2e/test-results/
```

## 故障排除

### 浏览器未安装

```bash
npm run install
```

### 端口冲突

修改`playwright.config.js`中的`baseURL`

### 选择器失效

使用Playwright Inspector检查元素：

```bash
npx playwright inspector
```

### 测试超时

增加`playwright.config.js`中的`timeout`配置

## 相关文档

- [Playwright官方文档](https://playwright.dev)
- [测试最佳实践](https://playwright.dev/docs/best-practices)
- [Element Plus组件测试](https://element-plus.org/zh-CN/guide/testing.html)
