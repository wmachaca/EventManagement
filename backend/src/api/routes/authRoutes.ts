// src/api/routes/authRoutes.ts
import express from 'express';
import passport from '../../config/passport';
import { registerUser, loginUser, googleAuth } from '../controllers/authController';

const router = express.Router();

// Local Register & Login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  googleAuth,
);

export default router;
