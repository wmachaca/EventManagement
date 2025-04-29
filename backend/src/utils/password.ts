// src/utils/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

interface HashResult {
  hash: string;
  salt: string;
}

/**
 * Hashes a password with bcrypt
 * @param password Plain text password to hash
 * @returns Promise resolving to hash and salt
 */
export async function hashPassword(password: string): Promise<HashResult> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  console.log('Generated Salt:', salt); // Debug log
  console.log('Generated Hash:', hash);
  return { hash, salt };
}

/**
 * Verifies a password against a hash
 * @param candidatePassword Plain text password to verify
 * @param hash Hash to compare against
 * @returns Promise resolving to boolean indicating match
 */
export async function verifyPassword(
  candidatePassword: string,
  hash: string | null | undefined
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(candidatePassword, hash);
}

// Option 1: Named exports (recommended)
export const passwordUtils = {
  hashPassword,
  verifyPassword,
};
