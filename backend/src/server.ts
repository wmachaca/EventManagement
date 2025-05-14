import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import passport from './config/passport';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import eventRoutes from './api/routes/eventRoutes';
import authRoutes from './api/routes/authRoutes';
import { filterAuthData } from './api/middleware/security';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // Load environment variables

const app: Application = express();

// Configure CORS
const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

// Middlewares
app.use(express.json());
app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(filterAuthData());

// Serve images statically
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server (unless testing)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
