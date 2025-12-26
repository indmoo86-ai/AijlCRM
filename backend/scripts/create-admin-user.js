/**
 * Create Admin User Script
 */
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      password: '123456', // Will be hashed by beforeCreate hook
      name: '系统管理员',
      phone: '13800138000',
      email: 'admin@aijulai.com',
      role: 6, // 6=管理员
      department: '技术部',
      status: 1 // 1=正常
    });

    console.log('✓ Admin user created successfully');
    console.log('  Username: admin');
    console.log('  Password: 123456');
    console.log('  ID:', admin.id);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin user:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdminUser();
