import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { buildPermissionCatalog, ROLE_PERMISSION_MAP } from './permissions';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const SUPER_ADMIN_EMAIL =
  process.env.SEED_SUPER_ADMIN_EMAIL ?? 'admin@techai.com';
const SUPER_ADMIN_PASSWORD =
  process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'Admin@12345';

async function seedRolesAndPermissions(): Promise<Map<RoleName, string>> {
  console.log('Seeding roles...');

  const roleIdByName = new Map<RoleName, string>();

  for (const roleName of Object.values(RoleName)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName.replace(/_/g, ' ')} role`,
      },
    });
    roleIdByName.set(roleName, role.id);
  }

  console.log('Seeding permissions...');

  const catalog = buildPermissionCatalog();
  const permissionIdByName = new Map<string, string>();

  for (const permission of catalog) {
    const created = await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        module: permission.module,
        action: permission.action,
        description: permission.description,
      },
      create: permission,
    });
    permissionIdByName.set(permission.name, created.id);
  }

  console.log('Linking role permissions...');

  for (const [roleName, permissionNames] of Object.entries(
    ROLE_PERMISSION_MAP,
  )) {
    const roleId = roleIdByName.get(roleName as RoleName);
    if (!roleId) continue;

    for (const permissionName of permissionNames) {
      const permissionId = permissionIdByName.get(permissionName);
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  return roleIdByName;
}

async function seedUsers(roleIdByName: Map<RoleName, string>): Promise<void> {
  console.log('Seeding users...');

  const superAdminRoleId = roleIdByName.get(RoleName.SUPER_ADMIN)!;
  const hashedSuperAdminPassword = await bcrypt.hash(
    SUPER_ADMIN_PASSWORD,
    SALT_ROUNDS,
  );

  const superAdmin = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {},
    create: {
      email: SUPER_ADMIN_EMAIL,
      password: hashedSuperAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: superAdminRoleId,
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(
    `  ✔ Super admin ready: ${superAdmin.email} / ${SUPER_ADMIN_PASSWORD}`,
  );

  const demoAccounts: Array<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: RoleName;
    employee?: {
      employeeCode: string;
      department: string;
      designation: string;
    };
  }> = [
    {
      email: 'client@techai.com',
      password: 'Client@12345',
      firstName: 'Demo',
      lastName: 'Client',
      role: RoleName.CLIENT,
    },
    {
      email: 'pm@techai.com',
      password: 'Manager@12345',
      firstName: 'Priya',
      lastName: 'Manager',
      role: RoleName.PROJECT_MANAGER,
      employee: {
        employeeCode: 'TAI-PM-001',
        department: 'Delivery',
        designation: 'Project Manager',
      },
    },
    {
      email: 'developer@techai.com',
      password: 'Developer@12345',
      firstName: 'Dev',
      lastName: 'Engineer',
      role: RoleName.DEVELOPER,
      employee: {
        employeeCode: 'TAI-DEV-001',
        department: 'Engineering',
        designation: 'Software Engineer',
      },
    },
  ];

  for (const account of demoAccounts) {
    const roleId = roleIdByName.get(account.role);
    if (!roleId) continue;

    const hashedPassword = await bcrypt.hash(account.password, SALT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        password: hashedPassword,
        firstName: account.firstName,
        lastName: account.lastName,
        roleId,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    if (account.employee) {
      await prisma.employee.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          employeeCode: account.employee.employeeCode,
          department: account.employee.department,
          designation: account.employee.designation,
          dateOfJoining: new Date(),
        },
      });
    }

    console.log(
      `  ✔ Demo ${account.role} ready: ${user.email} / ${account.password}`,
    );
  }
}

async function seedLeaveTypes(): Promise<void> {
  console.log('Seeding leave types...');

  const leaveTypes = [
    { name: 'Casual Leave', daysPerYear: 12, isPaid: true },
    { name: 'Sick Leave', daysPerYear: 10, isPaid: true },
    { name: 'Earned Leave', daysPerYear: 15, isPaid: true },
    { name: 'Unpaid Leave', daysPerYear: 0, isPaid: false },
  ];

  for (const leaveType of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { name: leaveType.name },
      update: {},
      create: leaveType,
    });
  }
}

async function seedPipelineStages(): Promise<void> {
  console.log('Seeding CRM pipeline stages...');

  const stages = [
    { name: 'New', order: 1, probability: 10 },
    { name: 'Qualified', order: 2, probability: 30 },
    { name: 'Proposal Sent', order: 3, probability: 50 },
    { name: 'Negotiation', order: 4, probability: 70 },
    { name: 'Won', order: 5, probability: 100 },
    { name: 'Lost', order: 6, probability: 0 },
  ];

  for (const stage of stages) {
    await prisma.pipelineStage.upsert({
      where: { name: stage.name },
      update: {},
      create: stage,
    });
  }
}

async function main(): Promise<void> {
  console.log('🌱 Starting TechAI database seed...');

  const roleIdByName = await seedRolesAndPermissions();
  await seedUsers(roleIdByName);
  await seedLeaveTypes();
  await seedPipelineStages();

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
