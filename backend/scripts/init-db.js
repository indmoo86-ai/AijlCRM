/**
 * 数据库初始化脚本
 * 用于创建表结构并初始化测试数据
 */
const { sequelize } = require('../src/config/database');
const models = require('../src/models');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    console.log('\n开始初始化数据库...\n');

    // 1. 测试连接
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');

    // 2. 同步所有模型（创建表结构）
    console.log('\n同步数据库表结构...');
    await sequelize.sync({ force: true }); // force: true 会删除现有表并重新创建
    console.log('✓ 数据库表结构创建完成');

    // 3. 创建初始数据
    console.log('\n创建初始数据...');

    // 创建角色
    const roles = await models.Role.bulkCreate([
      { role_id: 1, role_name: '系统管理员', role_code: 'admin', description: '系统管理员，拥有所有权限' },
      { role_id: 2, role_name: '营销人员', role_code: 'marketing', description: '负责市场推广和线索获取' },
      { role_id: 3, role_name: '销售人员', role_code: 'sales', description: '负责客户跟进和合同签订' },
      { role_id: 4, role_name: '财务人员', role_code: 'finance', description: '负责收款和开票管理' },
      { role_id: 5, role_name: '运营人员', role_code: 'operations', description: '负责发货和售后服务' }
    ]);
    console.log('✓ 创建了', roles.length, '个角色');

    // 创建权限
    const permissions = await models.Permission.bulkCreate([
      { permission_id: 1, permission_name: '产品管理', permission_code: 'product.manage', module_name: '产品管理', permission_type: 'menu' },
      { permission_id: 2, permission_name: '客户管理', permission_code: 'customer.manage', module_name: '客户管理', permission_type: 'menu' },
      { permission_id: 3, permission_name: '线索管理', permission_code: 'lead.manage', module_name: '线索管理', permission_type: 'menu' },
      { permission_id: 4, permission_name: '报价管理', permission_code: 'quotation.manage', module_name: '报价管理', permission_type: 'menu' },
      { permission_id: 5, permission_name: '合同管理', permission_code: 'contract.manage', module_name: '合同管理', permission_type: 'menu' },
      { permission_id: 6, permission_name: '任务管理', permission_code: 'task.manage', module_name: '任务管理', permission_type: 'menu' },
      { permission_id: 7, permission_name: '发货管理', permission_code: 'shipment.manage', module_name: '发货管理', permission_type: 'menu' },
      { permission_id: 8, permission_name: '收款管理', permission_code: 'payment.manage', module_name: '收款管理', permission_type: 'menu' },
      { permission_id: 9, permission_name: '发票管理', permission_code: 'invoice.manage', module_name: '发票管理', permission_type: 'menu' },
      { permission_id: 10, permission_name: '售后管理', permission_code: 'service.manage', module_name: '售后管理', permission_type: 'menu' }
    ]);
    console.log('✓ 创建了', permissions.length, '个权限');

    // 为系统管理员角色分配所有权限
    const rolePermissions = permissions.map(perm => ({
      role_id: 1,
      permission_id: perm.permission_id
    }));
    await models.RolePermission.bulkCreate(rolePermissions);
    console.log('✓ 为系统管理员分配了所有权限');

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const adminUser = await models.User.create({
      user_id: 1,
      username: 'admin',
      real_name: '系统管理员',
      password: hashedPassword,
      mobile: '13800138000',
      email: 'admin@aijulai.com',
      status: 'active'
    });
    console.log('✓ 创建了管理员账号:', adminUser.username);

    // 为用户分配角色
    await models.UserRole.create({
      user_id: adminUser.user_id,
      role_id: 1
    });
    console.log('✓ 为管理员分配了系统管理员角色');

    // 创建产品分类
    const categories = await models.ProductCategory.bulkCreate([
      { category_id: 1, category_name: '智能门锁', category_code: 'door_lock', description: '酒店客房智能门锁系统' },
      { category_id: 2, category_name: '智能控制系统', category_code: 'control_system', description: '客房智能控制面板和系统' },
      { category_id: 3, category_name: '能源管理系统', category_code: 'energy_system', description: '酒店能源管理和节能系统' },
      { category_id: 4, category_name: '智能照明', category_code: 'smart_lighting', description: '智能照明控制系统' },
      { category_id: 5, category_name: '安防系统', category_code: 'security_system', description: '酒店安防监控系统' }
    ]);
    console.log('✓ 创建了', categories.length, '个产品分类');

    // 创建测试产品
    const products = await models.Product.bulkCreate([
      {
        product_id: 1,
        product_code: 'DL-001',
        product_name: '智能门锁 A1',
        brand: '艾居来',
        category_id: 1,
        supplier: '深圳艾居来科技有限公司',
        cost_price: 350.00,
        sale_price: 580.00,
        unit: '套',
        description: '酒店客房智能门锁，支持IC卡、指纹、密码多种开锁方式',
        status: 'active',
        owner_id: 1,
        created_by: 1
      },
      {
        product_id: 2,
        product_code: 'CS-001',
        product_name: '客房控制面板',
        brand: '艾居来',
        category_id: 2,
        supplier: '深圳艾居来科技有限公司',
        cost_price: 280.00,
        sale_price: 460.00,
        unit: '套',
        description: '7寸触摸屏客房控制面板，可控制灯光、空调、窗帘等设备',
        status: 'active',
        owner_id: 1,
        created_by: 1
      },
      {
        product_id: 3,
        product_code: 'ES-001',
        product_name: '能源管理主机',
        brand: '艾居来',
        category_id: 3,
        supplier: '深圳艾居来科技有限公司',
        cost_price: 1800.00,
        sale_price: 2980.00,
        unit: '台',
        description: '酒店能源管理系统主机，支持200间客房管理',
        status: 'active',
        owner_id: 1,
        created_by: 1
      }
    ]);
    console.log('✓ 创建了', products.length, '个测试产品');

    // 创建客户来源
    const sources = await models.CustomerSource.bulkCreate([
      { source_id: 1, source_name: '线下展会', source_code: 'exhibition', description: '酒店行业展会获客' },
      { source_id: 2, source_name: '网络营销', source_code: 'online_marketing', description: '百度、抖音等网络推广' },
      { source_id: 3, source_name: '老客户推荐', source_code: 'referral', description: '现有客户转介绍' },
      { source_id: 4, source_name: '电话营销', source_code: 'telemarketing', description: '主动电话营销' },
      { source_id: 5, source_name: '其他', source_code: 'other', description: '其他来源' }
    ]);
    console.log('✓ 创建了', sources.length, '个客户来源');

    console.log('\n✅ 数据库初始化完成！\n');
    console.log('📝 测试账号信息：');
    console.log('   用户名: admin');
    console.log('   密码: Admin@123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行初始化
initDatabase();
