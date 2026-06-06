import express, { Application } from 'express';
import cors from 'cors';
import { logger, notFound, errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import workoutRoutes from './routes/workoutRoutes';
import foodRoutes from './routes/foodRoutes';
import waterRoutes from './routes/waterRoutes';
import pushRoutes from './routes/pushRoutes';

// Separated from index.ts so the app can be imported in tests
// without starting a server or connecting to the database
export const createApp = (): Application => {
  const app = express();

  app.use(logger);
  // Explicit CORS so the Vite dev server on port 5173 can call the API
  app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
  app.use(express.json());

  app.get('/', (_req, res) => res.json({ message: 'Health Tracker API is running!' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/food', foodRoutes);     // singular /food to match frontend
  app.use('/api/water', waterRoutes);
  app.use('/api/push', pushRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
