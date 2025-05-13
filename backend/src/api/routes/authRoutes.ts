// src/api/routes/authRoutes.ts
import express from 'express';
import { registerUser, loginUser, googleLogin } from '../controllers/auth/index';

const router = express.Router();

// Local Register & Login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth
//manage in frontend using nextjs
router.post('/google', googleLogin);

export default router;
