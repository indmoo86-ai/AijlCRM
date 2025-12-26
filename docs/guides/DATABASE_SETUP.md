# 数据库设置指南

## 方案一：使用 Docker 运行 MySQL（推荐）

### 1. 启动 Docker Desktop
确保 Docker Desktop 已安装并正在运行。

### 2. 创建并启动 MySQL 容器

```bash
# 创建并启动 MySQL 8.0 容器
docker run -d \
  --name aijulai-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=aijulai_crm \
  -p 3306:3306 \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 等待 MySQL 启动（约 30 秒）
docker logs -f aijulai-mysql
# 看到 "ready for connections" 后按 Ctrl+C 退出日志查看
```

### 3. 更新 .env 配置

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aijulai_crm
DB_USER=root
DB_PASSWORD=your_password  # 与上面 MYSQL_ROOT_PASSWORD 一致
```

### 4. 执行数据库初始化

#### 方法 A：使用 SQL 脚本（推荐，完整约束）

```bash
# 进入 MySQL 容器
docker exec -it aijulai-mysql mysql -uroot -pyour_password

# 在 MySQL 命令行中执行：
source /path/to/CRM/database/schema_full.sql;
exit;
```

或者从宿主机直接执行：

```bash
docker exec -i aijulai-mysql mysql -uroot -pyour_password < /Users/robin/claude\ code/CRM/database/schema_full.sql
```

#### 方法 B：使用 Sequelize Sync（快速，但缺少部分约束）

```bash
cd /Users/robin/claude\ code/CRM/backend
node scripts/init-database.js
```

**注意**: Sequelize sync 不会创建某些复杂约束（如 CHECK 约束），建议使用方法 A。

### 5. 验证数据库

```bash
# 连接数据库
docker exec -it aijulai-mysql mysql -uroot -pyour_password aijulai_crm

# 查看所有表
SHOW TABLES;

# 查看具体表结构
DESC product;
DESC customer;
DESC contract;
```

### 6. 日常使用命令

```bash
# 启动容器
docker start aijulai-mysql

# 停止容器
docker stop aijulai-mysql

# 查看容器状态
docker ps -a --filter name=aijulai-mysql

# 删除容器（会丢失所有数据）
docker rm -f aijulai-mysql
```

---

## 方案二：使用本地 MySQL

### 1. 安装 MySQL

**macOS (Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**macOS (官方安装包):**
从 [MySQL 官网](https://dev.mysql.com/downloads/mysql/) 下载安装包

### 2. 创建数据库

```bash
# 连接 MySQL
mysql -uroot -p

# 创建数据库
CREATE DATABASE aijulai_crm DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 3. 执行 SQL 脚本

```bash
mysql -uroot -p aijulai_crm < /Users/robin/claude\ code/CRM/database/schema_full.sql
```

### 4. 更新 .env 配置

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aijulai_crm
DB_USER=root
DB_PASSWORD=your_mysql_password
```

---

## 验证数据库连接

创建测试脚本 `backend/test-db-connection.js`:

```javascript
require('dotenv').config();
const { sequelize, testConnection } = require('./src/config/database');

testConnection().then(() => {
  sequelize.close();
});
```

运行测试：

```bash
cd /Users/robin/claude\ code/CRM/backend
node test-db-connection.js
```

应该看到：`✓ 数据库连接成功`

---

## 数据表清单（27 张表）

### 基础数据模块（12 张表）
1. `product_category` - 产品分类
2. `product` - 产品 SKU
3. `customer_source` - 客户来源渠道
4. `customer_contact` - 客户联系人
5. `customer` - 客户主表
6. `user` - 系统用户
7. `role` - 角色
8. `permission` - 权限
9. `user_role` - 用户角色关联
10. `role_permission` - 角色权限关联
11. `department` - 部门组织
12. `attachment` - 附件管理

### 业务模块（15 张表）
13. `lead` - 销售线索
14. `lead_follow_up` - 跟进记录
15. `quotation` - 报价单
16. `quotation_item` - 报价明细
17. `contract` - 合同
18. `contract_item` - 合同明细
19. `contract_amendment` - 合同变更
20. `task` - 任务
21. `shipment` - 发货单
22. `shipment_item` - 发货明细
23. `payment` - 收款记录
24. `invoice` - 发票
25. `service_ticket` - 售后工单
26. `service_ticket_log` - 工单操作日志
27. `notification` - 系统通知

---

## 常见问题

### Q1: 数据库连接失败
- 检查 MySQL 服务是否启动
- 检查 .env 中的密码是否正确
- 检查端口 3306 是否被占用

### Q2: Sequelize sync 与 SQL 脚本的区别
- **SQL 脚本**: 包含完整的约束、索引、外键，推荐用于生产环境
- **Sequelize sync**: 快速创建基本表结构，适合开发测试

### Q3: 如何重置数据库
```bash
# 删除并重新创建数据库
docker exec -it aijulai-mysql mysql -uroot -pyour_password -e "DROP DATABASE IF EXISTS aijulai_crm; CREATE DATABASE aijulai_crm DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 重新执行 SQL 脚本
docker exec -i aijulai-mysql mysql -uroot -pyour_password aijulai_crm < /Users/robin/claude\ code/CRM/database/schema_full.sql
```

### Q4: 密码中包含特殊字符
如果密码包含 `$`, `!`, `@` 等字符，在 shell 命令中需要用引号包裹：
```bash
docker exec -it aijulai-mysql mysql -uroot -p'My$ecret!' aijulai_crm
```

---

## 创建种子数据（可选）

数据库表创建完成后，可以运行种子数据脚本创建初始数据：

```bash
cd /Users/robin/claude\ code/CRM/backend
node scripts/seed-data.js
```

种子数据包括：
- **3个初始用户**:
  - 管理员 (admin / admin123)
  - 销售人员 (sales001 / sales123)
  - 销售主管 (manager001 / manager123)
- **6个系统角色**: 管理员、销售主管、销售、新媒体运营、财务、运维
- **40+ 权限项**: 覆盖线索、客户、产品、报价、合同等所有模块
- **6个产品分类**: 智能门锁、控制系统、电视系统等
- **3个示例产品**: 含成本价和销售价
- **10个客户来源渠道**: 官网、微信、展会、转介绍等

---

## 下一步

数据库设置完成后，继续执行：
1. ✓ 数据库初始化
2. ✓ 完善 Model 关联关系
3. ✓ 实现 Controllers 中的 TODO 逻辑
4. ✓ 创建种子数据（可选）
5. **API 测试与验证**
