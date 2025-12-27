# 快速启动指南

## 🚀 立即体验

### 方式一：Docker 一键启动（推荐）

```bash
# 1. 进入部署目录
cd CRM/deploy

# 2. 复制环境变量文件
cp .env.example .env

# 3. 启动所有服务
docker-compose up -d

# 4. 查看启动状态
docker-compose ps

# 5. 访问系统
# 浏览器打开: http://localhost
# 默认账号: admin
# 默认密码: admin123
```

### 方式二：本地开发环境

#### 1. 初始化数据库

```bash
# 登录MySQL
mysql -u root -p

# 执行数据库脚本
mysql -u root -p < CRM/database/schema.sql
```

#### 2. 启动后端服务

```bash
cd CRM/backend

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 编辑.env文件，配置数据库连接
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=smart_hotel_crm
# DB_USER=root
# DB_PASSWORD=your_password

# 启动开发服务器
npm run dev

# 后端服务将运行在 http://localhost:3000
```

#### 3. 启动前端服务

```bash
cd CRM/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 前端服务将运行在 http://localhost:5173
```

#### 4. 访问系统

打开浏览器访问: `http://localhost:5173`

- 默认账号: `admin`
- 默认密码: `admin123`

## ✅ 已实现功能

### 后端 API
- ✅ 用户认证（登录、JWT Token）
- ✅ 线索管理（增删改查、跟进记录、转客户）
- ✅ 数据模型（User、Lead、Customer、FollowUp）
- ✅ 权限控制（基于角色的访问控制）
- ✅ 统一响应格式
- ✅ 错误处理

### 前端页面
- ✅ 登录页面（精美UI设计）
- ✅ 主布局和侧边导航
- ✅ 数据看板（统计卡片）
- ✅ 线索管理页面（完整CRUD）
  - 线索列表（筛选、分页、搜索）
  - 新建/编辑线索
  - 添加跟进记录
  - 线索转客户
- ✅ 响应式设计（支持PC和移动端）

### 基础设施
- ✅ Docker 容器化部署
- ✅ MySQL 数据库设计（16张表）
- ✅ Nginx 反向代理
- ✅ 环境变量配置
- ✅ 完整的项目文档

## 📋 核心功能演示

### 1. 登录系统

访问 http://localhost:5173 进入登录页面

```
用户名: admin
密码: admin123
```

### 2. 查看数据看板

登录后自动跳转到数据看板，显示：
- 线索总数
- 客户总数
- 商机总数
- 合同总数

### 3. 管理线索

点击左侧菜单「线索管理 > 线索列表」：

**新建线索：**
- 点击「新建线索」按钮
- 填写客户姓名、手机号、渠道来源等信息
- 提交保存

**筛选线索：**
- 按状态筛选（新建/跟进中/已转化/已放弃）
- 按渠道来源筛选
- 关键词搜索

**跟进线索：**
- 点击「跟进」按钮
- 选择跟进方式（电话/微信/现场拜访等）
- 填写跟进内容和意向度
- 提交保存

**转为客户：**
- 对于跟进中的线索，点击「转客户」
- 线索自动转换为正式客户

## 🛠 技术栈

### 后端
- Node.js 18+
- Express 4.x
- MySQL 8.0
- Sequelize ORM
- JWT 认证
- bcryptjs 密码加密

### 前端
- Vue 3 (Composition API)
- Vite 7.x
- Element Plus UI
- Vue Router 4
- Pinia 状态管理
- Axios HTTP客户端

### 部署
- Docker & Docker Compose
- Nginx
- Linux/Ubuntu

## 📝 下一步开发

系统已经搭建了完整的基础架构，以下功能可以快速扩展：

### 待开发模块
- [ ] 客户管理模块（列表、详情、360°视图）
- [ ] 商机管理模块（看板、阶段推进）
- [ ] 合同管理模块（创建、审批流程）
- [ ] 订单发货模块
- [ ] 运维服务模块（工单系统）
- [ ] 财务管理模块（收款、发票）
- [ ] 数据统计图表（ECharts集成）
- [ ] 文件上传功能
- [ ] 操作日志记录
- [ ] 通知提醒功能

### 开发步骤参考

**添加新模块的标准流程：**

1. **后端开发**
   - 在 `backend/src/models/` 创建数据模型
   - 在 `backend/src/controllers/` 创建控制器
   - 在 `backend/src/routes/` 创建路由
   - 在 `backend/src/app.js` 注册路由

2. **前端开发**
   - 在 `frontend/src/api/` 创建API封装
   - 在 `frontend/src/views/` 创建页面组件
   - 在 `frontend/src/router/index.js` 配置路由

3. **测试验证**
   - 使用Postman测试API接口
   - 在浏览器中测试前端功能
   - 检查数据库数据正确性

## 🔧 常见问题

### 1. 后端启动失败

**问题：数据库连接失败**
```
解决方法：
1. 检查MySQL服务是否启动
2. 检查.env中的数据库配置
3. 确认数据库和用户已创建
```

### 2. 前端无法连接后端

**问题：API请求失败**
```
解决方法：
1. 确认后端服务已启动（http://localhost:3000）
2. 检查vite.config.js中的proxy配置
3. 查看浏览器控制台的网络请求
```

### 3. Docker启动问题

**问题：端口被占用**
```bash
# 查看端口占用
lsof -i :3000
lsof -i :80

# 修改docker-compose.yml中的端口映射
ports:
  - "8080:80"  # 将80改为8080
```

### 4. 前端页面空白

**问题：路由配置问题**
```
解决方法：
1. 检查router/index.js路由配置
2. 确认组件路径正确
3. 查看浏览器控制台错误信息
```

## 📚 相关文档

- [README.md](./README.md) - 项目总览
- [docs/PRD.md](./docs/PRD.md) - 产品需求文档
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - 详细部署指南
- [docs/API.md](./docs/API.md) - API接口文档
- [database/schema.sql](./database/schema.sql) - 数据库表结构

## 💡 开发提示

### 调试技巧

**后端调试：**
```bash
# 查看后端日志
cd CRM/backend
npm run dev

# 测试API接口
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**前端调试：**
```bash
# 启动开发服务器（带热更新）
cd CRM/frontend
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 数据库管理

```bash
# 进入MySQL容器
docker exec -it crm-mysql mysql -u root -p

# 查看数据库
SHOW DATABASES;
USE smart_hotel_crm;
SHOW TABLES;

# 查看线索数据
SELECT * FROM t_lead LIMIT 10;

# 查看用户数据
SELECT id, username, name, role FROM t_user;
```

## 🎯 成功案例

系统启动成功后，你应该能够：

1. ✅ 使用 admin/admin123 成功登录
2. ✅ 看到数据看板显示统计数据
3. ✅ 创建新的销售线索
4. ✅ 添加跟进记录
5. ✅ 将线索转换为客户
6. ✅ 修改个人密码
7. ✅ 正常退出登录

## 📞 技术支持

如遇到问题：

1. 查看本文档的「常见问题」章节
2. 查看项目的 README.md 和 docs/ 目录
3. 检查控制台和日志输出
4. 提交 GitHub Issue（如有仓库）

---

**祝您使用愉快！** 🎉
