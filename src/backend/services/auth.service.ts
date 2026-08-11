import { firebaseAuth } from '../config/firebase';
import prisma from '../config/prisma';
import { Role } from '@prisma/client';

export const syncUser = async (
  firebaseUid: string,
  email: string,
  name: string,
  avatarUrl: string,
  requestedRole?: string
) => {
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { firebaseUid } });
  if (existing) return existing;

  // Determine initial role — never allow self-promotion to ADMIN via this endpoint
  let initialRole: Role = Role.FARMER;
  if (requestedRole && Object.values(Role).includes(requestedRole as Role) && requestedRole !== 'ADMIN') {
    initialRole = requestedRole as Role;
  }

  return prisma.user.create({
    data: {
      firebaseUid,
      email,
      name: name || null,
      avatarUrl: avatarUrl || null,
      role: initialRole,
    },
  });
};
