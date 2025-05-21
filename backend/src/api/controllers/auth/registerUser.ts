import type { Request, Response } from 'express';
import { hashPassword } from '../../../utils/password';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../database/client';
import { z } from 'zod';

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET is not defined in .env');
}

// Zod validation schema (modern alternative to Joi)
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  email: z.string().email('Invalid email format').max(100, 'Email cannot exceed 100 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 8 characters')
    .max(20, 'Password cannot exceed 100 characters'),
  // .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  // .regex(/[a-z]/, "Must contain at least one lowercase letter")
  // .regex(/[0-9]/, "Must contain at least one number")
});

export const registerUser = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  const { name, email, password } = validation.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    const { hash, salt } = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        provider: 'credentials',
        auth: {
          create: {
            password: hash,
            salt,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      JWT_SECRET,
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user,
        expiresIn: 3600, // Helpful for frontend
      },
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};
