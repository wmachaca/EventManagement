// tests/fixtures/users.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const testPassword = 'TestPass123!';

export default {
  validRegistration: {
    name: 'Test User',
    email: 'test@example.com',
    password: testPassword,
    confirmPassword: testPassword,
  },
  invalidRegistration: {
    name: '',
    email: 'bad-email',
    password: '123',
    confirmPassword: '123',
  },
  validLogin: {
    email: 'test@example.com',
    password: testPassword,
  },
  invalidLogin: {
    email: 'test@example.com',
    password: 'wrongpassword',
  },
  existingUser: {
    name: 'Existing User',
    email: 'existing@example.com',
    provider: 'credentials',
    auth: {
      password: bcrypt.hashSync(testPassword, SALT_ROUNDS),
      salt: bcrypt.genSaltSync(SALT_ROUNDS),
    },
  },
};