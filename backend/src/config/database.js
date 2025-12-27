const { Sequelize } = require('sequelize');
require('dotenv').config();

// 根据环境选择数据库
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const useTestDB = process.env.USE_TEST_DB === 'true' || isDevelopment;

let sequelize;

if (useTestDB) {
  // 使用SQLite进行开发和测试
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false, // 关闭SQL日志以保持输出清晰
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  });
  console.log('✓ 使用SQLite数据库进行开发/测试');
} else {
  // 生产环境使用MySQL
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      timezone: '+08:00',
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    }
  );
}

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');
  } catch (error) {
    console.error('✗ 数据库连接失败:', error.message);
  }
};

module.exports = { sequelize, testConnection };
