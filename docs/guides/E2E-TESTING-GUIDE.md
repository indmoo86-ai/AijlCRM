# 艾居来CRM系统 - E2E自动化测试完整指南

## ✅ 已完成的工作

### 1. 测试框架搭建
- ✅ 安装Playwright测试框架
- ✅ 配置Playwright（浏览器、截图、视频录制）
- ✅ 创建测试目录结构
- ✅ 编写测试运行脚本

### 2. 测试脚本编写
已编写3个核心测试场景：

#### 📝 01-login.spec.js - 用户登录测试
- 成功登录流程
- 登录失败验证
- 页面跳转检查

#### 📝 02-lead-to-customer.spec.js - 线索管理流程
- 创建线索
- 跟进线索（添加跟进记录）
- 线索转客户
- 数据验证

#### 📝 03-quotation-contract.spec.js - 完整销售流程
- 创建产品（智能门锁套装）
- 创建报价单并选择客户
- 添加产品明细（数量、单价、折扣）
- 验证金额自动计算
- 提交报价单
- 创建合同
- 添加合同产品明细
- 签署合同
- 查看合同执行进度

### 3. 文档编写
- ✅ `e2e-test-plan.md` - 详细的10个测试场景规划
- ✅ `tests/e2e/README.md` - 完整的技术文档
- ✅ `tests/e2e/QUICKSTART.md` - 快速开始指南
- ✅ `tests/e2e/run-tests.sh` - 自动化运行脚本

---

## 🚀 如何使用

### 第一步：启动服务

#### 启动后端服务
```bash
cd backend
npm run dev
# 确保运行在 http://localhost:3000
```

#### 启动前端服务
```bash
cd frontend
npm run dev
# 确保运行在 http://localhost:5173
```

### 第二步：运行测试

```bash
cd tests/e2e

# 方式1: 使用快速脚本（推荐）
./run-tests.sh

# 方式2: 使用npm命令
npm test

# 方式3: 有头模式（可见浏览器）
./run-tests.sh headed

# 方式4: 调试模式
./run-tests.sh debug
```

### 第三步：查看结果

```bash
# 查看HTML报告
npm run test:report

# 查看截图
open test-results/screenshots/

# 查看失败测试的视频
open test-results/videos/
```

---

## 📊 测试覆盖情况

### ✅ 已实现的测试（3个场景）

| 测试文件 | 场景 | 覆盖功能 |
|---------|------|---------|
| 01-login.spec.js | 用户登录 | 登录验证、权限检查 |
| 02-lead-to-customer.spec.js | 线索→客户 | 线索创建、跟进、转换 |
| 03-quotation-contract.spec.js | 销售全流程 | 产品、报价、合同、明细、签署、进度 |

### 🚧 待实现的测试（7个场景）

根据 `e2e-test-plan.md`，还需要实现：

4. 附件管理流程（上传、下载、删除）
5. 任务管理流程（创建、开始、完成）
6. 个人中心功能（修改信息、查看统计）
7. 系统设置功能（用户管理、角色管理）
8. 工作台数据可视化（图表验证）
9. 发货管理流程
10. 回款开票流程

---

## 🎯 下一步操作建议

### 选项A：立即执行现有测试

1. **确认服务运行**：
   ```bash
   # 前端
   curl http://localhost:5173

   # 后端
   curl http://localhost:3000/api
   ```

2. **运行测试**：
   ```bash
   cd tests/e2e
   ./run-tests.sh headed  # 建议第一次用有头模式观察
   ```

3. **根据结果调整**：
   - 如果测试失败，查看截图找出问题
   - 可能需要调整选择器（CSS选择器）
   - 可能需要调整等待时间

### 选项B：扩展更多测试场景

根据测试计划继续编写：

```bash
cd tests/e2e/specs
# 复制现有测试作为模板
cp 03-quotation-contract.spec.js 04-attachment.spec.js
# 编辑新测试文件
```

### 选项C：集成到CI/CD

在GitHub Actions或其他CI/CD中运行：

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd tests/e2e && npm install
      - run: cd tests/e2e && npm test
      - uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: tests/e2e/test-results/
```

---

## 🔧 技术细节

### 测试框架配置

**文件**: `tests/e2e/playwright.config.js`

```javascript
{
  baseURL: 'http://localhost:5173',
  timeout: 30000,
  retries: 1,
  workers: 1,
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry'
}
```

### 测试模式

1. **无头模式**（默认）：后台运行，速度快
2. **有头模式**：显示浏览器，方便观察
3. **调试模式**：逐步执行，可以暂停修改

### 元素选择器策略

测试使用以下选择器优先级：

1. **文本选择器**：`text=登录`（推荐，最稳定）
2. **占位符选择器**：`input[placeholder*="用户名"]`
3. **CSS选择器**：`.el-button[type="primary"]`
4. **角色选择器**：`button[role="button"]`

### 等待策略

- `waitForURL()` - 等待URL变化
- `waitForSelector()` - 等待元素出现
- `waitForTimeout()` - 固定等待（仅必要时使用）
- `page.waitForLoadState('networkidle')` - 等待网络空闲

---

## 📈 测试报告示例

### HTML报告包含：

- ✅ 测试用例列表（通过/失败）
- ✅ 执行时间统计
- ✅ 失败截图
- ✅ 错误堆栈
- ✅ 重试记录

### 截图命名规范：

```
02-1-leads-page.png       # 场景2，步骤1，线索页面
02-2-lead-created.png     # 场景2，步骤2，线索创建后
02-3-lead-followed.png    # 场景2，步骤3，跟进后
...
```

---

## ❓ 常见问题

### Q1: 测试失败，元素找不到

**原因**：选择器不匹配或页面加载慢

**解决**：
1. 使用调试模式查看元素：`./run-tests.sh debug`
2. 使用Playwright Inspector：`npx playwright inspector`
3. 增加等待时间或使用更智能的等待

### Q2: 测试数据冲突

**原因**：重复运行测试，数据库存在旧数据

**解决**：
1. 使用唯一标识符（如时间戳）
2. 测试前清理数据库
3. 使用测试专用数据库

### Q3: 登录失败

**原因**：测试账号不存在或密码错误

**解决**：
1. 确认数据库中有测试账号
2. 修改测试脚本中的用户名密码
3. 查看后端日志确认原因

### Q4: 前端样式导致选择器失效

**原因**：Element Plus组件动态渲染

**解决**：
1. 使用更宽松的选择器：`text=登录` 而不是具体class
2. 等待元素可见：`await expect(element).toBeVisible()`
3. 使用data-testid属性标记测试元素

---

## 🎓 学习资源

### Playwright官方文档
- [快速开始](https://playwright.dev/docs/intro)
- [最佳实践](https://playwright.dev/docs/best-practices)
- [选择器文档](https://playwright.dev/docs/selectors)
- [断言文档](https://playwright.dev/docs/test-assertions)

### Element Plus测试
- [Element Plus测试指南](https://element-plus.org/zh-CN/guide/testing.html)

### 视频教程
- [Playwright官方YouTube频道](https://www.youtube.com/@Playwrightdev)

---

## 📝 测试最佳实践

### ✅ 推荐做法

1. **使用有意义的测试名称**
   ```javascript
   test('应该能够成功创建线索并转为客户', async ({ page }) => {
   ```

2. **添加截图记录关键步骤**
   ```javascript
   await page.screenshot({
     path: 'test-results/screenshots/step-name.png',
     fullPage: true
   });
   ```

3. **使用beforeEach登录**
   ```javascript
   test.beforeEach(async ({ page }) => {
     await login(page);
   });
   ```

4. **验证关键操作结果**
   ```javascript
   await expect(page.locator('text=创建成功')).toBeVisible();
   ```

### ❌ 避免做法

1. ❌ 使用脆弱的选择器（如 `div > div > span`）
2. ❌ 过度使用固定等待时间
3. ❌ 不验证操作结果
4. ❌ 测试用例之间有依赖关系

---

## 🎉 总结

E2E自动化测试框架已经完全搭建完成！

### 已交付：

1. ✅ 完整的测试框架（Playwright）
2. ✅ 3个核心业务流程测试
3. ✅ 详细的测试计划（10个场景）
4. ✅ 自动化运行脚本
5. ✅ 完整的文档（技术文档、快速开始指南）

### 可以立即：

1. 🚀 运行现有测试验证系统功能
2. 📝 扩展更多测试场景
3. 🔄 集成到CI/CD流程
4. 📊 生成测试报告展示给团队

### 需要你做的：

1. 启动前后端服务
2. 运行测试脚本：`cd tests/e2e && ./run-tests.sh`
3. 根据测试结果调整（如有必要）
4. 决定是否扩展更多测试场景

---

**祝测试顺利！** 🎊
