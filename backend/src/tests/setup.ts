// Test setup — connects to your local MongoDB instead of downloading
// an in-memory binary (which takes forever on slow connections).
// Make sure MongoDB is running locally before running tests.

import mongoose from 'mongoose';

process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.VAPID_PUBLIC_KEY = 'BB20Rgc7asbGV3IVo_xky4wdB7SrieTkIOWpLEDwQuAMDBfF5kQenzuSKNs-rQWvK2HppolNhY4R3zsi51x5grk';
process.env.VAPID_PRIVATE_KEY = 'VndY2UqVyeEYwUTSjqwBbYdN-1xtQW0wKMupx4e4xMY';
process.env.VAPID_EMAIL = 'mailto:test@test.com';
process.env.MONGO_URI = 'mongodb://localhost:27017/healthtracker_test';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
});

// Clear all test data between tests so they don't interfere with each other
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Drop the test database and close connection when all tests finish
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
