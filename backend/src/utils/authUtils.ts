// src/utils/authUtils.ts
import { User } from '@prisma/client';

/**
 * Fields to select when returning user data to the client
 */
export const PUBLIC_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  provider: true,
} as const;

/**
 * Sanitizes user object by removing sensitive information
 * @param user User object from Prisma (may include auth fields)
 * @returns User object without sensitive data
 */
export function sanitizeUser(user: User | null): Omit<User, 'authId'> | null {
  if (!user) return null;

  // Create a new object without auth-related fields
  const { authId, ...safeUser } = user;
  return safeUser;
}

// Export all utilities as named exports
export const authUtils = {
  PUBLIC_USER_FIELDS,
  sanitizeUser,
};
