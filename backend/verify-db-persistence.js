const { sequelize } = require('./src/config/database');
const {
  Contract, Shipment, Payment, Invoice, ServiceTicket,
  Lead, Customer, Product, ProductCategory, Quotation
} = require('./src/models');

async function verifyDatabase() {
  try {
    console.log('Starting Database Verification...');

    // Check Contract
    const contracts = await Contract.findAll();
    console.log(`\nFound ${contracts.length} Contracts:`);
    contracts.forEach(c => {
      console.log(`- ID: ${c.contract_id}, No: ${c.contract_no}, CreatedAt: ${c.created_at}, UpdatedAt: ${c.updated_at}`);
      if (!c.created_at) console.error('  ❌ Missing created_at');
      if (!c.contract_no) console.error('  ❌ Missing contract_no');
    });

    // Check Shipment
    const shipments = await Shipment.findAll();
    console.log(`\nFound ${shipments.length} Shipments:`);
    shipments.forEach(s => {
      console.log(`- ID: ${s.shipment_id}, No: ${s.shipment_no}, CreatedAt: ${s.created_at}, UpdatedAt: ${s.updated_at}`);
       if (!s.created_at) console.error('  ❌ Missing created_at');
    });

    // Check Payment
    const payments = await Payment.findAll();
    console.log(`\nFound ${payments.length} Payments:`);
    payments.forEach(p => {
      console.log(`- ID: ${p.payment_id}, No: ${p.payment_no}, CreatedAt: ${p.created_at}, UpdatedAt: ${p.updated_at}`);
       if (!p.created_at) console.error('  ❌ Missing created_at');
    });

    // Check Invoice
    const invoices = await Invoice.findAll();
    console.log(`\nFound ${invoices.length} Invoices:`);
    invoices.forEach(i => {
      console.log(`- ID: ${i.invoice_id}, No: ${i.invoice_no}, CreatedAt: ${i.created_at}, UpdatedAt: ${i.updated_at}`);
       if (!i.created_at) console.error('  ❌ Missing created_at');
    });

    // Check ServiceTicket
    const tickets = await ServiceTicket.findAll();
    console.log(`\nFound ${tickets.length} Service Tickets:`);
    tickets.forEach(t => {
      console.log(`- ID: ${t.ticket_id}, No: ${t.ticket_no}, CreatedAt: ${t.created_at}, UpdatedAt: ${t.updated_at}`);
       if (!t.created_at) console.error('  ❌ Missing created_at');
    });

    // Check newly fixed models specifically
    console.log('\n--- Checking Models with Recent Timestamp Fixes ---');

    // Check Task (if any created)
    const { Task } = require('./src/models');
    try {
        const tasks = await Task.findAll();
        console.log(`Found ${tasks.length} Tasks`);
        tasks.forEach(t => console.log(`- Task CreatedAt: ${t.created_at}`));
    } catch(e) { console.log('Task check skipped or failed'); }

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await sequelize.close();
  }
}

verifyDatabase();
