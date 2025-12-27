/**
 * 数据库种子数据脚本
 * 创建初始用户、角色、权限、产品分类、客户来源等基础数据
 *
 * 使用方法：
 * 1. 确保数据库已初始化（运行过 init-database.js）
 * 2. 运行: node backend/scripts/seed-data.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sequelize } = require('../src/config/database');

// 导入所有模型
const models = require('../src/models/index');
const { User, Role, Permission, RolePermission, UserRole, ProductCategory, Product, CustomerSource } = models;

/**
 * 创建系统角色
 */
const createRoles = async () => {
  console.log('创建系统角色...');

  const roles = [
    { role_code: 'admin', role_name: '系统管理员', description: '拥有系统全部权限', sort_order: 1 },
    { role_code: 'sales_manager', role_name: '销售主管', description: '管理销售团队，查看所有销售数据', sort_order: 2 },
    { role_code: 'sales', role_name: '销售人员', description: '管理线索、客户、报价、合同', sort_order: 3 },
    { role_code: 'media_operator', role_name: '新媒体运营', description: '管理线索和跟进', sort_order: 4 },
    { role_code: 'finance', role_name: '财务人员', description: '管理收款、发票', sort_order: 5 },
    { role_code: 'operation', role_name: '运维人员', description: '管理发货、售后', sort_order: 6 }
  ];

  const createdRoles = [];
  for (const roleData of roles) {
    const [role] = await Role.findOrCreate({
      where: { role_code: roleData.role_code },
      defaults: roleData
    });
    createdRoles.push(role);
    console.log(`  ✓ ${role.role_name} (${role.role_code})`);
  }

  return createdRoles;
};

/**
 * 创建系统权限
 */
const createPermissions = async () => {
  console.log('\n创建系统权限...');

  const permissions = [
    // 线索管理
    { permission_code: 'lead:view', permission_name: '查看线索', module: '线索管理' },
    { permission_code: 'lead:create', permission_name: '创建线索', module: '线索管理' },
    { permission_code: 'lead:edit', permission_name: '编辑线索', module: '线索管理' },
    { permission_code: 'lead:delete', permission_name: '删除线索', module: '线索管理' },
    { permission_code: 'lead:transfer', permission_name: '转移线索', module: '线索管理' },

    // 客户管理
    { permission_code: 'customer:view', permission_name: '查看客户', module: '客户管理' },
    { permission_code: 'customer:create', permission_name: '创建客户', module: '客户管理' },
    { permission_code: 'customer:edit', permission_name: '编辑客户', module: '客户管理' },
    { permission_code: 'customer:delete', permission_name: '删除客户', module: '客户管理' },
    { permission_code: 'customer:transfer', permission_name: '转移客户', module: '客户管理' },

    // 产品管理
    { permission_code: 'product:view', permission_name: '查看产品', module: '产品管理' },
    { permission_code: 'product:create', permission_name: '创建产品', module: '产品管理' },
    { permission_code: 'product:edit', permission_name: '编辑产品', module: '产品管理' },
    { permission_code: 'product:delete', permission_name: '删除产品', module: '产品管理' },

    // 报价管理
    { permission_code: 'quotation:view', permission_name: '查看报价', module: '报价管理' },
    { permission_code: 'quotation:create', permission_name: '创建报价', module: '报价管理' },
    { permission_code: 'quotation:edit', permission_name: '编辑报价', module: '报价管理' },
    { permission_code: 'quotation:approve', permission_name: '审批报价', module: '报价管理' },

    // 合同管理
    { permission_code: 'contract:view', permission_name: '查看合同', module: '合同管理' },
    { permission_code: 'contract:create', permission_name: '创建合同', module: '合同管理' },
    { permission_code: 'contract:edit', permission_name: '编辑合同', module: '合同管理' },
    { permission_code: 'contract:sign', permission_name: '签署合同', module: '合同管理' },

    // 发货管理
    { permission_code: 'shipment:view', permission_name: '查看发货', module: '发货管理' },
    { permission_code: 'shipment:create', permission_name: '创建发货单', module: '发货管理' },
    { permission_code: 'shipment:confirm', permission_name: '确认发货', module: '发货管理' },

    // 收款管理
    { permission_code: 'payment:view', permission_name: '查看收款', module: '收款管理' },
    { permission_code: 'payment:create', permission_name: '创建收款记录', module: '收款管理' },
    { permission_code: 'payment:confirm', permission_name: '确认收款', module: '收款管理' },

    // 发票管理
    { permission_code: 'invoice:view', permission_name: '查看发票', module: '发票管理' },
    { permission_code: 'invoice:create', permission_name: '创建发票', module: '发票管理' },
    { permission_code: 'invoice:confirm', permission_name: '开具发票', module: '发票管理' },

    // 售后管理
    { permission_code: 'service:view', permission_name: '查看工单', module: '售后管理' },
    { permission_code: 'service:create', permission_name: '创建工单', module: '售后管理' },
    { permission_code: 'service:handle', permission_name: '处理工单', module: '售后管理' },

    // 系统管理
    { permission_code: 'user:view', permission_name: '查看用户', module: '系统管理' },
    { permission_code: 'user:create', permission_name: '创建用户', module: '系统管理' },
    { permission_code: 'user:edit', permission_name: '编辑用户', module: '系统管理' },
    { permission_code: 'role:manage', permission_name: '管理角色权限', module: '系统管理' }
  ];

  const createdPermissions = [];
  for (const permData of permissions) {
    // Convert 'module' to 'module_name' and add permission_type
    const permissionData = {
      ...permData,
      module_name: permData.module,
      permission_type: 'action'
    };
    delete permissionData.module;

    const [permission] = await Permission.findOrCreate({
      where: { permission_code: permissionData.permission_code },
      defaults: permissionData
    });
    createdPermissions.push(permission);
  }

  console.log(`  ✓ 已创建 ${createdPermissions.length} 个权限`);
  return createdPermissions;
};

/**
 * 分配角色权限
 */
const assignRolePermissions = async (roles, permissions) => {
  console.log('\n分配角色权限...');

  // 权限分组
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module_name]) acc[perm.module_name] = [];
    acc[perm.module_name].push(perm);
    return acc;
  }, {});

  // 管理员 - 所有权限
  const adminRole = roles.find(r => r.role_code === 'admin');
  for (const perm of permissions) {
    await RolePermission.findOrCreate({
      where: { role_id: adminRole.role_id, permission_id: perm.permission_id },
      defaults: { role_id: adminRole.role_id, permission_id: perm.permission_id, creator_id: 1 }
    });
  }
  console.log(`  ✓ 系统管理员: ${permissions.length} 个权限`);

  // 销售主管 - 除系统管理外的所有权限
  const salesManagerRole = roles.find(r => r.role_code === 'sales_manager');
  const salesManagerPerms = permissions.filter(p => p.module_name !== '系统管理');
  for (const perm of salesManagerPerms) {
    await RolePermission.findOrCreate({
      where: { role_id: salesManagerRole.role_id, permission_id: perm.permission_id },
      defaults: { role_id: salesManagerRole.role_id, permission_id: perm.permission_id, creator_id: 1 }
    });
  }
  console.log(`  ✓ 销售主管: ${salesManagerPerms.length} 个权限`);

  // 销售人员 - 线索、客户、产品、报价、合同权限
  const salesRole = roles.find(r => r.role_code === 'sales');
  const salesPerms = permissions.filter(p =>
    ['线索管理', '客户管理', '产品管理', '报价管理', '合同管理'].includes(p.module_name)
  );
  for (const perm of salesPerms) {
    await RolePermission.findOrCreate({
      where: { role_id: salesRole.role_id, permission_id: perm.permission_id },
      defaults: { role_id: salesRole.role_id, permission_id: perm.permission_id, creator_id: 1 }
    });
  }
  console.log(`  ✓ 销售人员: ${salesPerms.length} 个权限`);

  // 新媒体运营 - 线索管理权限
  const mediaRole = roles.find(r => r.role_code === 'media_operator');
  const mediaPerms = permissions.filter(p => p.module_name === '线索管理');
  for (const perm of mediaPerms) {
    await RolePermission.findOrCreate({
      where: { role_id: mediaRole.role_id, permission_id: perm.permission_id },
      defaults: { role_id: mediaRole.role_id, permission_id: perm.permission_id, creator_id: 1 }
    });
  }
  console.log(`  ✓ 新媒体运营: ${mediaPerms.length} 个权限`);

  // 财务人员 - 收款、发票权限（含查看合同）
  const financeRole = roles.find(r => r.role_code === 'finance');
  const financePerms = permissions.filter(p =>
    ['收款管理', '发票管理'].includes(p.module_name) || p.permission_code === 'contract:view'
  );
  for (const perm of financePerms) {
    await RolePermission.findOrCreate({
      where: { role_id: financeRole.role_id, permission_id: perm.permission_id },
      defaults: { role_id: financeRole.role_id, permission_id: perm.permission_id, creator_id: 1 }
    });
  }
  console.log(`  ✓ 财务人员: ${financePerms.length} 个权限`);

  // 运维人员 - 发货、售后权限（含查看合同）
  const operationRole = roles.find(r => r.role_code === 'operation');
  const operationPerms = permissions.filter(p =>
    ['发货管理', '售后管理'].includes(p.module_name) || p.permission_code === 'contract:view'
  );
  for (const perm of operationPerms) {
    await RolePermission.findOrCreate({
      where: { role_id: operationRole.role_id, permission_id: perm.permission_id },
      defaults: { role_id: operationRole.role_id, permission_id: perm.permission_id, creator_id: 1 }
    });
  }
  console.log(`  ✓ 运维人员: ${operationPerms.length} 个权限`);
};

/**
 * 创建初始用户
 */
const createUsers = async (roles) => {
  console.log('\n创建初始用户...');

  const users = [
    {
      username: 'admin',
      password: 'admin123',
      name: '系统管理员',
      email: 'admin@aijulai.com',
      phone: '13800000000',
      role: 6,
      department: '管理部',
      roleCode: 'admin'
    },
    {
      username: 'sales001',
      password: 'sales123',
      name: '张销售',
      email: 'zhangxs@aijulai.com',
      phone: '13800000001',
      role: 1,
      department: '销售部',
      roleCode: 'sales'
    },
    {
      username: 'manager001',
      password: 'manager123',
      name: '李主管',
      email: 'lizg@aijulai.com',
      phone: '13800000002',
      role: 3,
      department: '销售部',
      roleCode: 'sales_manager'
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const roleCode = userData.roleCode;
    delete userData.roleCode;

    const [user] = await User.findOrCreate({
      where: { username: userData.username },
      defaults: userData
    });
    createdUsers.push(user);

    // 分配角色
    const role = roles.find(r => r.role_code === roleCode);
    if (role) {
      await UserRole.findOrCreate({
        where: { user_id: user.id, role_id: role.role_id },
        defaults: { user_id: user.id, role_id: role.role_id, creator_id: 1 }
      });
    }

    console.log(`  ✓ ${user.name} (${user.username}) - ${roleCode}`);
  }

  return createdUsers;
};

/**
 * 创建产品分类
 */
const createProductCategories = async () => {
  console.log('\n创建产品分类...');

  const categories = [
    { category_code: 'smart_lock', category_name: '智能门锁', sort_order: 1, description: '客房智能门锁系统', creator_id: 1 },
    { category_code: 'smart_control', category_name: '智能控制系统', sort_order: 2, description: '客房灯光空调控制', creator_id: 1 },
    { category_code: 'hotel_tv', category_name: '酒店电视系统', sort_order: 3, description: '智能电视及互动系统', creator_id: 1 },
    { category_code: 'voice_control', category_name: '语音控制设备', sort_order: 4, description: '智能音箱及语音助手', creator_id: 1 },
    { category_code: 'iot_sensor', category_name: '物联网传感器', sort_order: 5, description: '温湿度、人体感应等传感器', creator_id: 1 },
    { category_code: 'access_control', category_name: '门禁系统', sort_order: 6, description: '大堂及员工通道门禁', creator_id: 1 }
  ];

  const createdCategories = [];
  for (const catData of categories) {
    const [category] = await ProductCategory.findOrCreate({
      where: { category_code: catData.category_code },
      defaults: catData
    });
    createdCategories.push(category);
    console.log(`  ✓ ${category.category_name}`);
  }

  return createdCategories;
};

/**
 * 创建示例产品
 */
const createSampleProducts = async (categories) => {
  console.log('\n创建示例产品...');

  const smartLockCat = categories.find(c => c.category_code === 'smart_lock');
  const smartControlCat = categories.find(c => c.category_code === 'smart_control');

  const products = [
    {
      product_code: 'SL-001',
      product_name: '酒店智能门锁 Pro',
      brand: '艾居来',
      category_id: smartLockCat.category_id,
      supplier: '深圳智能科技有限公司',
      cost_price: 580.00,
      sale_price: 880.00,
      unit: '套',
      description: '支持刷卡、密码、蓝牙、远程开锁，含网关',
      status: 'active',
      created_by: 1
    },
    {
      product_code: 'SC-001',
      product_name: '客房智能控制面板',
      brand: '艾居来',
      category_id: smartControlCat.category_id,
      supplier: '广州控制系统公司',
      cost_price: 320.00,
      sale_price: 520.00,
      unit: '台',
      description: '7寸触控屏，控制灯光、空调、窗帘',
      status: 'active',
      created_by: 1
    },
    {
      product_code: 'SL-002',
      product_name: '酒店智能门锁 标准版',
      brand: '艾居来',
      category_id: smartLockCat.category_id,
      supplier: '深圳智能科技有限公司',
      cost_price: 380.00,
      sale_price: 580.00,
      unit: '套',
      description: '支持刷卡、密码开锁',
      status: 'active',
      created_by: 1
    }
  ];

  const createdProducts = [];
  for (const prodData of products) {
    const [product] = await Product.findOrCreate({
      where: { product_code: prodData.product_code },
      defaults: prodData
    });
    createdProducts.push(product);
    console.log(`  ✓ ${product.product_name} (¥${product.sale_price})`);
  }

  return createdProducts;
};

/**
 * 创建客户来源渠道
 */
const createCustomerSources = async () => {
  console.log('\n创建客户来源渠道...');

  const sources = [
    { source_code: 'website', source_name: '官网咨询', sort_order: 1, description: '通过官网留言或在线咨询' },
    { source_code: 'wechat', source_name: '微信公众号', sort_order: 2, description: '微信公众号后台咨询' },
    { source_code: 'phone', source_name: '电话咨询', sort_order: 3, description: '400电话或直接拨打' },
    { source_code: 'exhibition', source_name: '展会', sort_order: 4, description: '酒店用品展、智能家居展' },
    { source_code: 'referral', source_name: '客户转介绍', sort_order: 5, description: '老客户推荐' },
    { source_code: 'bd', source_name: '商务拓展', sort_order: 6, description: 'BD主动开发' },
    { source_code: 'ad_baidu', source_name: '百度推广', sort_order: 7, description: '百度搜索广告' },
    { source_code: 'ad_toutiao', source_name: '今日头条', sort_order: 8, description: '头条信息流广告' },
    { source_code: 'partner', source_name: '合作伙伴', sort_order: 9, description: '渠道合作伙伴推荐' },
    { source_code: 'other', source_name: '其他', sort_order: 99, description: '其他未分类渠道' }
  ];

  const createdSources = [];
  for (const sourceData of sources) {
    const [source] = await CustomerSource.findOrCreate({
      where: { source_code: sourceData.source_code },
      defaults: sourceData
    });
    createdSources.push(source);
    console.log(`  ✓ ${source.source_name}`);
  }

  return createdSources;
};

/**
 * 主函数
 */
const seedDatabase = async () => {
  try {
    console.log('\n=====================================');
    console.log('  艾居来 CRM - 种子数据初始化');
    console.log('=====================================\n');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');

    // 1. 创建角色
    const roles = await createRoles();

    // 2. 创建权限
    const permissions = await createPermissions();

    // 3. 分配角色权限
    await assignRolePermissions(roles, permissions);

    // 4. 创建用户
    const users = await createUsers(roles);

    // 5. 创建产品分类
    const categories = await createProductCategories();

    // 6. 创建示例产品
    const products = await createSampleProducts(categories);

    // 7. 创建客户来源
    const sources = await createCustomerSources();

    console.log('\n=====================================');
    console.log('  种子数据初始化完成！');
    console.log('=====================================\n');

    console.log('数据统计:');
    console.log(`  - 角色: ${roles.length} 个`);
    console.log(`  - 权限: ${permissions.length} 个`);
    console.log(`  - 用户: ${users.length} 个`);
    console.log(`  - 产品分类: ${categories.length} 个`);
    console.log(`  - 产品: ${products.length} 个`);
    console.log(`  - 客户来源: ${sources.length} 个`);

    console.log('\n登录信息:');
    console.log('  管理员 - 用户名: admin, 密码: admin123');
    console.log('  销售   - 用户名: sales001, 密码: sales123');
    console.log('  主管   - 用户名: manager001, 密码: manager123\n');

  } catch (error) {
    console.error('\n✗ 种子数据初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// 执行初始化
seedDatabase();
