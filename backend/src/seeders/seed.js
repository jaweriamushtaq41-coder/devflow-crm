// Seed script: creates roles, permissions, and demo accounts.
// Run with: npm run seed
// Accounts follow the official U Devs brief (section 20.2) plus Accounts role.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Role, Permission, User, Company, Client } = require('../models');

const PERMISSIONS = [
  'users.view', 'users.create', 'users.update',
  'leads.view', 'leads.create', 'leads.update', 'leads.delete',
  'deals.manage',
  'projects.view', 'projects.manage',
  'tasks.assign',
  'requirements.view', 'requirements.manage', 'requirements.approve',
  'invoices.manage', 'invoices.view',
  'tickets.manage', 'tickets.view',
  'reports.view',
  'audit.view',
];

// Role -> permission mapping, derived directly from the brief's Section 4.2 matrix.
const ROLE_PERMISSIONS = {
  'Super Admin': PERMISSIONS, // full access — also bypassed in RBAC middleware
  'Admin / Operations': PERMISSIONS,
  'Sales / Business Developer': ['leads.view', 'leads.create', 'leads.update', 'leads.delete', 'deals.manage', 'projects.view', 'requirements.view', 'invoices.view', 'tickets.view', 'reports.view'],
  'Project Manager': ['leads.view', 'projects.view', 'projects.manage', 'tasks.assign', 'requirements.view', 'requirements.manage', 'invoices.view', 'tickets.view', 'reports.view'],
  'Developer / Team Member': ['projects.view', 'tasks.assign', 'requirements.view', 'invoices.view', 'tickets.view'],
  'Accounts': ['projects.view', 'invoices.manage', 'invoices.view', 'reports.view'],
  'Support Agent': ['projects.view', 'tickets.manage', 'tickets.view', 'reports.view'],
  'Client': [], // scoped entirely via the client-portal controller, not permission keys
};

const DEMO_ACCOUNTS = [
  { name: 'System Admin', email: 'admin@demo.local', role: 'Super Admin' },
  { name: 'Sales Rep', email: 'sales@demo.local', role: 'Sales / Business Developer' },
  { name: 'Project Manager', email: 'pm@demo.local', role: 'Project Manager' },
  { name: 'Developer One', email: 'developer@demo.local', role: 'Developer / Team Member' },
  { name: 'Accounts Officer', email: 'accounts@demo.local', role: 'Accounts' },
  { name: 'Support Agent', email: 'support@demo.local', role: 'Support Agent' },
  { name: 'Demo Client', email: 'client@demo.local', role: 'Client' },
];

const DEMO_PASSWORD = 'Demo@1234'; // fake/demo credential only — never used in production

async function seed() {
  console.log('⏳ Connecting to database...');
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  console.log('⏳ Seeding permissions...');
  const permissionRecords = {};
  for (const key of PERMISSIONS) {
    const [perm] = await Permission.findOrCreate({ where: { key }, defaults: { key, description: key } });
    permissionRecords[key] = perm;
  }

  console.log('⏳ Seeding roles + role-permission mappings...');
  const roleRecords = {};
  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const [role] = await Role.findOrCreate({ where: { name: roleName }, defaults: { name: roleName, description: roleName } });
    roleRecords[roleName] = role;
    const permInstances = perms.map((p) => permissionRecords[p]);
    await role.setPermissions(permInstances);
  }

  console.log('⏳ Seeding demo user accounts...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const account of DEMO_ACCOUNTS) {
    const role = roleRecords[account.role];
    const [user] = await User.findOrCreate({
      where: { email: account.email },
      defaults: {
        name: account.name,
        email: account.email,
        passwordHash,
        roleId: role.id,
        status: 'active',
        isEmailVerified: true,
      },
    });

    // For the demo client account, also create a Company + Client record
    // and link the portal user, so the Client Portal has real data to show.
    if (account.role === 'Client') {
      const [company] = await Company.findOrCreate({
        where: { name: 'Acme Software Buyers Inc.' },
        defaults: { name: 'Acme Software Buyers Inc.', industry: 'Retail', ownerId: null },
      });
      await Client.findOrCreate({
        where: { companyId: company.id },
        defaults: { companyId: company.id, portalUserId: user.id, status: 'active' },
      });
    }
  }

  console.log('\n✅ Seed complete!\n');
  console.log('Demo accounts (password for all: ' + DEMO_PASSWORD + '):');
  DEMO_ACCOUNTS.forEach((a) => console.log(`  - ${a.email}  (${a.role})`));
  console.log('\n⚠️  These are fake demo credentials for local evaluation only.');
  console.log('    Never commit real passwords, SMTP credentials, or production secrets.\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
