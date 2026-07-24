import { SetMetadata } from '@nestjs/common';
import { RoleName } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route (or controller) to the given roles. Must be combined
 * with `JwtAuthGuard` and `RolesGuard`.
 *
 * @example @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
