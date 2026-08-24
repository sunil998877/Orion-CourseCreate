import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectWithRetry = async (attempt = 1) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  const delayMs = Math.min(30000, 2000 * attempt);
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      family: 4,
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,
      maxPoolSize: 10,
    });
    console.log('✅ Connected to MongoDB');
    console.log(`MongoDB Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log(`Retrying MongoDB in ${delayMs / 1000}s (attempt ${attempt})...`);
    setTimeout(() => connectWithRetry(attempt + 1), delayMs);
  }
};

const connectDB = async () => {
  mongoose.set('bufferCommands', true);
  mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected. Reconnecting...');
    connectWithRetry();
  });
  await connectWithRetry();
};

export default connectDB;
