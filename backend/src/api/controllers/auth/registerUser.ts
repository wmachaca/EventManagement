import { Request, Response } from 'express';
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
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUser = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: validation.error.errors 
    });
  }

  const { name, email, password } = validation.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

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
      JWT_SECRET
    );

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
};