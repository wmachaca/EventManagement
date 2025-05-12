import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../../database/client';
import { sanitizeUser } from '../../../utils/authUtils';

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!JWT_SECRET || !GOOGLE_CLIENT_ID) {
  throw new Error('FATAL: Missing environment variables');
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'No ID token provided' });
  }

  try {
    // 1. Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      return res.status(400).json({ message: 'Invalid Google token payload' });
    }

    const { sub: googleId, email, name } = payload;

    // 2. Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    // 3. If not, create the user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
      name: name || email.split('@')[0], // Fallback to email prefix if name is undefined
      provider: 'google', // This goes in User model
      googleId, // This goes in User model      
          auth: {
            create: {
            },
          },
        },
        include: { auth: true },
      });
    }

    // 4. Issue your own JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '1h' },
    );

    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({
      message: 'Google login failed',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
};
