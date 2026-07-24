import { RoleName } from '@prisma/client';

export const PERMISSION_MODULES = [
  'users',
  'roles',
  'employees',
  'attendance',
  'leaves',
  'recruitment',
  'crm',
  'projects',
  'tasks',
  'invoices',
  'contracts',
  'tickets',
  'cms',
  'settings',
  'reports',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export interface PermissionSeed {
  name: string;
  module: PermissionModule;
  action: PermissionAction;
  description: string;
}

/**
 * Builds the full `<module>:<action>` permission catalog, e.g. `users:create`.
 */
export function buildPermissionCatalog(): PermissionSeed[] {
  return PERMISSION_MODULES.flatMap((module) =>
    PERMISSION_ACTIONS.map((action) => ({
      name: `${module}:${action}`,
      module,
      action,
      description: `Allows ${action} access to the ${module} module`,
    })),
  );
}

function permissionsFor(
  modules: PermissionModule[],
  actions: PermissionAction[] = [...PERMISSION_ACTIONS],
): string[] {
  return modules.flatMap((module) =>
    actions.map((action) => `${module}:${action}`),
  );
}

const ALL_PERMISSIONS = permissionsFor([...PERMISSION_MODULES]);

/**
 * Maps each role to the list of `<module>:<action>` permission names it
 * should be granted. `SUPER_ADMIN` implicitly gets everything.
 */
export const ROLE_PERMISSION_MAP: Record<RoleName, string[]> = {
  [RoleName.SUPER_ADMIN]: ALL_PERMISSIONS,

  [RoleName.ADMIN]: ALL_PERMISSIONS.filter(
    (permission) =>
      permission !== 'roles:delete' && permission !== 'settings:delete',
  ),

  [RoleName.HR]: [
    ...permissionsFor(['employees', 'attendance', 'leaves', 'recruitment']),
    'users:read',
    'reports:read',
  ],

  [RoleName.SALES]: [
    ...permissionsFor(['crm']),
    'invoices:read',
    'invoices:create',
    'contracts:read',
    'contracts:create',
    'reports:read',
  ],

  [RoleName.PROJECT_MANAGER]: [
    ...permissionsFor(['projects', 'tasks', 'tickets']),
    'employees:read',
    'invoices:read',
    'contracts:read',
    'reports:read',
  ],

  [RoleName.DEVELOPER]: [
    'projects:read',
    'tasks:read',
    'tasks:update',
    'tasks:create',
    'tickets:read',
    'tickets:update',
  ],

  [RoleName.DESIGNER]: [
    'projects:read',
    'tasks:read',
    'tasks:update',
    'tasks:create',
    'tickets:read',
    'tickets:update',
  ],

  [RoleName.QA]: [
    'projects:read',
    'tasks:read',
    'tasks:update',
    'tickets:read',
    'tickets:create',
    'tickets:update',
  ],

  [RoleName.CLIENT]: [
    'invoices:read',
    'contracts:read',
    'projects:read',
    'tickets:create',
    'tickets:read',
  ],
};
