/**
 * Models Index - 导出所有模型并定义关联关系
 */

// 基础数据模块 Models
const User = require('./User');
const ProductCategory = require('./ProductCategory');
const Product = require('./Product');
const Customer = require('./Customer');
const CustomerContact = require('./CustomerContact');
const CustomerSource = require('./CustomerSource');
const Lead = require('./Lead');
const FollowUp = require('./FollowUp');
const Role = require('./Role');
const UserRole = require('./UserRole');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const AuditLog = require('./AuditLog');

// 业务流程模块 Models
const Quotation = require('./Quotation');
const QuotationItem = require('./QuotationItem');
const Contract = require('./Contract');
const ContractItem = require('./ContractItem');
const ContractAmendment = require('./ContractAmendment');
const Task = require('./Task');
const TaskTemplate = require('./TaskTemplate');
const TaskNotification = require('./TaskNotification');
const Shipment = require('./Shipment');
const ShipmentItem = require('./ShipmentItem');
const Payment = require('./Payment');
const Invoice = require('./Invoice');
const ServiceTicket = require('./ServiceTicket');
const ServiceTicketLog = require('./ServiceTicketLog');

// =====================================================
// 定义关联关系（基于schema_full.sql外键关系）
// =====================================================

// Product - ProductCategory 关联
Product.belongsTo(ProductCategory, {
  foreignKey: 'category_id',
  as: 'category'
});
ProductCategory.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});

// Customer - CustomerSource 关联
Customer.belongsTo(CustomerSource, {
  foreignKey: 'sourceId',
  as: 'source'
});
CustomerSource.hasMany(Customer, {
  foreignKey: 'sourceId',
  as: 'customers'
});

// CustomerContact - Customer 关联
CustomerContact.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});
Customer.hasMany(CustomerContact, {
  foreignKey: 'customer_id',
  as: 'contacts'
});

// UserRole - User & Role 关联 (多对多)
UserRole.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});
UserRole.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});
User.hasMany(UserRole, {
  foreignKey: 'user_id',
  as: 'userRoles'
});
Role.hasMany(UserRole, {
  foreignKey: 'role_id',
  as: 'roleUsers'
});

// User - Role 多对多关联
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});
Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

// RolePermission - Role & Permission 关联 (多对多)
RolePermission.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});
RolePermission.belongsTo(Permission, {
  foreignKey: 'permission_id',
  as: 'permission'
});
Role.hasMany(RolePermission, {
  foreignKey: 'role_id',
  as: 'rolePermissions'
});
Permission.hasMany(RolePermission, {
  foreignKey: 'permission_id',
  as: 'permissionRoles'
});

// Role - Permission 多对多关联
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

// Lead - User 关联（销售负责人、媒介负责人）
Lead.belongsTo(User, {
  foreignKey: 'salesOwnerId',
  as: 'salesOwner'
});
Lead.belongsTo(User, {
  foreignKey: 'mediaOwnerId',
  as: 'mediaOwner'
});
User.hasMany(Lead, {
  foreignKey: 'salesOwnerId',
  as: 'ownedLeads'
});
Lead.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'createdByUser'
});

// Lead - Customer 关联（推荐人）
Lead.belongsTo(Customer, {
  foreignKey: 'referrerCustomerId',
  as: 'referrer'
});

// Customer - Lead 关联（来源线索）
Customer.belongsTo(Lead, {
  foreignKey: 'sourceLeadId',
  as: 'sourceLead'
});
Lead.hasMany(Customer, {
  foreignKey: 'sourceLeadId',
  as: 'convertedCustomers'
});

// Customer - User 关联（销售负责人）
Customer.belongsTo(User, {
  foreignKey: 'salesOwnerId',
  as: 'salesOwner'
});
User.hasMany(Customer, {
  foreignKey: 'salesOwnerId',
  as: 'ownedCustomers'
});

// FollowUp - User 关联（操作人）
FollowUp.belongsTo(User, {
  foreignKey: 'operatorId',
  as: 'operator'
});
User.hasMany(FollowUp, {
  foreignKey: 'operatorId',
  as: 'followUps'
});

// Task - User 关联（负责人、分配人、拥有者）
Task.belongsTo(User, {
  foreignKey: 'assignee_id',
  as: 'assignee'
});
Task.belongsTo(User, {
  foreignKey: 'assigner_id',
  as: 'assigner'
});
Task.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});
User.hasMany(Task, {
  foreignKey: 'assignee_id',
  as: 'assignedTasks'
});
User.hasMany(Task, {
  foreignKey: 'owner_id',
  as: 'ownedTasks'
});

// Quotation - Customer & Contact 关联
Quotation.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});
Quotation.belongsTo(CustomerContact, {
  foreignKey: 'customer_contact_id',
  as: 'contact'
});
Customer.hasMany(Quotation, {
  foreignKey: 'customer_id',
  as: 'quotations'
});

// Quotation - User 关联（负责人）
Quotation.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});
User.hasMany(Quotation, {
  foreignKey: 'owner_id',
  as: 'ownedQuotations'
});

// QuotationItem - Quotation & Product 关联
QuotationItem.belongsTo(Quotation, {
  foreignKey: 'quotation_id',
  as: 'quotation'
});
QuotationItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});
Quotation.hasMany(QuotationItem, {
  foreignKey: 'quotation_id',
  as: 'items'
});

// Contract - Customer, Contact & Quotation 关联
Contract.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});
Contract.belongsTo(CustomerContact, {
  foreignKey: 'customer_contact_id',
  as: 'contact'
});
Contract.belongsTo(Quotation, {
  foreignKey: 'source_quotation_id',
  as: 'sourceQuotation'
});
Customer.hasMany(Contract, {
  foreignKey: 'customer_id',
  as: 'contracts'
});

// Contract - User 关联（负责人）
Contract.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});
User.hasMany(Contract, {
  foreignKey: 'owner_id',
  as: 'ownedContracts'
});

// ContractItem - Contract & Product 关联
ContractItem.belongsTo(Contract, {
  foreignKey: 'contract_id',
  as: 'contract'
});
ContractItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});
Contract.hasMany(ContractItem, {
  foreignKey: 'contract_id',
  as: 'items'
});

// ContractAmendment - Contract 关联
ContractAmendment.belongsTo(Contract, {
  foreignKey: 'contract_id',
  as: 'contract'
});
Contract.hasMany(ContractAmendment, {
  foreignKey: 'contract_id',
  as: 'amendments'
});

// Shipment - Contract & Customer 关联
Shipment.belongsTo(Contract, {
  foreignKey: 'contract_id',
  as: 'contract'
});
Shipment.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});
Contract.hasMany(Shipment, {
  foreignKey: 'contract_id',
  as: 'shipments'
});

// Shipment - User 关联（负责人）
Shipment.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});
User.hasMany(Shipment, {
  foreignKey: 'owner_id',
  as: 'ownedShipments'
});

// ShipmentItem - Shipment, ContractItem & Product 关联
ShipmentItem.belongsTo(Shipment, {
  foreignKey: 'shipment_id',
  as: 'shipment'
});
ShipmentItem.belongsTo(ContractItem, {
  foreignKey: 'contract_item_id',
  as: 'contractItem'
});
ShipmentItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});
Shipment.hasMany(ShipmentItem, {
  foreignKey: 'shipment_id',
  as: 'items'
});

// Payment - Contract & Customer 关联
Payment.belongsTo(Contract, {
  foreignKey: 'contract_id',
  as: 'contract'
});
Payment.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});
Contract.hasMany(Payment, {
  foreignKey: 'contract_id',
  as: 'payments'
});

// Payment - User 关联（负责人）
Payment.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});
User.hasMany(Payment, {
  foreignKey: 'owner_id',
  as: 'ownedPayments'
});

// Invoice - Contract, Customer & Payment 关联
Invoice.belongsTo(Contract, {
  foreignKey: 'contract_id',
  as: 'contract'
});
Invoice.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});
Invoice.belongsTo(Payment, {
  foreignKey: 'payment_id',
  as: 'payment'
});
Contract.hasMany(Invoice, {
  foreignKey: 'contract_id',
  as: 'invoices'
});

// Invoice - User 关联（负责人）
Invoice.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});
User.hasMany(Invoice, {
  foreignKey: 'owner_id',
  as: 'ownedInvoices'
});

// ServiceTicket - Customer, Contact, Contract & Product 关联
ServiceTicket.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});
ServiceTicket.belongsTo(CustomerContact, {
  foreignKey: 'customer_contact_id',
  as: 'contact'
});
ServiceTicket.belongsTo(Contract, {
  foreignKey: 'contract_id',
  as: 'contract'
});
ServiceTicket.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});
Customer.hasMany(ServiceTicket, {
  foreignKey: 'customer_id',
  as: 'serviceTickets'
});

// ServiceTicketLog - ServiceTicket 关联
ServiceTicketLog.belongsTo(ServiceTicket, {
  foreignKey: 'ticket_id',
  as: 'ticket'
});
ServiceTicket.hasMany(ServiceTicketLog, {
  foreignKey: 'ticket_id',
  as: 'logs'
});

// ServiceTicketLog - User 关联（操作人）
ServiceTicketLog.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'operator'
});
User.hasMany(ServiceTicketLog, {
  foreignKey: 'created_by',
  as: 'ticketLogs'
});

// Product - User 关联（负责人）
Product.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner'
});
User.hasMany(Product, {
  foreignKey: 'owner_id',
  as: 'ownedProducts'
});

// CustomerContact - User 关联（创建人）
CustomerContact.belongsTo(User, {
  foreignKey: 'creator_id',
  as: 'creator'
});
User.hasMany(CustomerContact, {
  foreignKey: 'creator_id',
  as: 'createdContacts'
});

// =====================================================
// 导出所有模型
// =====================================================
module.exports = {
  // 基础数据模块
  User,
  ProductCategory,
  Product,
  Customer,
  CustomerContact,
  CustomerSource,
  Lead,
  FollowUp,
  Role,
  UserRole,
  Permission,
  RolePermission,
  AuditLog,
  // 业务流程模块
  Quotation,
  QuotationItem,
  Contract,
  ContractItem,
  ContractAmendment,
  Task,
  TaskTemplate,
  TaskNotification,
  Shipment,
  ShipmentItem,
  Payment,
  Invoice,
  ServiceTicket,
  ServiceTicketLog
};
