const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '智慧酒店CRM系统 API',
    version: '1.0.0'
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 导入路由模块
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const productRoutes = require('./routes/products');
const quotationRoutes = require('./routes/quotations');
const customerRoutes = require('./routes/customers');
const contractRoutes = require('./routes/contracts');
const taskRoutes = require('./routes/tasks');
const shipmentRoutes = require('./routes/shipments');
const paymentRoutes = require('./routes/payments');
const invoiceRoutes = require('./routes/invoices');
const serviceTicketRoutes = require('./routes/serviceTickets');
const attachmentRoutes = require('./routes/attachments');
const dashboardRoutes = require('./routes/dashboard');

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/service-tickets', serviceTicketRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误'
  });
});

// 启动服务器
const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`\n✓ 服务器运行在: http://localhost:${PORT}`);
      console.log(`✓ 环境: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('✗ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
