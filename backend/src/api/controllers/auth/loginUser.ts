import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyPassword } from '../../../utils/password';
import { prisma } from '../../../database/client';
import { sanitizeUser } from '../../../utils/authUtils';

interface LoginBody {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET is not defined in .env');
}

export const loginUser = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { auth: true },
    });

    // Check if user exists and has auth record with password
    if (!user?.auth?.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, user.auth.password);
    if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      JWT_SECRET
    );

    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};