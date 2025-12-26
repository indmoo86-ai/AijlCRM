# 部署指南

本文档详细说明如何将智慧酒店CRM系统部署到生产服务器。

## 部署架构

```
                     Internet
                        |
                   [防火墙/安全组]
                        |
                   [Nginx:80/443]
                    /          \
          [静态文件]            [反向代理]
                                    |
                              [Backend:3000]
                                    |
                              [MySQL:3306]
```

## 服务器要求

### 最低配置
- CPU: 2核
- 内存: 4GB
- 硬盘: 50GB SSD
- 带宽: 5Mbps

### 推荐配置
- CPU: 4核
- 内存: 8GB
- 硬盘: 100GB SSD
- 带宽: 10Mbps

### 操作系统
- Ubuntu 20.04 LTS (推荐)
- Ubuntu 22.04 LTS
- CentOS 7/8
- Debian 11+

## 部署方式

### 方式一：Docker Compose部署（推荐）

#### 1. 安装Docker

```bash
# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

#### 2. 上传项目文件

```bash
# 在服务器上创建项目目录
mkdir -p /opt/crm
cd /opt/crm

# 上传整个CRM目录到服务器
# 可使用scp、rsync或git clone
```

#### 3. 配置环境变量

```bash
cd /opt/crm/deploy
cp .env.example .env

# 编辑配置文件
nano .env
```

重要配置项：
```env
# 修改数据库密码
DB_ROOT_PASSWORD=your_strong_password_here
DB_USER=crm_user
DB_PASSWORD=another_strong_password_here

# 修改JWT密钥（必须修改！）
JWT_SECRET=your_very_complex_jwt_secret_key_at_least_32_characters
```

#### 4. 启动服务

```bash
cd /opt/crm/deploy

# 首次启动（构建镜像）
docker-compose up -d --build

# 查看启动状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 5. 验证服务

```bash
# 检查MySQL
docker exec crm-mysql mysql -uroot -p -e "SHOW DATABASES;"

# 检查后端
curl http://localhost:3000/health

# 检查前端
curl http://localhost
```

#### 6. 服务管理命令

```bash
# 停止服务
docker-compose stop

# 启动服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 查看日志
docker-compose logs -f [service_name]

# 进入容器
docker exec -it crm-backend sh
docker exec -it crm-mysql bash
```

### 方式二：手动部署

#### 1. 安装依赖

```bash
# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MySQL
sudo apt update
sudo apt install mysql-server -y
sudo mysql_secure_installation

# 安装Nginx
sudo apt install nginx -y
```

#### 2. 配置MySQL

```bash
# 登录MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE smart_hotel_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON smart_hotel_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 导入数据库结构
mysql -u crm_user -p smart_hotel_crm < /opt/crm/database/schema.sql
```

#### 3. 部署后端

```bash
cd /opt/crm/backend

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
nano .env

# 使用PM2管理进程
sudo npm install -g pm2
pm2 start src/app.js --name crm-backend
pm2 save
pm2 startup
```

#### 4. 部署前端

```bash
cd /opt/crm/frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 复制到nginx目录
sudo cp -r dist/* /var/www/crm/
```

#### 5. 配置Nginx

```bash
sudo nano /etc/nginx/sites-available/crm
```

配置内容：
```nginx
server {
    listen 80;
    server_name your_domain.com;

    root /var/www/crm;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL证书配置

### 使用Let's Encrypt免费证书

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your_domain.com

# 自动续期
sudo certbot renew --dry-run
```

证书会自动修改nginx配置，添加HTTPS支持。

## 防火墙配置

### Ubuntu UFW

```bash
# 允许SSH
sudo ufw allow 22/tcp

# 允许HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### CentOS Firewalld

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 数据备份策略

### 自动备份脚本

创建备份脚本：
```bash
sudo nano /opt/crm/backup.sh
```

内容：
```bash
#!/bin/bash
BACKUP_DIR="/opt/crm/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker exec crm-mysql mysqldump -u root -p$DB_ROOT_PASSWORD smart_hotel_crm | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 备份上传文件
docker cp crm-backend:/app/uploads $BACKUP_DIR/uploads_$DATE

# 压缩备份
cd $BACKUP_DIR
tar -czf backup_$DATE.tar.gz db_$DATE.sql.gz uploads_$DATE
rm -rf db_$DATE.sql.gz uploads_$DATE

# 删除30天前的备份
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

设置定时任务：
```bash
sudo chmod +x /opt/crm/backup.sh

# 添加到crontab（每天凌晨2点备份）
sudo crontab -e
0 2 * * * /opt/crm/backup.sh >> /var/log/crm_backup.log 2>&1
```

### 数据恢复

```bash
# 恢复数据库
gunzip < backup_20240101_020000/db_20240101_020000.sql.gz | docker exec -i crm-mysql mysql -u root -p smart_hotel_crm

# 恢复上传文件
docker cp backup_20240101_020000/uploads crm-backend:/app/
```

## 监控与维护

### 日志管理

```bash
# 查看后端日志
docker logs -f crm-backend

# 查看nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看MySQL日志
docker logs -f crm-mysql
```

### 性能监控

```bash
# 安装监控工具
sudo apt install htop iotop -y

# 查看系统资源
htop

# 查看Docker容器资源使用
docker stats

# 查看磁盘使用
df -h
du -sh /var/lib/docker
```

### 数据库优化

```bash
# 进入MySQL容器
docker exec -it crm-mysql mysql -u root -p

# 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';

# 分析表
ANALYZE TABLE t_lead;
ANALYZE TABLE t_customer;

# 优化表
OPTIMIZE TABLE t_lead;
```

## 安全加固

### 1. 修改默认端口

修改`docker-compose.yml`中的端口映射：
```yaml
services:
  mysql:
    ports:
      - "13306:3306"  # 改为非标准端口
```

### 2. 限制访问IP

在nginx配置中添加：
```nginx
# 只允许特定IP访问
allow 1.2.3.4;
deny all;
```

### 3. 启用日志审计

修改后端代码，记录所有敏感操作到`t_operation_log`表。

### 4. 定期更新

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新Docker镜像
cd /opt/crm/deploy
docker-compose pull
docker-compose up -d
```

## 扩容方案

### 水平扩展

使用Docker Swarm或Kubernetes：
- 多个backend实例 + 负载均衡
- MySQL主从复制或集群
- Redis缓存层
- 对象存储（OSS）替代本地文件上传

### 垂直扩展

升级服务器配置：
- 增加CPU核心
- 扩展内存
- 升级到SSD硬盘

## 故障排查

### 常见问题

1. **容器无法启动**
```bash
docker-compose logs [service_name]
docker inspect [container_name]
```

2. **数据库连接失败**
```bash
docker exec -it crm-mysql mysql -u root -p
docker network inspect crm_crm-network
```

3. **前端无法访问后端API**
- 检查nginx配置
- 检查后端服务状态
- 检查防火墙规则

4. **磁盘空间不足**
```bash
# 清理Docker镜像
docker system prune -a

# 清理日志
sudo truncate -s 0 /var/log/nginx/access.log
```

## 联系支持

遇到部署问题，请提供以下信息：
- 操作系统版本
- Docker版本
- 错误日志
- 配置文件（脱敏后）

---

**最后更新**: 2024-12
