import dotenv from 'dotenv';
dotenv.config(); // must be first so env vars are available to every import below

import connectDB from './config/db';
import { createApp } from './app';
import { registerObservers } from './patterns/observer/registerObservers';
import { configureWebPush } from './services/PushSubscriptionStore';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  configureWebPush();
  registerObservers(); // subscribe all observers to the EventBus

  const app = createApp();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
