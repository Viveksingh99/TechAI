import { RoleName } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleName;
  roleId: string;
}
